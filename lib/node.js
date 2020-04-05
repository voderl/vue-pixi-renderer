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


const parseClass = (cls) => {
  const strArr = [];
  Object.keys(cls).forEach(_id => {
    const data = cls[_id];
    if (typeof data === 'object') {
      const parsed = parseClass(data);
      if (parsed) strArr.push(parsed);
    }
    else if (data) {
      if (data === true) strArr.push(_id);
      else strArr.push(data);
    }
  });
  return strArr.join(' ');
};
/**
 * 生成node最终返回一个vnode
 * 比如传递参数 data， props， listeners => 全部搞到 props里面
 * 同时解析class => 解析node的class 因为可能是数组 参数
 */

Node.renderVNode = function (h, cxt, id) {
  const { data, props, children } = cxt;
  Object.keys(data).forEach((id) => {
    if (id !== 'attrs' && id !== 'on') {
      if (!props[id]) props[id] = data[id];
      else throw new Error(`data${data}中的属性${id}在props${props}中已存在`);
    }
  });
  const event = cxt.listeners;
  if (Object.keys(event).length > 0) {
    props.event = event;
  }

  if (typeof props.class === 'object') {
    const parsed = parseClass(props.class);
    props.class = parsed;
  }
  const node = new Node(id, props, this.handleVNode(children));
  this.releaseRenderContent(cxt);
  /**
   * 检测到 !(node instanceof VNode) 就会自动生成一个空的VNode，所以需要返回vnode类型
   * vnode在某些函数中会clone， 因此不能新建属性，在此借用vnode的属性elm来传递 node
   * 传递用的vnode不用多个生成，它会被clone后处理的，没有异步应该可以一直使用this.vnode
   */
  if (!this.vnode) {
    const vnode = h();
    this.vnode = vnode;
  }
  this.vnode.elm = node;
  /** 不太清楚cxt有啥用，暂时把属性都清除了，以便回收 */
  return this.vnode;
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
 * 如果children的interactive都为false 和interactiveChildren false 就为false
 * TODO: 问题是如何响应式更改事件，事件改变时向上冒泡改变interactiveChildren
 * 如果删除事件 
 */
Node.prototype.render = function (container, options) {
  const stage = container || Render.create(this, options);
  let shouldInteractiveChildren = false;
  this.children.forEach((child) => {
    const childNode = child.render(null, options);
    if (childNode.interactive || childNode.interactiveChildren) shouldInteractiveChildren = true;
    stage.addChild(childNode);
  });
  stage.interactiveChildren = shouldInteractiveChildren;
  return stage;
};

export default Node;
