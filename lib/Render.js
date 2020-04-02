import { TextMetrics, TextStyle, Graphics } from 'pixi.js-legacy';
import nodes from './nodes';
import utils from './utils';

/**
 * 实际渲染node， 处理data 处理attr 处理， 
 * 先创建自己 ，
 * 渲染node时，传递一个style来渲染
 * 
 * 更新时：{
 *  更新参数： re-render， {
 *    grpahics： clear 再 draw
 *    texture： 直接换掉，
 *  }
 *  更新init：直接执行
 *  更新update：如果之前有就直接改_update，没有就加入更新队列
 *  更新start： 直接执行start
 *  更新event： 如果之前有就 removeListener  再增加  
 * }
 * 
 * TODO:
 * Render 的formatter  解析 缓存
 * Render Node参数 不再每次都重新解析 ， 直接在本层解析为默认值
 */
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
const Render = {
  types: {},
  default: {
    formatProps: {
      init: false,
      update: false,
      start: false,
      event: false,
    },
    updateProps: {

    },
  },
  style: {
    width: 416,
    height: 416,
  },
  formatProps(type, props) {
    const data = this.get(type, 'formatProps');
    const newProps = {};
    const newData = {};
    for (const id in props) {
      if (data[id] === undefined) {
        newData[id] = props[id];
      }
      else if (typeof data[id] === 'function') {
        const result = data[id](props[id], newProps);
        if (result !== undefined) newProps[id] = result;
      }
      else newProps[id] = props[id];
    }
    newProps.data = newData;
    return newProps;
  },
  update(realNode, type, oldProps, patches) {
    const formattedPatches = this.formatProps(type, patches);
    const oldData = this.formatProps(type, oldProps);
    const newData = utils.clone(oldData);
    utils.assignData(newData, formattedPatches);
    const list = this.get(type, 'updateProps');
    const isReRender = Object.keys(list).some((id) => {
      if (newData[id] === oldData[id]) return false;
      return typeof list[id] === 'function' ? list[id](realNode, oldData[id], newData[id]) : list[id];
    });
    if (!isReRender) {
      this.updateNode(realNode, oldData, formattedPatches);
      console.log('update');
      return realNode;
    }
    if (realNode instanceof Graphics) {
      realNode.clear();
      console.log('reDraw Graphics');
      const { __type } = realNode;
      const typeData = nodes.types[__type];
      if (typeData.init) typeData.init.call(realNode, newData);
      this.updateNode(realNode, oldData, formattedPatches);
      return realNode;
    }
    console.log('reRender');
    const data = this.get(type);
    if (typeof data.init === 'function') return data.init(newData);
    return null;
  },
  create(node, options) {
    const { tagName, props } = node;
    const data = this.types[tagName];
    if (!data) throw new Error(`没有此类节点${tagName}`);
    const _props = this.formatProps(tagName, props);
    if (data.init) {
      const realNode = data.init(_props, options);
      return realNode;
    }
    throw new Error(`${tagName}没有init函数`);
  },
  register(id, options) {
    this.types[id] = options;
    Object.keys(this.default).forEach(name => {
      if (!options[name]) options[name] = this.default[name];
      else if (typeof options[name] === 'object' && typeof this.default[name] === 'object') {
        options[name] = Object.assign(Object.create(this.default[name]), options[name]);
      }
    });
  },
  get(type, id) {
    if (typeof type !== 'string') throw new Error(`${type}需为字符串，类型`);
    const data = this.types[type];
    if (!data) throw new Error(`没有此类节点${type}`);
    if (!id) return data;
    return data[id];
  },
  do(type, func, ...args) {
    const data = this.get(type, func);
    if (typeof this.default[func] === 'function') {
      this.default[func](...args);
    }
    if (typeof data === 'function') {
      data(...args);
    }
  },
  // patch update or formatter options update ？
  // formatter how to format options ？
  updateNode(node, oldData, options = {}) {
    // 先默认 can update
    const {
      start, event, data, update, init,
    } = options;

    if (init) init.apply(node);
    if (start) {
      if (node.parent) start.init(node);
      else {
        if (oldData.start) node.removeListener('added', oldData.start);
        node.addListener('added', start);
      }
    }
    if (update) {
      node._update = update;
      if (!oldData.update) nodes.activeNodes.push(node);
    }

    if (event) {
      Object.keys(event).forEach((name) => {
        if (oldData.event && oldData.event[name]) node.removeListener(name, oldData.event[name]);
        else if (event[name]) node.addListener(name, event[name]);
      });
    }

    if (data) {
      utils.assignData(node, data);
    }
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
    const node = nodes.getNode('sprite', props);
    return node;
  },

  formatProps: {
    texture(data) {
      return getTexture(data);
    },
  },

  updateProps: {
    time(time) {

    },
  },

  handleValue(node, value) {
    node.props.texture = value;
  },
});

Render.register('zone', {
  init(props) {
    const node = nodes.getNode('zone', props);
    return node;
  },
  /**
   * 格式化属性, 如果为函数则返回 函数对应值
   */
  formatProps: {
    width: true,
    height: true,
    radius: true,
    fillColor: true,
    fillAlpha: true,
    lineWidth: true,
    lineColor: true,
    lineAlpha: true,
    alignment: true,
  },

  /**
   * 
   */
  updateProps: {
    width: true,
    height: true,
    radius: true,
    fillColor: true,
    fillAlpha: true,
    lineWidth: true,
    lineColor: true,
    lineAlpha: true,
    alignment: true,
  },

  handleValue(node, value) {
    node.props.fillColor = value;
  },
});
window.Render = Render;
export default Render;
