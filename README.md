## vue-pixi-renderer
使用vue的结构来渲染pixi页面。

[`Vue.js`](https://vuejs.org)   
[`PIXI.js`](https://pixijs.io)

目前只是初步实现中...
> npm run start 

### [示例网站](https://www.voderl.cn/test/)

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
<template>
  <div>
    <vroot :stage="$stage">
      <zone
        v-for="(enemy, index) in enemys"
        :key="enemy.name"
        :y="3 + (lineHeight+3)*index"
        class="bg"
      >
        <sprite class="icon" :update="rotate">{{ enemy.icon }}</sprite>
        <vtext class="font"
          :x="lineHeight"
          :style="{fontSize:'20px', fill:'#ff0'}"
        >{{ enemy.name }}</vtext>
        <container :x="lineHeight+nameWidth" :y=0>
          <vtext class="status">生命 {{ enemy.hp }}</vtext>
          <vtext :x=90 class="status">攻击 {{ enemy.atk }}</vtext>
          <vtext :x=180 class="status">防御 {{ enemy.def }}</vtext>
          <vtext :x=0 :y=20 class="status">金币 {{ enemy.money }}</vtext>
          <vtext :x=90 :y=20 class="status">伤害 {{ enemy.damage }}</vtext>
          <vtext :x=0 :y=40 class="status">临界 {{ enemy.critical }}</vtext>
          <vtext :x=90 :y=40 class="status">减伤 {{ enemy.criticalDamage }}</vtext>
          <vtext :x=180 :y=40 class="status">1防 {{ enemy.defDamage }}</vtext>
        </container>
      </zone>
      <zone class="color" :width=90 :height=25 :x="width-100" :y="height-25">
        <vtext class="status" @pointertap="closePanel">
          返回游戏
        </vtext>
      </zone>
    </vroot>
  </div>
</template>

<script>
export default {
  name: 'show',
  data() {
    const width = 416; const
      height = 416;
    const lineHeight = 62;
    const num = 6;
    return {
      width,
      height,
      num,
      lineHeight,
      rotate() {
        this.angle += 1;
      },
      nameWidth: 80,
      class: {
        font: {
          style: {
            fill: '#ffffff',
            fontFamily: 'sans-serif',
          },
        },
        color: {
          fillAlpha: 0.7,
          radius: 0.3,
          fillColor: 0x0,
        },
        status: {
          class: 'font',
          style: {
            fontSize: '17px',
          },
        },
        icon: {
          width: 32,
          height: 32,
          x: lineHeight / 2,
          y: lineHeight / 2,
          anchor: {
            x: 0.5,
            y: 0.5,
          },
        },
        bg: {
          class: 'color',
          width: width - 20,
          height: lineHeight,
          x: 10,
          anchor: {
            x: 0.5,
            y: 0.5,
          },
        },
      },
      enemys: [
        {
          name: '史莱姆',
          icon: './img/logo.png',
          hp: 35,
          atk: 10,
          def: 10,
          damage: 1,
          money: 0,
          experience: 0,
          point: 0,
          special: 0,
          critical: 1,
          criticalDamage: '?',
          defDamage: '?',
        },
        /** 多个 */
      ],
    };
  },
  created() {
    this.$stage = window.app.stage;
    main.show = this;
  },
  methods: {
    closePanel() {
      if (this.enemys.length > 0) {
        this.enemysBK = this.enemys;
        this.enemys = [];
      }
      else {
        this.enemys = this.enemysBK;
      }
      console.log('you click closePanel');
    },
  },
};
</script>

```
![示例](./_docs/template.png)

### [示例网站](https://www.voderl.cn/test/)
