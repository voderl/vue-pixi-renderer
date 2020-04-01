/**
 * vroot 被render时 提供一个命名空间保存树
 */
import {
  el, diff, patch, Node,
} from '../lib';

class Tree {
  constructor() {
    this.tree = null;
    this.renderer = null;
  }

  fresh(tree) {
    const oldTree = this.tree;
    this.tree = tree;
    if (oldTree && this.renderer) {
      const pathches = diff(oldTree, tree);
      console.log(pathches);
      patch(this.renderer, pathches);
    } else {
      // TODO:
      const real = tree.render();
      window.app.stage.addChild(real);
      this.renderer = real;
    }
  }
}

export default Tree;
