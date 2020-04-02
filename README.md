## vue-pixi
使用vue的结构来渲染pixi页面。

[`Vue.js`](https://vuejs.org)   
[`PIXI.js`](https://pixijs.io)

目前只是初步实现中...
> npm run start 

#### 实现
`vtext`、`sprite`、`container`对应pixi中的类型，以`functional: true`生成`Vue`函数组件。

在Vue生成VNode时，挂载Node虚拟节点而release VNode。
以`<vroot></vroot>`元素为最根部，vroot的render函数返回null从而创建独立的虚拟Node树。  
虚拟Node文件目录：`/libs` 。  
更改自[`simple-virtual-dom`](https://github.com/livoras/simple-virtual-dom)。

每次该组件重新渲染时，重新生成Node Tree，然后diff、patch。

向组件中传递的参数中
init 为 pixi node 在创建时触发的函数
start 为pixi node 加入到stage时 触发的函数
update 为 pixi node 每帧刷新时的函数

动画请在函数中直接控制node，而不是使用Vue传递一个不断变化的属性。(每次重新render都要遍历虚拟Node树，耗时较大);

(函数暂不能被更改)

其余皆为pixi属性，详情见[`pixiJS API DOCUMENT`](http://pixijs.download/release/docs/index.html)

## 目前示例

```jsx
<vroot :stage="$stage" :x="1" :class="100">
  <vtext :x=100>???</vtext>
  <vtext :x=0 :y=0>
    <vtext :x=300 :y=80 :text="time" :anchor="{x:0.5,y:0.5}" :style="{fill:'blue'}"></vtext>
  </vtext>
  <zone
    v-for="(enemy, index) in enemys" 
    :key="enemy.name" 
    :y="100 + 50*index"
    :width=400
    :height=50
    :radius=0.2
    :fillColor="'red'"
    :fillAlpha=0.6
  >
    <vtext
      v-for="(info, id, i) in enemy"
      :key="id"
      :x="100*i"
      :text="info"
      :width="100"
    ></vtext>
  </zone>
  <sprite :class="logo" :x=208 :y=208 :alpha='alpha' :anchor='{x: 0.5,y:0.5}' :init='loop' :update='rotate'>logo</sprite>
</vroot>
<vroot :width=300 :height=300 >
  <sprite>logo</sprite>
  <vtext :text="time"></vtext>
</vroot>
```
![示例](./_docs/template.png)
