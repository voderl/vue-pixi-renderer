import {
  TextMetrics, TextStyle, Graphics, utils as pixiUtils, Loader, Texture,
} from 'pixi.js-legacy';
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
  formatClass(props, allClass) {
    const cls = props.staticClass || props.class;
    let data = props;
    if (typeof cls === 'string') {
      data = utils.clone(props);
      if (data.class) delete data.class;
      if (data.staticClass) delete data.staticClass;
      cls.split(' ').forEach(_class => {
        if (typeof allClass[_class] === 'object') {
          utils.assignData(data, allClass[_class]);
        }
      });
    }
    return data;
  },
  formatProps(type, rawprops, options) {
    const data = this.get(type, 'formatProps');
    const props = this.formatClass(rawprops, options.class);
    const newProps = {};
    const newData = {};
    for (const id in props) {
      if (data[id] === undefined) {
        if (props[id] !== undefined) newData[id] = props[id];
      }
      else if (typeof data[id] === 'function') {
        const result = data[id](props[id], options, newProps);
        if (result !== undefined) newProps[id] = result;
      }
      else newProps[id] = props[id];
    }
    newProps.data = newData;
    return newProps;
  },
  update(realNode, type, oldProps, patches, options, formatted) {
    const formattedPatches = formatted ? patches : this.formatProps(type, patches, options);
    const oldData = formatted ? oldProps : this.formatProps(type, oldProps, options);
    // utils.assignData(newData, formattedPatches);
    const list = this.get(type, 'updateProps');
    const isReRender = Object.keys(list).some((id) => {
      if (formattedPatches[id] === undefined) return false;
      return typeof list[id] === 'function' ? list[id](realNode, formattedPatches[id], oldData[id]) : list[id];
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
      if (typeData.init) {
        const newData = utils.clone(oldData);
        utils.assignData(newData, formattedPatches);
        typeData.init.call(realNode, newData);
      }
      this.updateNode(realNode, oldData, formattedPatches);
      if (oldData.init) {
        oldData.init.apply(realNode);
      }
      return realNode;
    }
    console.log('reRender');
    const data = this.get(type);
    if (typeof data.init === 'function') return data.init(newData, options);
    return null;
  },
  create(vnode, options) {
    const { tagName, props } = vnode;
    const data = this.types[tagName];
    if (!data) throw new Error(`没有此类节点${tagName}`);
    const _props = this.formatProps(tagName, props, options);
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
/**
 * register object list
 * init 为函数 ， 参数为处理过的props  返回realNode
 * handleValue 为当children有textNode时 即<text>well</text>时 对well值的处理
 * 
 * formatProps ： {
 *    列表里的值存在就表明 被格式化，从data中移除。
 *    如果为函数，则执行处理函数 参数为 对应的需要格式化的值   和   格式化的结果Object
 *    如果返回了值，则将新的值放入结果Object
 * }
 * 
 * updateProps: {
 *    如果为true 则 重新渲染一个node
 *    如果为false 则 不需要重新渲染(这时应该不填此属性)
 *    如果为函数 则 参数为 node  oldValue newValue ， 返回false 不需重新渲染 返回true 则 重新渲染
 * }
 */
Render.register('container', {
  init(props, options) {
    return nodes.getNode('container', props);
  },
});
Render.register('text', {
  init(props) {
    return nodes.getNode('text', props);
  },
  handleValue(node, value) {
    node.props.text = value;
  },
  formatProps: {
    style: true,
  },
  updateProps: {
    style(realNode, newValue) {
      utils.assignData(realNode.style, newValue);
      return false;
    },
  },
});


const getTexture = (id, options) => {
  const { texture } = options;
  if (texture) {
    if (texture[id]) return textures[id];
    console.error(`未发现${id}图片`);
  }
  else {
    const cache = pixiUtils.TextureCache;
    if (cache[id]) return cache[id];
    return function (node) {
      new Loader().add(id, (resource) => {
        const { texture } = resource;
        Render.update(node, 'sprite', { texture: Texture.Loading }, { texture }, options, true);
      }).load();
    };
  }
  return Texture.Wrong;
};


Render.register('sprite', {
  init(props, options) {
    const { texture } = props;
    if (typeof texture === 'function') {
      props.texture = Texture.Loading;
      const node = nodes.getNode('sprite', props);
      texture(node);
      return node;
    }
    return nodes.getNode('sprite', props);
  },

  formatProps: {
    texture(data, options) {
      return getTexture(data, options);
    },
  },

  updateProps: {
    time(node, newValue, oldValue) {
      node.animationSpeed = 1000 / newValue / 60;
      const oldFrame = Math.ceil((60 * oldValue) / 1000);
      const data = nodes.animationList[oldFrame];
      if (data) {
        const index = data.indexOf(node);
        if (index > -1) {
          data.splice(i, 1);
          nodes.addAnimation(Math.ceil((60 * newValue) / 1000), node);
        }
      }
      return false;
    },
    texture(node, newValue, oldValue) {
      if (typeof newValue !== typeof oldValue) return true;
      if (newValue instanceof Array) {
        node.textures = newValue;
        node.texture = newValue[node.currentFrame];
      }
      else node.texture = newValue;
      return false;
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
