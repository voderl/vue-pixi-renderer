<template>
  <vroot :stage='$stage' ref='good'>
    <zone
      :x=20
      :y=180
      :width=100
      :height=100
      :radius=0.3
      :fillAlpha=0.3
      :lineWidth=5
      lineColor="blue"
      :lineAlpha=0.3
      @pointertap='clickMe'
    >
      <vtext class='text' :fit='[105, 105]'>{{ button }}</vtext>
    </zone>
    <vtext class='text' :start='show'>{{ str }}</vtext>
    <sprite class="logo" :update='rotate' :start='loop'>{{ logo }}</sprite>
  </vroot>
</template>

<script>
import logo from './logo.png'

export default {
  name: 'test',
  data() {
    const width = 300;
    const height = 300;
    return {
      logo,
      width,
      height,
      str: 'vue-pixi-renderer',
      button: 'Click Me!',
      class: {
        logo: {
          x: width / 2,
          y: height / 2,
          anchor: {
            x: 0.5,
            y: 0.5,
          }
        },
        text: {
          style: {
            fontSize: '22px',
            fill: 'red',
            fontFamily: 'sans-serif',
          }
        },
      },
      show() {
        this.changeTo({
          x: 300,
          y: 300,
        },{
          x: 0,
          y: 0,
        }, 1000);
      },
      rotate() {
        this.angle += 1;
      },
      loop() {
        this.changeTo({
          x: 0,
        }, {
          x: width / 2,
        }, 1000);
        this.loop({
          alpha: 0,
        }, {
          alpha: 1,
        }, 1000);
      },
    }
  },
  created() {
    console.log(this);
    this.$stage = window.app.stage;
    window.test = this;
  },
  methods: {
    clickVue() {
      this.str = 'you click Vue';
    },
    clickMe() {
      this.button = 'you click me QAQ';
      setTimeout(() => {
        this.button = 'Click Me!'
      }, 1000);
    }
  }
}
</script>
