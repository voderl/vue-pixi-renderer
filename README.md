## vue-pixi-renderer

使用 vue 的结构来渲染 pixi 页面。
[`Vue.js`](https://vuejs.org)  
[`PIXI.js`](https://pixijs.io)

<!-- TOC -->

- [vue-pixi-renderer](#vue-pixi-renderer)
- [使用说明](#%e4%bd%bf%e7%94%a8%e8%af%b4%e6%98%8e)
  - [安装使用](#%e5%ae%89%e8%a3%85%e4%bd%bf%e7%94%a8)
  - [基本介绍](#%e5%9f%ba%e6%9c%ac%e4%bb%8b%e7%bb%8d)
    - [pixi 元素基本属性](#pixi-%e5%85%83%e7%b4%a0%e5%9f%ba%e6%9c%ac%e5%b1%9e%e6%80%a7)
    - [vroot](#vroot)
    - [container](#container)
    - [vtext](#vtext)
    - [sprite](#sprite)
    - [zone](#zone)
    - [graphics](#graphics)
  - [class 的使用](#class-%e7%9a%84%e4%bd%bf%e7%94%a8)
  - [fit 的使用：自适应大小](#fit-%e7%9a%84%e4%bd%bf%e7%94%a8%e8%87%aa%e9%80%82%e5%ba%94%e5%a4%a7%e5%b0%8f)
  - [event 的使用](#event-%e7%9a%84%e4%bd%bf%e7%94%a8)
  - [function 使用及淡入淡出效果的实现](#function-%e4%bd%bf%e7%94%a8%e5%8f%8a%e6%b7%a1%e5%85%a5%e6%b7%a1%e5%87%ba%e6%95%88%e6%9e%9c%e7%9a%84%e5%ae%9e%e7%8e%b0)
    - [function 中可使用的一些函数](#function-%e4%b8%ad%e5%8f%af%e4%bd%bf%e7%94%a8%e7%9a%84%e4%b8%80%e4%ba%9b%e5%87%bd%e6%95%b0)
  - [简单实例](#%e7%ae%80%e5%8d%95%e5%ae%9e%e4%be%8b)
  - [示例网站](#%e7%a4%ba%e4%be%8b%e7%bd%91%e7%ab%99)
  - [工程相关](#%e5%b7%a5%e7%a8%8b%e7%9b%b8%e5%85%b3)
    - [目前 BUG:](#%e7%9b%ae%e5%89%8d-bug)
    - [TODO：](#todo)
    - [更新日志：](#%e6%9b%b4%e6%96%b0%e6%97%a5%e5%bf%97)

<!-- /TOC -->

## 使用说明

**目前有很大不足，极有可能出现各种各样的 bug！**

**目前有较多 bug**

虚拟 Node 更改自[`simple-virtual-dom`](https://github.com/livoras/simple-virtual-dom)。

每次该组件重新渲染时，重新生成 Node Tree，然后 diff、patch。

动画请在函数中直接控制 node，而不是使用 Vue 传递一个不断变化的属性。(每次重新 render 都要遍历虚拟 Node 树，耗时较大);

其余皆为 pixi 属性，详情见[`PixiJS API Documentation`](http://pixijs.download/release/docs/index.html)

### 安装使用

**提醒： 目前有较多 bug**

```javascript
npm install -save vue-pixi-renderer
```

```javascript
import Vue from 'vue';
import VuePixiRenderer from 'vue-pixi-renderer';

Vue.use(VuePIXIRenderer);
```

### 基本介绍

1. `<vroot></vroot>`

以它为根部建立虚拟 node Tree

2. `<container></container>`

一个容器。(除 root 外的任何元素都可作为容器)

创建一个相对坐标系。

3. `<vtext>Text</vtext>`

显示字体

4. `<sprite>{src or id}</sprite>`

显示图片

5. `<zone></zone>`

创建一个区域

6. `<graphics></graphics>`

使用 pixi.Graphics 创建自定义的绘制，需使用 init 方法

除`<vroot></vroot>` 外的所有元素均可使用 pixiAPI 对应的各项数据

​ 比如 `<vtext :x=100 :y=100 :anchor='{x: 0.5, y: 0.5}'>Text</vtext>`

#### pixi 元素基本属性

- `x` - 坐标 x
- `y` - 坐标 y
- `anchor` - { x: number[0-1], y: number[0-1] } - 图片锚点相对图片宽高的位置，xy 均为 0.5 时为正中心。坐标 x、y 对应的点的位置也为锚点的位置。旋转中心点位置为锚点位置。
- `scale` - { x: number, y: number } - 放大倍数，sprite 的 width、height 属性与之关联。直接调整 width、height 也会变化 scale。
- `tint` - number - 色调，颜色为 hex 的实际值，如 0x0

#### vroot

```jsx
<template>
<vroot
:stage='$stage'
   在此传入stage，视为要渲染到的Container
   如果没有传入stage，则应提供创建pixi Application的参数，如width，height
   具体参数列表 http://pixijs.download/release/docs/PIXI.Application.html
:texture='$texture'
  在此传入texture，sprite标签中的id则从此对象里寻找
   {id1: Texture}    <sprite>id1</sprite>
{id2: [] of Texture}    <sprite :time='500'>id2</sprite>
	则应表现为500ms一帧的AnimateSprite
 如果没有传入参数，则<sprite>./img/logo.png</sprite>视作地址src，将会尝试以该地址加载图片.
 (请使用public里的图片路径，或import导入图片路径)
          >
   </vroot>
</template>
<script>
export default {
 created() {
    // 不应在data中赋值，避免生成响应式数据
   this.$stage = window.app.stage;
   this.$texture = myTextureObject
 },
};
</script>
```

#### container

```jsx
<container :x=100 :y=100 :anchor='{x: 0.5, y: 0.5}'></container>
```

#### vtext

```jsx
<vtext :style='{fill: '#ffffff', fontSize:'17px'}'></vtext>
```

具体 style 属性列表请访问

http://pixijs.download/release/docs/PIXI.TextStyle.html

#### sprite

sprite 如果要填写 src，请填写 public 路径里的位置或使用 import 导入图片。直接填写相对位置图片可能不能被正常导入。

具体是 id 还是 src，请查看 vroot 中 texture 值是否给出

```jsx
<sprite>src or id</sprite>
```

#### zone

```jsx
<zone
    :width=100
    :height=100
    :radius=0.2   [0~0.5]的一个值
    :fillColor='red'
    :fillAlpha=1  [0~1]
    :lineWidth=3	strokeLine的宽度
    :lineColor='blue'
    :lineAlpha=1  [0~1]
    :alignment=1	strokeLine相对zone的位置，如果为0.5线宽一半在里面，一半在外面
    				为1表明全部在外面
    >
</zone>
```

#### graphics

```jsx
<graphics
    :init='drawLine'
    >
</graphics>
<script>
    请不要写在methods里，methods里的方法会bind Vue的this
    data() {
        return {
            drawLine() {
                this.lineStyle(4, 0xFFFFFF, 1);
                this.moveTo(0, 0);
                this.lineTo(80, 50);
            }
        }
    }
</script>
```

更多绘制方法请看 http://pixijs.download/release/docs/PIXI.Graphics.html

### class 的使用

```jsx
<vtext class='status'>字体</vtext>

<script>
export default {
  name: 'xxx',
  class: {
    status: {
        class: 'font',
        style: {
            fontSize: '17px',
        },
    },
    font: {
        style: {
            fill: '#ffffff',
            fontFamily: 'sans-serif',
        },
    }
  },
  data() {
    return {};
  }
</script>
```

class 相当于一个包含所要填写属性的对象，class 里面的值可以填

正常情况下，属性中的值会覆盖 class 对应的属性，class 中的值也会覆盖掉内层引用 class 对应的值

### fit 的使用：自适应大小

1. 以某个区域自适应大小

```jsx
<vtext
    class="font"
    :fit="{zone:[x, y, width, height], ratio:[minRatio,maxRatio], 				:type="center"}"
>哈哈哈</vtext>
```

zone: 为区域的 x，y，width，height， 为数组长度如果为 2，则表明[width, height]。
也可直接使用`:fit='[width, height]'`写法

type：为在区域的基本位置

- Array： [dx，dy] dx,dy 均为 0~1 中的一个值，表明在区域的位置

- String: center, left, right, top, bottom

ratio: 放大的比例

- number ：锁定放大比例

- Array: [minRatio, maxRatio] 最小放大比例，最大放大比例

### event 的使用

```jsx
<zone
        v-for="(enemy, index) in enemys"
        :key="enemy.name"
        :y="3 + (lineHeight+3)*index"
        :$index='index'
        :class="['bg', { select: index === select}]"
        @pointerdown="clickIndex"
      >

      </zone>
methods: {
    clickIndex(event) {
        console.log(`you click ${event.target.$index}`)
      this.select = event.target.$index;
    },
}
```

如果使用 v-for 生成多个结构，如何确定点击了哪一个？

> 使用`:$index='index'` ,
> 如果仅仅使用`@pointertap="clickIndex(i)"`，每次重新刷新，函数都要重新更新，因为传入的是重新生成的一个匿名函数，使用`$index`，会直接在 pixi 属性元素中添加`$index`属性(\$确保不会覆盖正常属性)，这样在点击事件中，通过`event.target.$index` 即可访问到 index。

​

具体 event 列表

http://pixijs.download/release/docs/PIXI.Sprite.html#event:click

左侧 events 栏

pointer 是兼容 mouse 和 touch 的

- ​ pointerdown 按下

- ​ pointerup 松起

- pointermove 移动

- pointertap 点击

- pointerout 移出该元素

### function 使用及淡入淡出效果的实现

- :update 传入的方法 每帧执行一次，每秒 60 帧

- :init 传入的方法 在生成该 pixi 元素时执行

- :start 传入的方法，在 pixi 元素被加入时执行

- :show :hide
  - 如果传入 function
    - show: 在 init 之后执行.
    - hide: 第一个参数为回调函数。请传入一个使用第一个参数作为回调的异步函数(如下)。
  - 如果传入数字，则表明淡入或淡出时间  
    以下两种方式效果相同
  ```jsx
  <sprite :show=300 :hide=150>./img/logo.png</sprite>
  ```
  ```jsx
  <sprite :show='show' :hide='hide'>./img/logo.png</sprite>
  data() {
    return {
      show() {
        this.changeTo({
          alpha: 0,
        }, {
          alpha: 1,
        }, 300);
      },
      hide(cb) {
        this.changeTo({
          alpha: 0,
        }, 150, cb);
      }
    }
  }
  ```
  **注意，请不要写在 methods 里，methods 里的方法会 bind Vue 的 this**

```jsx
<sprite class="icon" :update="rotate">./img/logo</sprite>
<script>
    data() {
        return {
          rotate() {
        	this.angle += 1;
          },
        }
    }
</script>
```

#### function 中可使用的一些函数

```javascript
this.loop(from, to, time, (repeat = Infinity));
```

```jsx
<sprite
        :class="logo"
        :x=208 :y=208
        :anchor='{x: 0.5,y:0.5}'
        :init='loop'
 >./img/logo.png</sprite>
<script>
    data() {
        return {
          loop() {
            this.loop({
              alpha: 0,
            }, {
              alpha: 1,
            }, 1000);
          },
        }
    }
</script>
效果为透明度一直改变
```

```javascript
this.changeTo()
参数为2 个 为 to，time
参数为3个 to，rime， callback
		from，to， callback
参数为4个 from，to。time，callback
```

```javascript
this.tween();
/* 不填参数默认为以自己建立一个tween，填参数则以参数对象
具体使用方法见https://github.com/tweenjs/tween.js/blob/master/docs/user_guide.md */
this.tween()
  .to({ alpha: 1 }, 1000)
  .start();
```

### 简单实例

```jsx
<template>
  <vroot :stage="$stage" ref="good">
    <zone
      :x="20"
      :y="180"
      :width="100"
      :height="100"
      :radius="0.3"
      :fillAlpha="0.3"
      :lineWidth="5"
      lineColor="blue"
      :lineAlpha="0.3"
      @pointertap="clickMe"
    >
      <vtext class="text" :fit="[105, 105]">{{ button }}</vtext>
    </zone>
    <vtext class="text" :start="show">{{ str }}</vtext>
    <sprite class="logo" :update="rotate" :start="loop">{{ logo }}</sprite>
  </vroot>
</template>

<script>
import logo from "./logo.png";

const width = 300;
const height = 300;
export default {
  name: "test",
  class: {
    logo: {
      x: width / 2,
      y: height / 2,
      anchor: {
        x: 0.5,
        y: 0.5
      }
    },
    text: {
      style: {
        fontSize: "22px",
        fill: "red",
        fontFamily: "sans-serif"
      }
    }
  },
  data() {
    return {
      logo,
      width,
      height,
      str: "vue-pixi-renderer",
      button: "Click Me!",
      show() {
        this.changeTo(
          {
            x: 300,
            y: 300
          },
          {
            x: 0,
            y: 0
          },
          1000
        );
      },
      rotate() {
        this.angle += 1;
      },
      loop() {
        this.changeTo(
          {
            x: 0
          },
          {
            x: width / 2
          },
          1000
        );
        this.loop(
          {
            alpha: 0
          },
          {
            alpha: 1
          },
          1000
        );
      }
    };
  },
  created() {
    console.log(this);
    this.$stage = window.app.stage;
    window.test = this;
  },
  methods: {
    clickVue() {
      this.str = "you click Vue";
    },
    clickMe() {
      this.button = "you click me QAQ";
      setTimeout(() => {
        this.button = "Click Me!";
      }, 1000);
    }
  }
};
</script>

```

### [示例网站](https://www.voderl.cn/test/)

### 工程相关

index.js - vue 插件的导出

|— components ：vue 基本组件，functional 组件，和 虚拟 Tree 的实例

​ —— vroot 为基本组件，附带一个 Tree 的实例

​ —— 其余组件均为 functional 组件

|——lib

​ ——diff.js - 虚拟 node 树的 diff  
 ——extend.js - 为避免热重载 Ticker 一直增加导致动画变快而分离开

​ ——index.js - 整体模块的导出

​ ——node.js - 虚拟 Node 的创建及渲染 以及从 functional 的参数 h，context 中创建 node 的方法

​ ——nodes.js - pixi.js 基本元素的包装，增加的一些方法

​ —— patch.js - 虚拟 node 树的 patch

​ —— Render.js - 又一层包装，对一些参数的处理成 nodes.js 对应元素的参数，渲染 Node 由此处
—— texture.js - sprite 中默认系统 Sprite：Loading，error 和 加载图片后更新 node 的方法

​ —— utils.js - 一些 utils 函数，比如颜色，deep assign， clone

#### 目前 BUG:

- 由于没有显式指定 Key，在结构发生变化时，比如中间有几个元素消失时，diff 判断不是直接移除中间部分，而是逐个比对，导致后续元素使用 replace 而增大工作量。Vue 的 functional 没有 this，暂时没有找到给每一个元素一个单独 id 作为 key 的方案。
- 元素的复用有没有可能？清空一个元素再把值赋予？

#### TODO：

- 性能感觉不好。如果每帧渲染一次感觉是极大的负担，不建议更改属性完成某些动画操作。如何性能优化？不确定哪些属性更改了，要全盘比对，耗资源较大。感觉主要适用于一些 ui 的绘制。
- nodes 系统的更新，nodes 是之前用来做 mota-js-cli 的，就直接拿来用了，在这里面得多适配一层，可能影响性能。
- 性能如何优化？结构事先保存？只能生成再渲染，事先的数据全部给定
- 尝试性能优化，首先考虑去掉中间层，实在不行只能换平台了 233，可能 react 好一点？

#### 更新日志：

4-5：

- 默认将所有 node 的 interactiveChildren 设为 false，当一个 node 有事件时，向上将 parent 的 interactiveChildren 设置为 true
- 修复了 v-if 使用中不能正常 diff 的问题。
- 完善了图片路径加载的报错提示、热重载、以及用系统警告图片代替加载失败的图片等。
- 增加了异步删除逻辑，可以在一个元素 remove 时，传入:remove 函数实现消失动画。

4-7:

- 增加了 show，hide 方法，用 hide 来代替:remove
- 修复了 sprite 加载热重载的 bug

4-8:

- 删除了 fit 中的 parent 属性，因为只有 node 被加入后才能 fit，而 node 加入了 parent，parent 的尺寸也会发生变化，较为麻烦，而且极易产生 bug，不如直接抛弃。233
