
<script>
import { Application, Loader, Texture } from 'pixi.js-legacy';
import {
  el, diff, patch, Node,
} from '../lib';
import Tree from './Tree';
import utils from '../lib/utils';
/**
 * vroot 需要 是正常组件
 * 因为需要复用，所以在create时建立一个虚拟Node Tree
 * 如果传递了stage参数，则将stage视为Container来渲染，返回虚拟node null
 * 
 * 如果不传递参数stage 需要自行在内部创建一个Application，返回虚拟node h(‘div’)，在div中appendChild(stage.view)
 * 
 * 
 */
/**
 * 格式化class 比如 class中套class ，解析成正常的class
 * ：目前是每次渲染解析，感觉可以开局只解析一次
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
        utils.tryAssignData(data, newProps);
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
    /**
     * 每次渲染，为了实例间的互不影响，提供一个渲染环境，为options
     *      {
     *        class: 解析后的class列表
     *        texture：纹理集合数组，比如sprite的id对应texture。如果没有该参数则以src形式加载sprite
     *        sprite: [
     *          该参数初始化时为 []
     *          如果未找到对应src，则需要loader加载src，则向该参数中添加id和node
     *          避免多次加载同一图片，在此统一加载
     *         ]
     *      }
     */
    const $options = this.getOption($attrs);
    /**
     * 建立tree，最外层是直接视为要渲染的Container，不实际渲染
     */
    const node = new Node('container', {}, Node.handleVNode(this.$options._renderChildren));
    /**
     * 配置：执行一次，判断是否有参数stage。对应建立不同的vnode和渲染的Container
     */
    if (!$data.setup) {
      this.setup($attrs, h);
    }
    console.time();
    /**
     * 实际渲染Tree，fresh即没有则建立，有则patch
     */
    $data.Tree.fresh(node, $options);
    /**
     * 加载sprite
     */
    if ($options.sprite.length > 0) {
      $options.sprite.forEach(e => {
        new Loader().add(e.src, (resource) => {
          const { texture } = resource;
          e.nodes.forEach(node => {
            Render.update(node, 'sprite', { texture: Texture.Loading }, { texture }, $options, true);
          });
        }).load();
      });
    }
    console.timeEnd();
    return $data.vnode;
  },
  created() {
    const cls = {};
    const allClass = this.$parent.class || {};
    Object.keys(allClass).forEach(id => {
      cls[id] = formatClass(allClass[id], allClass);
    });
    this.$data.class = cls;
    this.$data.setup = false;
    this.$data.Tree = new Tree();
  },
  methods: {
    getOption($attrs) {
      return {
        texture: $attrs.texture,
        class: this.$data.class,
        sprite: [],
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
