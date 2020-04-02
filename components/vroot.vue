
<script>
import { el, diff, patch, Node } from '../lib';
import Tree from './Tree';
import { Application } from 'pixi.js-legacy';
/**
 * vroot 需要 是正常组件
 * 因为需要复用，所以必须一个vroot对应一个虚拟Node Tree
 * 如果不传递参数stage 需要自行在内部创建一个Application
 */
export default {
  name: 'vroot',
  inheritAttrs: false,
  render(h){
    const { $attrs, $data } = this;
    const node = new Node('container', {}, Node.handleVNode(this.$options._renderChildren));
    if (!$data.setup) {
      this.setup($attrs, h);
    }
    $data.Tree.fresh(node);
    return $data.vnode;
  },
  created() {
    this.$data.setup = false;
    this.$data.Tree = new Tree(); 
  },
  methods: {
    setup($attrs, h) {
      const { $data } = this;
      $data.setup = true;
      if ($attrs.stage) {
        $data.Tree.stage = $attrs.stage;
        $data.vnode = null;
      }
      else {
        const app = new Application({
          transparent: true,
          resolution: 1,
          ...$attrs,
        });
        $data.Tree.stage = app.stage;
        $data.app = app;
        $data.vnode = h('div');
      }
    }
  },
  mounted() {
    const app = this.$data.app;
    if (app) this.$el.appendChild(app.view); 
  }
}
</script>