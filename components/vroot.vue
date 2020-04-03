
<script>
import { Application } from 'pixi.js-legacy';
import {
  el, diff, patch, Node,
} from '../lib';
import Tree from './Tree';
import utils from '../lib/utils';
/**
 * vroot 需要 是正常组件
 * 因为需要复用，所以必须一个vroot对应一个虚拟Node Tree
 * 如果不传递参数stage 需要自行在内部创建一个Application
 */
function formatClass(props, allClass) {
  const cls = props.staticClass || props.class;
  let data = props;
  if (typeof cls === 'string') {
    data = utils.clone(props);
    if (data.class) delete data.class;
    if (data.staticClass) delete data.staticClass;
    cls.split(' ').forEach(_class => {
      if (typeof allClass[_class] === 'object') {
        const newProps = formatClass(allClass[_class], allClass);
        utils.assignData(data, newProps);
      }
    });
  }
  return data;
}
export default {
  name: 'vroot',
  inheritAttrs: false,
  render(h) {
    const { $attrs, $data } = this;
    const $options = this.getOption($attrs);
    const node = new Node('container', {}, Node.handleVNode(this.$options._renderChildren));
    if (!$data.setup) {
      this.setup($attrs, h);
    }
    console.time();
    $data.Tree.fresh(node, $options);
    console.timeEnd();
    return $data.vnode;
  },
  created() {
    this.$data.class = this.$parent.class;
    this.$data.setup = false;
    this.$data.Tree = new Tree();
  },
  methods: {
    getOption($attrs) {
      const cls = {};
      const allClass = this.$parent.class || {};
      Object.keys(allClass).forEach(id => {
        cls[id] = formatClass(allClass[id], allClass);
      });
      return {
        texture: $attrs.texture,
        class: cls,
      };
    },
    setup($attrs, h) {
      const { $data } = this;
      $data.setup = true;
      if ($attrs.stage) {
        /**
         * to ensure hot replace module ,otherwise it will add multi renderer
         */
        console.log('set Stage');
        const removed = $attrs.stage.removeChildren();
        removed.forEach(child => child.remove());
        $data.Tree.stage = $attrs.stage;
        $data.vnode = null;
      }
      else {
        console.log('set App');
        const app = new Application({
          transparent: true,
          resolution: 1,
          ...$attrs,
        });
        $data.Tree.stage = app.stage;
        $data.app = app;
        $data.vnode = h('div');
      }
    },
  },
  mounted() {
    const { app } = this.$data;
    if (app) this.$el.appendChild(app.view);
  },
};
</script>
