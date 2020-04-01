import Render from './Render';


function Node(type, properties, children) {
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
     * 用于一些打乱顺序的，安装key来对应而不是全盘更改
     */
  delete this.props.key;
  let count = 0;
  this.children = this.children.filter((child, i) => {
    if (child instanceof Node) {
      count += child.count;
      count += 1;
      return true;
    }
    if (typeof child === 'string') {
      Render.do(this, 'handleValue', child);
      return false;
    }
    throw new Error(`无法解析的child${child}`);
  });
  this.count = count;
}

Node.renderVNode = function (h, cxt, id, isRoot) {
  const { data, props, children } = cxt;
  Object.keys(data).forEach((id) => {
    if (id !== 'attrs') {
      if (!props[id]) props[id] = data[id];
      else throw new Error(`data${data}中的属性${id}在props${props}中已存在`);
    }
  });
  const node = new Node(id, props, this.handleVNode(children));
  this.releaseRenderContent(cxt);
  if (isRoot) {
    return node;
  }
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
    if (vnode.elm) {
      children[i] = vnode.elm;
      delete vnode.elm;
    } else if (!vnode.tag && vnode.text !== undefined) children[i] = vnode.text;
    else {
      console.log(vnode);
      throw new Error(`无法处理Vnode${vnode}`);
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

Node.prototype.render = function (options) {
  const node = Render.create(this, options);
  this.children.forEach((child) => {
    const childNode = child.render(options);
    node.addChild(childNode);
  });
  return node;
};

export default Node;
