import {
  Sprite,
  Container,
  Text,
  TextStyle,
  Graphics,
  utils as pixiUtils,
  Loader,
  Texture,
  BaseTexture,
  resources,
} from 'pixi.js-legacy';
import utils from './utils';
/**
 * 生成默认样式字体。
 * 注意指定textStyle后生成的样式不是基于此默认样式，而是基于pixi的默认样式。(为了一点性能)；
 */
const defaultStyle = new TextStyle({
  fill: 'white',
});
defaultStyle.isDefault = true;
/**
 * 生成Texture加载样式
 */
function createText(text, fontSize = 22, fillStyle = 'black', width = 100, height = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = fillStyle;
  context.font = `${fontSize}px sans-serif`;
  context.textBaseline = 'middle';
  const w = context.measureText(text).width;
  context.fillText(text, (width - w) / 2, height / 2);
  return new Texture(new BaseTexture(new resources.CanvasResource(canvas)));
}
Texture.Loading = createText('Loading...', 22);
Texture.Error = createText('Error!', 40, 'red');
/**
 * list Class
 */
class List {
  constructor(defaultData) {
    this.default = typeof defaultData === 'object' ? defaultData : {};
    this.types = {};
  }

  extend(id, data = {}) {
    const newData = utils.clone(this.get(id));
    utils.deepAssign(newData, data);
    this.types[id] = newData;
  }

  get(id) {
    let data = this.types;
    if (!data[id]) return this.default;
    return data[id];
  }
}
/**
 * renderList 生成元素时 tagName从此处生成。
 * 如果直接附带vnode里的参数可以避免二次更新。(可能有一点作用)
 * value算是<text>value</text>里面的那个值
 */
const renderList = {
  container(vnode) {
    return new Container();
  },
  sprite() {
    return new Sprite();
  },
  text(vnode, value) {
    // 更新text时会比对是否发生变化，在此先生成，后续再设置也不会让dirty = true而更新
    const text = value || vnode.data.attrs.text || '';
    return new Text(text, defaultStyle);
  },
  zone() {
    return new Graphics();
  },
};
/**
 * attrList 来确定 对attr的处理方式。
 */
const fitNode = (node, fit) => {
  if (typeof fit !== 'object') return;
  if (fit instanceof Array) {
    fitNode(node, { zone: fit });
    return;
  }
  let { zone } = fit;
  const { ratio, type = 'center' } = fit;
  if (zone.length === 2) {
    if (node.$x === undefined) {
      node.$x = node.x;
      node.$y = node.y;
    }
    zone = [node.$x || 0, node.$y || 0, ...zone];
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
};
const parseToArray = (str, length, separator = ',') => {
  if (typeof str !== 'string') return str;
  const arr = str.split(separator);
  if (arr.length === 1) {
    const v = parseFloat(arr[0]) || 0;
    if (length !== undefined) {
      return new Array(length).fill(v);
    }
  }
  return arr.map((v) => parseFloat(v) || 0);
};
const attrList = new List({
  x(el, value = 0) {
    el.x = value;
    // 为了fit，fit之后x，y改变，避免造成定位失败。
    el.$x = value;
  },
  y(el, value = 0) {
    el.y = value;
    el.$y = value;
  },
  anchor(el, value = [0, 0]) {
    let [x, y] = parseToArray(value, 2);
    el.anchor.set(x, y);
  },
  scale(el, value = [1, 1]) {
    let [x, y] = parseToArray(value, 2);
    el.scale.set(x, y);
  },
  tint(el, value = 0xffffff) {
    el.tint = utils.getColor(value);
  },
  fit(el, value) {
    el.fit = value;
  },
  /**
   * 当有attrs里面的值被更新时
   * @param {DisplayObject} el
   * @param {object} oldAttrs
   * @param {object} attrs
   */
  $dirty(el, oldAttrs, attrs) {
    if (attrs.fit) {
      fitNode(el, attrs.fit);
    }
  },
});
attrList.extend('text', {
  /**
   * value更改时的处理函数
   * @param {DisplayObject} el
   * @param {string} value
   */
  $value(el, value = '') {
    el.text = value;
  },
  text(el, value = '') {
    el.text = value;
  },
});

attrList.extend('sprite', {
  src(el, value = '') {
    const cache = pixiUtils.TextureCache;
    if (cache[value]) {
      el.texture = cache[value];
      return;
    }
    el.texture = Texture.Loading;
    const loader = new Loader();
    loader.add(value, (resource) => {
      const { texture } = resource;
      /** vue调试中输入错误路径能成功获取，但获取到的是根目录网页内容，在此判别 */
      if (!(texture instanceof Texture)) {
        console.error(
          `路径'${value}'成功加载资源，但资源不是图片，可能是vue调试中错误路径重定向到主页面`,
          resource.data,
        );
        el.texture = Texture.Error;
        window.ico = resource.data;
      } else el.texture = texture;
      fitNode(el, el.fit);
      loader.destroy();
    });
    loader.onError.add((err) => {
      el.texture = Texture.Error;
      console.error('加载错误', err);
    });
    loader.load();
  },
});

/**
 * styleList 处理style的方式
 */
const styleList = new List();
styleList.extend('text', {
  setup(el, oldStyle, newStyle) {
    if (el.style.isDefault) {
      /**
       * 处理style之前的处理，text的生成为了避免创建textStyle，统一使用一个。
       * 当某个text的样式不一样，再基于样式生成。
       */
      el.style = new TextStyle(newStyle);
    }
  },
  update(el, key, value) {
    el.style[key] = value;
  },
  remove(el, key) {
    el.style[key] = defaultStyle[key];
  },
});
styleList.extend('zone', {
  update() {},
  remove() {},
  /**
   * 当有属性更新时执行的函数。即重新绘制zone，性能较差
   * @param {DisplayObject} el
   * @param {object} oldStyle
   * @param {object} newStyle
   */
  dirty(el, oldStyle, newStyle) {
    el.clear();
    let {
      width = 100,
      height = 100,
      radius = 0.2,
      fillColor = 0x0,
      fillAlpha = 1,
      lineWidth = 0,
      lineColor = 0xff0000,
      lineAlpha = 1,
      alignment = 1,
    } = newStyle;
    fillColor = utils.getColor(fillColor);
    lineColor = utils.getColor(lineColor);
    if (typeof radius !== 'number') radius = parseFloat(radius);
    if (typeof width !== 'number') width = parseInt(width);
    if (typeof height !== 'number') height = parseInt(width);
    el.beginFill(fillColor, fillAlpha);
    el.lineStyle(lineWidth, lineColor, lineAlpha, alignment);
    if (radius) {
      if (!Number.isInteger(radius)) radius *= Math.min(width, height);
      el.drawRoundedRect(0, 0, width, height, radius);
    } else el.drawRect(0, 0, width, height);
    el.endFill();
  },
});

export { renderList, attrList, utils, styleList };
