import utils from './utils';
import Render from './Render';

const REPLACE = 0;
const REORDER = 1;
const PROPS = 2;
const TEXT = 3;
const methods = {
  REPLACE(newNode, oldNode) {
    const { parent } = oldNode;
    console.log('replace');
    const index = parent.getChildIndex(oldNode);
    if (index > -1) {
      parent.removeChildAt(index);
      oldNode.remove();
      parent.addChildAt(newNode, index);
    }
  },
  REORDER(node, moves, options) {
    moves.forEach((move) => {
      const { index } = move;
      if (move.type === 0) { // remove
        const removed = node.removeChildAt(index);
        removed.remove();
      }
      else if (move.type === 1) { // insert
        const insertNode = move.item.render(null, options);
        node.addChildAt(insertNode, index);
      }
    });
  },
  PROPS(realNode, props, oldNode, options) {
    const node = Render.update(realNode, oldNode.tagName, oldNode.props, props, options);
    if (node === realNode) return;
    oldNode = null;
    this.REPLACE(node, realNode);
  },
};
function applyPatches(node, currentPatches, options) {
  currentPatches.forEach((currentPatch) => {
    switch (currentPatch.type) {
      case REPLACE:
        methods.REPLACE(currentPatch.node.render(), node);
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

  const len = node.children
    ? node.children.length
    : 0;
  for (let i = 0; i < len; i++) {
    const child = node.children[i];
    walker.index += 1;
    dfsWalk(child, walker, patches, options);
  }

  if (currentPatches) {
    applyPatches(node, currentPatches, options);
  }
}

const patch = (node, patches, options) => {
  const walker = { index: 0 };
  dfsWalk(node, walker, patches, options);
};


patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;

export default patch;
