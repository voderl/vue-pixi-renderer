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
          name: '小白兔007',
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
      console.log('you click closePanel');
    },
  },
};
</script>
