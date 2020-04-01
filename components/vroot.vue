<script>
import { el, diff, patch, Node } from '../lib';
import Tree from './Tree';
const tree = new Tree();
window.tree = tree;
export default {
  name: 'vroot',
  functional: true,
  render(h, cxt){
    const node = Node.renderVNode(h, cxt, 'container', true);
    console.time();
    tree.fresh(node);
    console.timeEnd();
    console.log('fresh');
    return null;
  },
}
</script>