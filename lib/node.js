import Render from './Render';
import utils from './utils';


function Node(type, properties, children, options) {
  let props = properties;
  if (props instanceof Array) {
    props = {};
    children = properties;
  }
  this.tagName = type;
  this.props = props || {};
  this.children = children || [];
  this.key = this.props.key;
  /**
     * key属性在这里赋值给key后就再无作用了
     * 用于一些打乱顺序的，因此在这里处理key
     * 为了避免 diff造成浪费，应该在这里对props 处理 class 即把class里的值assign 
     * 更好的方法其实是传递class ？ 只记录名称来diff ？ 传递一个class表到 render在格式化的时候再计算 ?
     * 直接计算好class更方便一点
     */
  if (this.props.key) delete this.props.key;
  let count = 0;
  this.children = this.children.filter((child, i) => {
    /**
     * 这里不能用 instance 更改此文件 会重新执行，导致新的function Node实现
     * child instanceof Node === false 
     */
    if (child.tagName) {
      count += child.count;
      count += 1;
      return true;
    }
    if (typeof child === 'string') {
      Render.do(this.tagName, 'handleValue', this, child);
      return false;
    }
    throw new Error(`无法解析的child${child}`);
  });
  this.count = count;
}

Node.renderVNode = function (h, cxt, id) {
  const { data, props, children } = cxt;
  Object.keys(data).forEach((id) => {
    if (id !== 'attrs') {
      if (!props[id]) props[id] = data[id];
      else throw new Error(`data${data}中的属性${id}在props${props}中已存在`);
    }
  });
  const event = cxt.listeners;
  if (Object.keys(event).length > 0) props.event = event;
  const node = new Node(id, props, this.handleVNode(children));
  this.releaseRenderContent(cxt);
  const vnode = h();
  vnode.elm = node;
  /** 不太清楚cxt有啥用，暂时把属性都清除了，以便回收 */
  return vnode;
};

Node.handleVNode = function (children) {
  if (!children) return children;
  const len = children.length;
  for (let i = 0; i < len; i++) {
    const vnode = children[i];
    if (typeof vnode === 'object' && !(vnode instanceof Node)) {
      if (vnode.elm) {
        children[i] = vnode.elm;
        vnode.elm = null;
      }
      else if (!vnode.tag && vnode.text !== undefined) children[i] = vnode.text;
      else {
        console.log(vnode);
        throw new Error(`无法处理Vnode${vnode}`);
      }
    }
  }
  return children;
};

Node.releaseRenderContent = function (cxt) {
  cxt.children = null;
  cxt.parent = null;
  cxt.data = null;
  cxt.props = null;
};

/**
 * 渲染进一个Container 默认root元素不会render，但不清楚 patch时会不会有bug
 */
Node.prototype.render = function (container, options) {
  const stage = container || Render.create(this, options);
  this.children.forEach((child) => {
    const childNode = child.render(null, options);
    stage.addChild(childNode);
  });
  return stage;
};

export default Node;
