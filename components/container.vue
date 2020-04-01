<script>
import { el, diff, patch, Node } from '../lib';
export default {
  name: 'container',
  functional: true,
  render: function(h, cxt) {
    return Node.renderVNode(h, cxt, 'container');
  },
}
</script>