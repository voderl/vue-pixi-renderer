/**
 * extend Sprite to Node
 * 拓展pixi的基础sprite,text等 增加原型方法
 * 使用tween做补间动画
 */
import * as $ from 'pixi.js-legacy';
import TWEEN from '@tweenjs/tween.js';
import utils from './utils';

/**
 * nodes 系统
 * @namespace
 */
const nodes = {
  /** 每进行一帧，frames += 1 */
  frames: 0,
  /** 需要更新的node，每帧更新一次 */
  activeNodes: [],
  Renders: {},
  types: {},
  /**
   * 主体更新进程
   */
  update() {
    const node = this.activeNodes;
    if (node.length === 0) return;
    this.activeNodes = node.filter(e => {
      if (e._destroyed) return false;
      if (e.parent !== null) {
        e._update();
        return true;
      }
      return true;
    });
  },
  /**
   * 加入原型链中的方法
   */
  default: {
    /**
     * 获取一个Tween，此tween并未直接开始，由于直接使用tween，不会在node被remove后自动删除掉
     * 因此通过此函数获取tween
     * @param {*} to - 转变后的状态
     * @param {*} time - 转换时间
     * @param {Object} [data = this] - 要转换的对象，默认为本身，如果要改scale，就设置为node.scale
     */
    tween(data = this) {
      if (!this.tweens) this.tweens = [];
      const changing = new TWEEN.Tween(data);
      this.tweens.push(changing);
      return changing;
    },
    /**
     * 参数为两个  to time
     * 3个  to time callback  ||  from to time
     * 4个  from to time callback
     */
    changeTo(from, to, time, callback) {
      this.tweens = this.tweens || [];
      const { length } = arguments;
      if (length <= 2 || (length === 3 && typeof time === 'function')) {
        callback = time;
        time = to;
        to = from;
      } else Object.assign(this, from);
      const changing = new TWEEN.Tween(this).to(to, time);
      if (callback) changing.onComplete(callback);
      changing.start();
      this.tweens.push(changing);
      return changing;
    },
    loop(from, to, time, repeat = Infinity) {
      this.tweens = this.tweens || [];
      Object.assign(this, from);
      const changing = new TWEEN.Tween(this)
        .to(to, time)
        .repeat(repeat)
        .yoyo(true);
      changing.start();
      this.tweens.push(changing);
      return changing;
    },
    // 删除过程参数 可被更改与自定义
    remove(easing, cb) {
      if (this._removing) return null;
      this._removing = true;
      if (typeof easing === 'function') {
        return easing(() => {
          this._remove(cb);
        });
      }
      return this._remove();
    },
    // 实际上的删除
    _remove(cb) {
      const { parent, tweens, destroyOptions, children } = this;
      if (children.length !== 0) {
        const oldChildren = this.removeChildren(0, children.length);
        for (let i = 0; i < oldChildren.length; ++i) {
          oldChildren[i].remove();
        }
      }
      if (parent) parent.removeChild(this);
      if (typeof cb === 'function') cb();
      if (tweens) {
        tweens.forEach(tween => {
          tween.destroy();
        });
        this.tweens = null;
      }
      this.destroy(destroyOptions);
    },
    destroyOptions: {
      children: true,
      texture: false,
      baseTexture: false
    }
  },
  /**
   * 注册一个类型， obj为该类型执行的参数
   * @param {string} name - name
   * @param {Object} obj - 参数
   */
  register(name, obj) {
    this.types[name] = obj;
    if (typeof obj.register === 'function') {
      obj.register();
    }
  },
  /**
   * 注册一个constructor，该function原型由给定原型和 default里的函数 和附加的一些函数组成
   * @param {string} name - 注册constructor的名字
   * @param {string|Object} proto - 注册原型的prototype 或者 在pixi中的名字
   * @param {Object} add - 附加的函数
   */
  registerRender(name, proto, add) {
    if (name instanceof Array) return name.forEach(_name => this.registerRender(_name));
    let data = Object.create(this.default);
    if (typeof add === 'object') data = Object.assign(data, add);
    if (typeof proto !== 'function') proto = $[proto] || $[name];
    const Render = this.getRender(proto);
    for (const n in data) {
      if (Render.prototype[n]) console.warn(`${name}在注册Render时已有同名属性${n}`);
      else Render.prototype[n] = data[n];
    }
    this.Renders[name] = Render;
    return Render;
  },
  /**
   * 生成constructor, 是否 直接生成一个node顺利一点?
   * @constructor
   */
  getRender(RenderPrototype) {
    if (RenderPrototype.prototype) RenderPrototype = RenderPrototype.prototype;
    function node(...args) {
      RenderPrototype.constructor.call(this, ...args);
    }
    node.prototype = Object.create(RenderPrototype);
    node.prototype.constructor = node;
    return node;
  },
  defaultShow(node, time) {
    node.changeTo(
      {
        alpha: 0
      },
      {
        alpha: 1
      },
      time
    );
  },
  updateNode(realNode, oldData, changes = {}) {},
  /**
   * Graphics 的重新更新
   */
  setNode(node, options = {}) {
    const { start, event, data, update, init, show } = options;
    if (typeof init === 'function') init.apply(node);
    if (show !== undefined) {
      if (typeof show === 'function') {
        node.on('added', show);
      } else {
        const time = parseInt(show, 10);
        this.defaultShow(node, time);
      }
    }
    // 添加start
    if (typeof start === 'function') {
      if (node.parent) start.init(node);
      else node.once('added', start);
    }
    // 添加update 如果 有
    if (typeof update === 'function') {
      node._update = update;
      this.activeNodes.push(node);
    }
    if (typeof event === 'object') {
      node.interactive = true;
      Object.keys(event).forEach(name => {
        node.addListener(name, event[name]);
      });
    }
    if (typeof data === 'object') {
      utils.assignData(node, data);
    }
    options = null;
    return node;
  },

  getNode(type, options) {
    let node;
    let haveOptions = true;
    if (!options) {
      options = {};
      haveOptions = false;
    }
    const typeData = this.types[type];
    // 生成函数
    if (typeof typeData.Render === 'function') {
      node = typeData.Render(this.Renders, options);
    } else node = new this.Renders[typeData.Render]();
    node.__type = type;
    if (typeData.init && typeData.init.call(node, options)) return node;
    if (!haveOptions || options.disable) return node;
    return this.setNode(node, options);
  }
};
nodes.registerRender(['Sprite', 'AnimatedSprite', 'Text', 'Graphics', 'TilingSprite']);

