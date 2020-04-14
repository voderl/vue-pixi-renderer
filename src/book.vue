<template>
    <zone :style="bg">
        <text
          v-if='enemys.length === 0'
          :fit='{zone:[0,0,width,height],ratio:[0, 2]}'
        >暂无怪物</text>
        <zone v-else
          v-for="(enemy, index) in enemys"
          :key="enemy.name"
          :x="10"
          :y="3 + (lineHeight+3)*index"
          :$index='index'
          :style="index === select ? selectZoneBg : zoneBg"
          @pointerdown.stop='clickIndex'
        >
          <sprite :x="lineHeight/2" :y="lineHeight/2" :width=32 :height=32 anchor="0.5" src="./logo.png"/>
          <text
            :fit="nameFit"
          >{{ enemy.name }}</text>
          <container :x="lineHeight+nameWidth" :y=0>
            <text :style="status">生命 {{ enemy.hp }}</text>
            <text :x=90 :style="status">攻击 {{ enemy.atk }}</text>
            <text :x=180 :style="status">防御 {{ enemy.def }}</text>
            <text :x=0 :y=20 :style="status">金币 {{ enemy.money }}</text>
            <text :x=90 :y=20 :style="status">伤害 {{ enemy.damage }}</text>
            <text :x=0 :y=40 :style="status">临界 {{ enemy.critical }}</text>
            <text :x=90 :y=40 :style="status">减伤 {{ enemy.criticalDamage }}</text>
            <text :x=180 :y=40 :style="status">1防 {{ enemy.defDamage }}</text>
          </container>

        </zone>
        <container
          :y="height-25"
        >
          <text
            :x='width/2-130'
            :style="bottomText"
            @pointerdown='beforePage'
          >上一页</text>
          <text :x="width/2-40">
          {{realPage + 1}} / {{maxPage}}
          </text>
          <text
            :value="100"
            :x='width/2+40'
            :style="bottomText"
            @pointerdown='nextPage'
          >下一页</text>
        </container>
        <text :width=90 :height=30 :x="width-100" :y="height-30"
          @pointerdown="closePanel"
        >返回游戏</text>
    </zone>
</template>

<script>
const width = 416;
const height = 416;
const lineHeight = 62;
const num = 6;
export default {
  name: "book",
  data() {
    return {
      nameFit: {
        zone:[lineHeight, 0, 70, 30], ratio:[0.4,0.8]
      },
      status: {
        fontSize: '17px',
        fill: '#ffffff',
        fontFamily: 'sans-serif',
      },
      bg: {
        radius: 0,
        fillColor: 0x0,
        fillAlpha:0.5,
        width: width,
        height: height,
      },
      zoneBg: {
        width: width - 20,
        height: lineHeight,
        fillAlpha: 0.4,
        radius: 0.2,
        fillColor: 0x0,
        lineWidth: 0,
      },
      selectZoneBg: {
        width: width - 20,
        height: lineHeight,
        fillAlpha: 0.4,
        radius: 0.2,
        fillColor: 0x0,
        lineColor: 0xffff00,
        lineWidth: 2
      },
      bottomText: {
        fill: 'black',
        fontSize: '22px',
      },
      width,
      height,
      num,
      page: 0,
      lineHeight,
      select: 0,
      nameWidth: 80
    };
  },
  created() {
    window.show = this;
  },
  computed: {
    enemys() {
      let { enemys } = this.$attrs.data;
      if (!(enemys instanceof Array)) enemys = [];
      return enemys.slice(
        this.num * this.realPage,
        this.num * (this.realPage + 1)
      );
    },
    realPage() {
      const page = this.page % this.maxPage;
      if (page >= 0) return page;
      return page + this.maxPage;
    },
    maxPage() {
      const { enemys } = this.$attrs.data;
      return Math.ceil(enemys.length / this.num);
    }
  },
  methods: {
    nextPage() {
      this.page += 1;
    },
    beforePage() {
      this.page -= 1;
    },
    closePanel() {
      console.log("you click closePanel2");
    },
    clickIndex(event) {
      if (event.target === null) return;
      this.select = event.target.$index;
    },
    console() {}
  }
};
</script>
