import { Graphics, utils as pixiUtils } from 'pixi.js-legacy';
import nodes from './nodes';
import utils from './utils';
import textures from './texture';

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
const Render = {
  types: {},
  default: {
    formatProps: {
      init: true,
      update: true,
      start: true,
      event: true,
      fit: true,
      show: true,
    },
    updateProps: {},
  },
  /**
   * class中class的嵌套 在vroot中解析 成allClass
   * class为数组或对象 在node.js renderVNode中解析
   * 在此解析 class的排列， 后面的class覆盖前面的class，属性中存在的覆盖class
   * @param {object} props
   * @param {object} allClass
   */
  formatClass(props, allClass) {
    const cls = props.staticClass || props.class;
    let data = props;
    if (typeof cls === 'string') {
      data = utils.clone(props);
      if (data.class) delete data.class;
      if (data.staticClass) delete data.staticClass;
      cls
        .split(' ')
        .reverse()
        .forEach((_class) => {
          if (typeof allClass[_class] === 'object') {
            utils.tryAssignData(data, allClass[_class]);
          }
        });
    }
    return data;
  },
  /**
   * 解析props，解析成生成node的格式，比如 { x:1,event：{} } => {event:{},data: {x: 1} }
   * formatProps 中的属性 都不处理到data
   * 如果是函数则参数为 (值，options环境, 解析到的对象)
   * 如果函数有返回值，则为解析的值
   * @param {string} type - type
   * @param {object} rawprops - 尚未格式化的props
   * @param {options} options - 格式化props的环境，具体见vroot
   */
  formatProps(type, rawprops, options) {
    const data = this.get(type, 'formatProps');
    const props = this.formatClass(rawprops, options.class);
    const newProps = {};
    const newData = {};
    for (const id in props) {
      if (data[id] === undefined) {
        if (props[id] !== undefined) {
          newData[id] = props[id];
        }
      } else if (typeof data[id] === 'function') {
        const result = data[id](props[id], options, newProps, newData);
        if (result !== undefined) newProps[id] = result;
      } else newProps[id] = props[id];
    }
    if (Object.keys(newData).length > 0) newProps.data = newData;
    return newProps;
  },
  /**
   * 更新实际pixi元素，返回realNode则表明更新成功，返回一个新的node将取代原先node
   * updateProps: 为true表明需要重新生成
   * 如果为函数则自定义处理方式返回false 无需再更新 返回true 重新生成
   * 注意Graphics的重新生成，相当于重新绘制(可能有bug
   * @param {object} realNode - pixi元素
   * @param {string} type - type类型
   * @param {object} oldProps - 更新前未解析的值
   * @param {object} patches - 更新的值
   * @param {object} options - 渲染环境
   * @param {boolean} formatted - oldProps和patches是否已经格式化
   */
  update(realNode, type, oldProps, patches, options, formatted) {
    const formattedPatches = formatted ? patches : this.formatProps(type, patches, options);
    const oldData = formatted ? oldProps : this.formatProps(type, oldProps, options);
    // utils.assignData(newData, formattedPatches);
    const list = this.get(type, 'updateProps');
    const isReRender = Object.keys(list).some((id) => {
      if (formattedPatches[id] === undefined) return false;
      return typeof list[id] === 'function'
        ? list[id](realNode, formattedPatches[id], oldData[id], options)
        : list[id];
    });
    if (!isReRender) {
      this.updateNode(realNode, oldData, formattedPatches);
      console.log('update');
      realNode.emit('$update');
      return realNode;
    }
    const newData = utils.clone(oldData);
    utils.assignData(newData, formattedPatches);
    if (realNode instanceof Graphics) {
      realNode.clear();
      console.log('reDraw Graphics');
      const { __type } = realNode;
      const typeData = nodes.types[__type];
      if (typeData.init) {
        typeData.init.call(realNode, newData);
      }
      this.updateNode(realNode, oldData, formattedPatches);
      if (oldData.init) {
        oldData.init.apply(realNode);
      }
      realNode.emit('$update');
      return realNode;
    }
    console.log('reRender');
    const data = this.get(type);
    if (typeof data.init === 'function') return data.init(newData, options);
    throw new Error('更新失败');
  },
  /**
   * 在options环境中 根据vnode生成实际pixi元素
   * @param {object} vnode
   * @param {object} options
   */
  create(vnode, options) {
    const { tagName, props } = vnode;
    const data = this.types[tagName];
    if (!data) throw new Error(`没有此类节点${tagName}`);
    const _props = this.formatProps(tagName, props, options);
    if (data.init) {
      const realNode = data.init(_props, options);
      this.fit(realNode, _props.fit);
      return realNode;
    }
    throw new Error(`${tagName}没有init函数`);
  },
  register(id, options) {
    this.types[id] = options;
    Object.keys(this.default).forEach((name) => {
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
    if (typeof data === 'function') {
      data(...args);
    }
  },
  /**
   * 已经生成好node之后，如果有fit则fit此node,
   * fit 为parent 则按parent  fit
   * fit.zone 为parent 也可
   * @param {object} node
   * @param {object|string} fit
   */
  fit(node, fit) {
    if (typeof fit !== 'object') return;
    if (fit instanceof Array) {
      this.fit(node, { zone: fit });
      return;
    }
    let { zone } = fit;
    const { ratio, type = 'center' } = fit;
    if (zone.length === 2) {
      zone = [0, 0, ...zone];
    }
    const [x, y, w, h] = zone;
    node.scale.set(1, 1);
    let minRatio;
    let maxRatio;
    let realRatio;
    if (ratio instanceof Array) {
      if (ratio.length === 1) [realRatio] = ratio;
      else [minRatio, maxRatio] = ratio;
    } else realRatio = ratio;
    if (!realRatio) {
      realRatio = Math.min(h / node.height, w / node.width);
      if (maxRatio) realRatio = Math.min(realRatio, maxRatio);
      if (minRatio) realRatio = Math.max(realRatio, minRatio);
    }
    node.scale.set(realRatio, realRatio);
    const value = {
      center: [0.5, 0.5],
      left: [0, 0.5],
      right: [1, 0.5],
      top: [0.5, 0],
      bottom: [0.5, 1],
    };
    const arr = value[type];
    if (!arr) throw new Error('type应填数组或center、left、right、top、bottom');
    const left = x + arr[0] * w - arr[0] * node.width;
    const top = y + arr[1] * h - arr[1] * node.height;
    node.position.set(left + node.anchor.x * node.width, top + node.anchor.y * node.height);
  },
  // patch update or formatter options update ？
  updateNode(node, oldData, changes = {}) {
    // 先默认 can update
    const { start, event, data, update, init } = changes;

    if (init) init.apply(node);
    if (start) {
      if (node.parent) start.init(node);
      else {
        node.once('added', start);
      }
    }
    if (update) {
      node._update = update;
      if (!oldData.update) nodes.activeNodes.push(node);
    }

    if (event) {
      Object.keys(event).forEach((name) => {
        if (oldData.event && oldData.event[name]) node.removeListener(name, oldData.event[name]);
        if (event[name]) node.addListener(name, event[name]);
        if (node._eventsCount === 0) this.setInteractive(node, false);
        else this.setInteractive(node, true);
      });
    }

    if (data) {
      utils.assignData(node, data);
    }
    // update fit
    if (oldData.fit) {
      if (changes.fit) utils.assignData(oldData.fit, changes.fit);
      this.fit(node, oldData.fit);
    }
  },
  /**
   * 当一个node的interactive改变时，需要向上直到root的interactiveChildren改变
   * 上级检测到没有child是interactive或interactiveChildren，就重设自身interactiveChildren
   * 主要是为了提高event传递的效率，如果interactiveChildren设置false就不会往下传递事件
   * @param {object} node
   * @param {boolean} value
   */
  setInteractive(node, value) {
    if (node.interactive === value) return;
    if (value !== undefined) node.interactive = value;
    else {
      let shouldInteractiveChildren = false;
      node.children.forEach((child) => {
        if (child.interactive || child.interactiveChildren) shouldInteractiveChildren = true;
      });
      if (node.interactiveChildren !== shouldInteractiveChildren) {
        node.interactiveChildren = shouldInteractiveChildren;
      }
    }
    if (!node.isRoot && node.parent) {
      this.setInteractive(node.parent);
    }
  },
};
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
Render.register('graphics', {
  init(props, options) {
    return nodes.getNode('graphics', props);
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

/**
 * 有一些clone 操作不能操作 texture值，因此应该在最终init时才生成(不能在format时生成
 * (但是是否需要update还要检测 啊好痛苦 啊好痛苦
 * 更新时需要确定Texture类型是否改变，比如从正常对象变为数组，从数组变成正常
 * (感觉又只能是邪道了(啊好痛苦
 */
Render.register('sprite', {
  init(props, options) {
    const { texture } = props;
    const get = textures.getTexture(texture, options);
    if (typeof get === 'function') {
      props.texture = textures.data.LOADING;
      const node = nodes.getNode('sprite', props);
      /** 再返回之前的数据，避免直接使用texture导致clone失败 */
      props.texture = texture;
      get(node, {
        tagName: 'sprite',
        props,
        formatted: true,
      });
      return node;
    }
    props.texture = get;
    return nodes.getNode('sprite', props);
  },

  formatProps: {
    src(data, options, newProps, newData) {
      newProps.texture = data;
      return undefined;
    },
    texture: true,
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
    texture(node, newValue, oldValue, options) {
      const newTexture = textures.getTexture(newValue, options);
      if (typeof newTexture === 'function') {
        // newTexture(node);
        return true;
      }
      if (node.textures && newTexture instanceof Array) {
        node.textures = newTexture;
        node.texture = newTexture[node.currentFrame];
        return false;
      }
      if (!node.textures && !(newTexture instanceof Array)) {
        node.texture = newTexture;
        return false;
      }
      return true;
    },
  },

  handleValue(node, value) {
    node.props.src = value;
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