nodes.register('text', {
  Render(Renders, { text, style }) {
    const node = new Renders.Text(text, style);
    return node;
  }
});
nodes.register('sprite', {
  Render(Renders, { animate, texture, time = 500 }) {
    if (texture instanceof Array) {
      const node = new Renders.AnimatedSprite(texture);
      node.animationSpeed = 1000 / time / 60;
      node.play();
      return node;
    }
    return new Renders.Sprite(texture);
  }
});

nodes.register('tilingSprite', {
  Render(Renders, { texture }) {
    return new Renders.TilingSprite(texture);
  },
  init({ width, height }) {
    if (!width && !height) {
      this.once('added', () => {
        const [x, y, w, h] = this.parent.zone;
        this.width = w;
        this.height = h;
      });
      return;
    }
    this.width = width;
    this.height = height;
  }
});

nodes.register('zone', {
  Render: 'Graphics',
  init({
    width,
    height,
    radius,
    fillColor = 0x0,
    fillAlpha = 1,
    lineWidth = 0,
    lineColor = 0xff0000,
    lineAlpha = 1,
    alignment = 1
  }) {
    if (fillColor && !Number.isInteger(fillColor)) fillColor = utils.getColor(fillColor);
    if (!Number.isInteger(lineColor)) lineColor = utils.getColor(lineColor);
    this.beginFill(fillColor, fillAlpha);
    this.lineStyle(lineWidth, lineColor, lineAlpha, alignment);
    if (radius) {
      if (!Number.isInteger(radius)) radius *= Math.min(width, height);
      this.drawRoundedRect(0, 0, width, height, radius);
    } else this.drawRect(0, 0, width, height);
    this.endFill();
  }
});

nodes.register('graphics', {
  Render: 'Graphics'
});

nodes.registerRender('Container');
nodes.register('container', {
  Render: 'Container'
});
export default nodes;
