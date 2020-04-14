import { renderList, attrList } from "vueConfig";
import { DisplayObject } from "pixi.js-legacy";

const list = renderList;
/**
 * 在一个node被加入时，加入是从底到高被加入时。一般尽可能将
 * @param {DisplayObject} node
 */
function added(parent, node) {
  return;
}
const getValue = (vnode) => {
  if (!vnode.children || vnode.children.length !== 1) return null;
  const node = vnode.children[0];
  if (node.tag !== undefined || !node.text) return null;
  return node.text;
};

const updateValue = (textNode) => {
  const node = textNode.parent;
  if (!node) return;
  const data = attrList.get(node.tagName);
  if (typeof data.$value === "function") {
    data.$value(node, textNode.text);
  }
};

export function createElement(tagName, vnode) {
  if (!list[tagName]) throw new Error(`无${tagName}节点`);
  const node = list[tagName](vnode, getValue(vnode));
  node.tagName = tagName;
  return node;
}

export function createElementNS() {
  throw new Error("不应该创建NS");
}

export function createTextNode(text) {
  return {
    isTextNode: true,
    parent: null,
    text: text,
  };
}

export function createComment(text) {
  const node = new DisplayObject();
  node.name = "comment";
  node.text = text;
  return node;
}

export function insertBefore(parentNode, newNode, referenceNode) {
  // parentNode.insertBefore(newNode, referenceNode);
  const index = parentNode.getChildIndex(referenceNode);
  if (index === -1) throw new Error("插入时找不到");
  if (!newNode.isTextNode) parentNode.addChildAt(newNode, index);
  else {
    newNode.parent = parentNode;
    updateValue(newNode);
  }
  added(parentNode, newNode);
}

export function removeChild(node, child) {
  // node.removeChild(child);
  // child 是否destroy？
  node.removeChild(child);
}

export function appendChild(node, child) {
  // node.appendChild(child);
  if (!child.isTextNode) node.addChild(child);
  else {
    child.parent = node;
    updateValue(child);
  }
  added(node, child);
}

export function parentNode(node) {
  // return node.parentNode;
  return node.parent;
}

export function nextSibling(node) {
  const parent = node.parent;
  if (parent === null) return null;
  const childCount = parent.children.length;
  const index = parent.getChildIndex(node);
  if (index >= childCount - 1) return null;
  return parent.getChildAt(index + 1);
}

export function tagName(node) {
  return node.tagName;
}

export function setTextContent(node, text) {
  node.text = text;
  updateValue(node);
}

export function setStyleScope(node, scopeId) {
  node.setAttribute(scopeId, "");
}
