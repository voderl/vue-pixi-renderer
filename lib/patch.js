import utils from './utils';
import Render from './Render';

const REPLACE = 0;
const REORDER = 1;
const PROPS = 2;
const TEXT = 3;
// 移除child可能是异步的, 而patch得出的index一般是根据虚拟树得出来的，虚拟树的child没有异步
// 因此可能虚拟树上已经移除了，但对应pixi元素还没有移除，因此需要在index增加isRemoving状态pixi节点中的数目
const removeChild = (parent, index) => {
  parent.delayed = parent.delayed || 0;
  const shouldBeRemoved = parent.getChildAt(index + parent.delayed);
  if (typeof shouldBeRemoved.removing === 'function') {
    parent.delayed += 1;
    shouldBeRemoved.isRemoving = true;
    shouldBeRemoved.removing(function() {
      this.parent.delayed -= 1;
      this._remove();
    });
  } else parent.removeChildAt(index + parent.delayed);
};
const addChild = (parent, insertNode, index) => {
  const delayed = parent.delayed || 0;
  parent.addChildAt(insertNode, index + delayed);
};
const methods = {
  REPLACE(newNode, oldNode) {
    const { parent } = oldNode;
    const delayed = parent.delayed || 0;
    const index = parent.getChildIndex(oldNode);
    if (index > -1) {
      // 因为有异步，也要调用
      removeChild(parent, index - delayed);
      addChild(parent, newNode, index - delayed);
      // parent.removeChildAt(index);
      // oldNode.remove();
      // parent.addChildAt(newNode, index);
    }
  },
  REORDER(node, moves, options) {
    /**
     * 由于有异步删除，使用delayed表明其已经触发删除但并未实际删除的node
     * 在index处理时加上 delayed
     */
    moves.forEach((move) => {
      const { index } = move;
      if (move.type === 0) {
        // remove
        removeChild(node, index);
        // if (typeof node.removing === 'function') {
        //   node.remove();
        //   // 表明还没删除，是异步删除
        //   if (!node._destroyed) delayed += 1;
        // }
        // else {
        //   const removed = node.removeChildAt(index + delayed);
        //   removed._remove();
        // }
      } else if (move.type === 1) {
        // insert
        // const insertNode = move.item.render(null, options);
        // node.addChildAt(insertNode, index + delayed);
        const insertNode = move.item.render(null, options);
        addChild(node, insertNode, index);
      }
    });
  },
  PROPS(realNode, props, oldNode, options) {
    const node = Render.update(
      realNode,
      oldNode.tagName,
      oldNode.props,
      props,
      options,
      oldNode.formatted,
    );
    if (node === realNode) return;
    oldNode = null;
    const removed = realNode.removeChildren();
    this.REPLACE(node, realNode);
    node.delayed = realNode.delayed;
    realNode._remove();
    if (removed.length > 0) {
      node.addChild(...removed);
    }
  },
  // 更新的全部改到 patch 里面，传递参数 ，统一管理！
};
function applyPatches(node, currentPatches, options) {
  currentPatches.forEach((currentPatch) => {
    switch (currentPatch.type) {
      case REPLACE:
        methods.REPLACE(currentPatch.node.render(null, options), node);
        break;
      case REORDER:
        methods.REORDER(node, currentPatch.moves, options);
        break;
      case PROPS:
        methods.PROPS(node, currentPatch.props, currentPatch.oldNode, options);
        break;
      case TEXT:
        throw new Error('此时不应该有Text');
      default:
        throw new Error(`Unknown patch type ${currentPatch.type}`);
    }
  });
}

function dfsWalk(node, walker, patches, options) {
  const currentPatches = patches[walker.index];

  const len = node.children ? node.children.length : 0;
  for (let i = 0; i < len; i++) {
    const child = node.children[i];
    if (!child.isRemoving) {
      walker.index += 1;
      dfsWalk(child, walker, patches, options);
    }
  }

  if (currentPatches) {
    applyPatches(node, currentPatches, options);
  }
}

const patch = (node, patches, options) => {
  const walker = { index: 0 };
  dfsWalk(node, walker, patches, options);
};

patch.patchOneNode = (node, patches, options) => {
  if (!(patches instanceof Array)) patches = [patches];
  patches.forEach((_patch) => {
    if (typeof _patch.type === 'string') {
      _patch.type = patch[_patch.type.toUpperCase()];
    }
  });
  applyPatches(node, patches, options);
};
patch.methods = methods;

patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;

export default patch;
