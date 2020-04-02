<template>
  <div>
    <textarea v-model="time"></textarea>
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
  </div>
</template>

<script>
import TWEEN from '@tweenjs/tween.js';
export default {
  name: 'show',
  data() {
    return {
      time: 0,
      logo: {
        x : 1,
      },
      radius: 0.2,
      alpha: 1,
      rotate() {
        this.angle += 1;
      },
      loop: function() {
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
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        }
        ],
      enemyss: [
        {
          name: '史莱姆',
          atk: 10,
          def: 10,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        },
        {
          name: '绿色史莱姆',
          atk: 20,
          def: 30,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        },{
          name: '绿色史姆',
          atk: 20,
          def: 30,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        },{
          name: '绿史莱姆',
          atk: 20,
          def: 30,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        },{
          name: '绿色史莱',
          atk: 20,
          def: 30,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        },{
          name: '99',
          atk: 20,
          def: 30,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        },{
          name: '100',
          atk: 20,
          def: 30,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        },{
          name: '101',
          atk: 20,
          def: 30,
          a:1,
          b:2,
          c:3,
          d:4,
          f:6,
          g:7,
        }
      ],
    }
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
    }
  }
}
</script>