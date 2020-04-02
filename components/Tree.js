/**
 * vroot 被render时 提供一个命名空间保存树
 */
import {
  el, diff, patch, Node,
} from '../lib';

class Tree {
  constructor(stage) {
    this.tree = null;
    this.renderer = null;
    this.stage = stage;
  }

  fresh(tree) {
    let oldTree = this.tree;
    this.tree = tree;
    if (oldTree && this.renderer) {
      const pathches = diff(oldTree, tree);
      console.log(pathches);
      patch(this.renderer, pathches);
    }
    else {
      const real = tree.render();
      this.stage.addChild(real);
      this.renderer = real;
    }
    oldTree = null;
  }
}

export default Tree;
