import patch from './patch';

const listDiff = require('list-diff2');

const diff = function (oldTree, newTree) {
  const index = 0;
  const patches = {};
  dfsWalk(oldTree, newTree, index, patches);
  return patches;
};

function dfsWalk(oldNode, newNode, index, patches) {
  const currentPatch = [];

  // Node is removed.
  if (newNode === null) {
    // Real DOM node will be removed when perform reordering, so has no needs to do anthings in here
  // TextNode content replacing
  } else if (typeof oldNode === 'string' && typeof newNode === 'string') {
    if (newNode !== oldNode) {
      currentPatch.push({ type: patch.TEXT, content: newNode });
    }
  // Nodes are the same, diff old node's props and children
  } else if (
    oldNode.tagName === newNode.tagName
      && oldNode.key === newNode.key
  ) {
    // Diff props
    const propsPatches = diffProps(oldNode, newNode);
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches });
    }
    // Diff children. If the node has a `ignore` property, do not diff children
    if (!isIgnoreChildren(newNode)) {
      diffChildren(
        oldNode.children,
        newNode.children,
        index,
        patches,
        currentPatch,
      );
    }
  // Nodes are not the same, replace the old node with new node
  } else {
    currentPatch.push({ type: patch.REPLACE, node: newNode });
  }

  if (currentPatch.length) {
    patches[index] = currentPatch;
  }
}

function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
  const diffs = listDiff(oldChildren, newChildren, 'key');
  newChildren = diffs.children;

  if (diffs.moves.length) {
    const reorderPatch = { type: patch.REORDER, moves: diffs.moves };
    currentPatch.push(reorderPatch);
  }

  let leftNode = null;
  let currentNodeIndex = index;
  oldChildren.forEach((child, i) => {
    const newChild = newChildren[i];
    currentNodeIndex = (leftNode && leftNode.count)
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1;
    dfsWalk(child, newChild, currentNodeIndex, patches);
    leftNode = child;
  });
}

function findDiff(oldProps, newProps, propsPatches, count = 0, depth = 0) {
  if (depth >= 10) throw new Error('diff中 diff了10层也没diff完，害怕有闭环，先报错了再说');
  let key;
  let value;
  let newValue;
  for (key in oldProps) {
    value = oldProps[key];
    newValue = newProps[key];
    if (value !== newValue) {
      if (typeof value === 'object' && typeof newValue === 'object') {
        const data = {};
        if (findDiff(value, newValue, data, 0, depth++)) {
          count += 1;
          propsPatches[key] = data;
        }
      } else {
        count += 1;
        propsPatches[key] = newValue;
      }
    }
  }
  for (key in newProps) {
    value = newProps[key];
    if (!oldProps.hasOwnProperty(key)) {
      count += 1;
      propsPatches[key] = newProps[key];
    }
  }
  return count;
}
function diffProps(oldNode, newNode) {
  const oldProps = oldNode.props;
  const newProps = newNode.props;
  const propsPatches = {};
  if (findDiff(oldProps, newProps, propsPatches)) return propsPatches;
  return null;
}

function isIgnoreChildren(node) {
  return (node.props && node.props.hasOwnProperty('ignore'));
}

export default diff;
