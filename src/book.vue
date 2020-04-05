<template>
    <vroot :stage="$stage">
      <!--
        为什么要弄一个$index， 因为点击需要精确到点了哪一个框
        如果仅仅@pointertap="clickIndex(i)"，每次重新刷新，函数都要重新更新，因为传的是重新生成的
        一个匿名函数，弄一个$index，会直接在pixi属性元素中添加$index属性($确保不会覆盖正常属性)，
        这样在点击事件中，event.target.$index 即可访问到index
       -->
      <vtext
        v-if='enemys.length === 0'
        :fit='{zone:[0,0,width,height],ratio:[0, 2]}'
      >当前无怪物</vtext>
      <zone v-else
        v-for="(enemy, index) in enemys"
        :key="enemy.name"
        :y="3 + (lineHeight+3)*index"
        :$index='index'
        :class="['bg', { select: index === select}]"
        @pointerdown="clickIndex"
        :removing='hide'
        :start='show'
      >
        <sprite class="icon" :update="rotate" src='./img/logo.png'/>
        <vtext
          class="font"
          :fit="{zone:[lineHeight, 0, 70, 30], ratio:[0.4,0.8]}"
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
      <zone class="color" :width=90 :height=25 :x="width-100" :y="height-25"
        @pointertap="closePanel"
        :key=17
      >
        <vtext class="status" fit="parent">
          返回游戏
        </vtext>
      </zone>
      <graphics :x=50 :init="drawLine"
        :key=20
      ></graphics>
    </vroot>
</template>

<script>
import logo from './logo.png';

export default {
  name: 'book',
  data() {
    const width = 416; const
      height = 416;
    const lineHeight = 62;
    const num = 6;
    return {
      logo,
      width,
      height,
      num,
      lineHeight,
      status: true,
      select: 0,
      rotate() {
        this.angle -= 1;
      },
      drawLine() {
        this.lineStyle(4, 0x0, 1);
        this.moveTo(0, 0);
        this.lineTo(80, 50);
      },
      show() {
        this.changeTo({
          alpha: 0,
        }, {
          alpha: 1,
        }, 150);
      },
      hide(cb) {
        this.changeTo({
          alpha: 0,
        }, 100, cb);
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
          lineWidth: 0,
          x: 10,
          anchor: {
            x: 0.5,
            y: 0.5,
          },
        },
        select: {
          lineWidth: 2,
          lineColor: 0xffff00,
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
        {
          name: '小白兔',
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
        {
          name: '小白',
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
        {
          name: '小兔',
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
        {
          name: '白兔',
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
        {
          name: '小白兔007是我是我是我是我',
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
      console.log('you click closePanel2');
    },
    clickIndex(event) {
      this.select = event.target.$index;
    },
    console() {
      console.log('1');
    },
  },
};
</script>
