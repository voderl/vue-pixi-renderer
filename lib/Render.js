import { TextMetrics, TextStyle } from 'pixi.js-legacy';
import nodes from './nodes';
import utils from './utils';

const text = {
  default: new TextStyle({
    fontStyle: 'normal',
    fill: '#ffffff',
    stroke: 'blue',
    fontFamily: 'sans-serif',
    strokeThickness: 1,
    breakWords: true,
  }),
  calText(text, style, wordWrap) {
    const realStyle = this.getTextStyle(style);
    return TextMetrics.measureText(text, realStyle, wordWrap);
  },
  getTextStyle(style, options) {
    if (!options) {
      if (style instanceof TextStyle) return style;
      const newStyle = this.default.clone();
      if (style instanceof Object) {
        Object.keys(style).forEach(id => {
          newStyle[`_${id}`] = style[id];
        });
      }
      return newStyle;
    }
    if (!(style instanceof TextStyle)) return this.default.clone();
    const _newStyle = style.clone();
    if (options instanceof Object) {
      Object.keys(options).forEach(id => {
        _newStyle[`_${id}`] = options[id];
      });
    }
    return _newStyle;
  },
};
window.text = text;
const moveProp = (from, to, id) => {
  if (typeof id === 'object') id.forEach((_id) => moveProp(from, to, _id));
  else if (from[id]) {
    to[id] = from[id];
    delete from[id];
  }
};
const Render = {
  types: {},
  default: {
    handleProps(props) {
      props = utils.clone(props);
      const newProps = {};
      moveProp(props, newProps, ['init', 'event', 'start', 'update']);
      newProps.data = props;
      return newProps;
    },
  },
  style: {
    width: 416,
    height: 416,
  },
  create(node, options) {
    const { tagName, props } = node;
    const data = this.types[tagName];
    if (!data) throw new Error(`没有此类节点${tagName}`);
    let _props = this.default.handleProps(props);
    const result = this.do(node, 'handleProps', _props);
    if (result) _props = result;
    if (data.init) {
      const realNode = data.init(_props, options);
      return realNode;
    }
    throw new Error(`${tagName}没有init函数`);
  },
  createTextNode() {

  },
  register(id, option) {
    this.types[id] = option;
  },
  do(node, func, ...args) {
    if (typeof node === 'string') throw new Error(`${node}不能为字符串`);
    const id = node.tagName;
    const data = this.types[id];
    if (!data) throw new Error(`没有此类节点${id}`);
    if (typeof data[func] === 'function') {
      return data[func](node, ...args);
    }
    return null;
    // return console.warn(`${id}没有${func}函数`);
  },
};
/**
 * 创建的时候仅仅创建，加入的时候再根据父级变化
 * 或者是？ 按顺序创建加入
 */
/**
 * props: {
 *   x,y
 *  anchor: {
 *    x:
 *    y:
 *  data
 * }
 * 
 *   left，top， right， bottom 定位 
 * }
 */
Render.register('container', {
  init(props, options) {
    return nodes.getNode('container', props);
  },
});
Render.register('text', {
  init(props) {
    // console.log(props);
    return nodes.getNode('text', props);
  },
  handleValue(node, value) {
    node.props.text = value;
  },
});
const getTexture = (id) => {
  const { textures } = main;
  if (textures[id]) return textures[id];
  throw new Error(`未发现${id}资源图片`);
};
Render.register('sprite', {
  init(props) {
    console.log(props);
    const node = nodes.getNode('sprite', props);
    return node;
  },
  handleProps(node, props) {
    const { data } = props;
    props.texture = getTexture(data.texture);
    delete data.texture;
  },
  handleValue(node, value) {
    node.props.texture = value;
  },
});
window.Render = Render;
export default Render;
