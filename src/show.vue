<template>
  <div>
    <textarea v-model="time"></textarea>
    <vroot :stage="$stage" :x="1" class="100">
      <vtext :x=50>???</vtext>
      <vtext :x=0 :y=0>
        <vtext :x=300 :y=80 :text="time" :anchor="{x:0.5,y:0.5}" :style="{fill:'blue'}"></vtext>
      </vtext>
      <zone
        v-for="(enemy, index) in enemys"
        :key="enemy.name"
        :y="100 + 50*index"
        class="bg"
      >
        <vtext
          v-for="(info, id, i) in enemy"
          :key="id"
          :x="100*i"
          :text="info"
          :width="100"
        ></vtext>
      </zone>
      <sprite
        :class="logo"
        :x=208 :y=208
        :alpha='alpha'
        :anchor='{x: 0.5,y:0.5}'
        :init='loop'
        :update='rotate'>./img/logo.png</sprite>
    </vroot>
    <vroot :width=300 :height=300>
      <sprite class="logo">./img/logo.png</sprite>
      <vtext :text="time"></vtext>
    </vroot>
  </div>
</template>

<script>
import TWEEN from '@tweenjs/tween.js';

export default {
  name: 'show',
  data() {
    const width = 416; const
      height = 416;
    return {
      width,
      height,
      time: 0,
      logo: 0,
      alpha: 1,
      class: {
        logo: {
          x: 50,
          y: 60,
        },
        bg: {
          fillAlpha: 0.6,
          radius: 0.3,
          fillColor: 0x0,
          width: width * 0.9,
          height: Math.floor(height / 7),
          x: width * 0.05,
          anchor: {
            x: 0.5,
            y: 0.5,
          },
        },
      },
      rotate() {
        this.angle += 1;
      },
      loop() {
        this.loop({
          alpha: 0,
        }, {
          alpha: 1,
        }, 1000);
      },
      enemys: [
        {
          name: '史莱姆',
          atk: 10,
          def: 10,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        },
      ],
      enemyss: [
        {
          name: '史莱姆',
          atk: 10,
          def: 10,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        },
        {
          name: '绿色史莱姆',
          atk: 20,
          def: 30,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        }, {
          name: '绿色史姆',
          atk: 20,
          def: 30,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        }, {
          name: '绿史莱姆',
          atk: 20,
          def: 30,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        }, {
          name: '绿色史莱',
          atk: 20,
          def: 30,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        }, {
          name: '99',
          atk: 20,
          def: 30,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        }, {
          name: '100',
          atk: 20,
          def: 30,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        }, {
          name: '101',
          atk: 20,
          def: 30,
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          f: 6,
          g: 7,
        },
      ],
    };
  },
  mounted() {
    const changing = new TWEEN.Tween(this).to({
      alpha: 0,
    }, 1000).repeat(Infinity).yoyo(true);
    // changing.start();
  },
  created() {
    this.$stage = window.app.stage;
    main.show = this;
  },
  methods: {
    updateData(value) {
      console.log(value);
    },
  },
};
</script>
