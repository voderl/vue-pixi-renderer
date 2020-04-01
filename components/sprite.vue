<script>
import { el, diff, patch, Node } from '../lib'
export default {
  name: 'sprite',
  functional: true,
  /**
   * 检测到 !(node instanceof VNode) 就会自动生成一个空的VNode，所以需要返回vnode类型
   * vnode在某些函数中会clone， 因此不能新建顺序，只能借用vnode的属性elm来传递 node
   */
  render(h, cxt){
    return Node.renderVNode(h, cxt, 'sprite');
  }
}
</script>