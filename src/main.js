import * as $ from 'pixi.js-legacy';
import Vue from 'vue/dist/vue';
import TWEEN from '@tweenjs/tween.js';
import nodes from '../lib/nodes';
import show from './show.vue';
import book from './book.vue';
import VuePixiRenderer from '../index';
import utils from '../lib/utils';

Vue.use(VuePixiRenderer);
// window.diff = diff;
window.$ = $;
window.Vue = Vue;
window.main = {};
main.nodes = nodes;
main.utils = utils;
/**
 * set Application
 */
const app = new $.Application({
  width: 416,
  height: 416,
  antialias: true,
  transparent: true,
  resolution: 2,
});
window.app = app;
document.body.appendChild(app.view);
const width = Math.min(416, document.body.clientWidth);
app.view.style.width = `${width}px`;
app.view.style.height = `${width}px`;
const { stage } = app;
Object.defineProperty(stage, 'zone', {
  get() {
    return [0, 0, app.renderer.width, app.renderer.height];
  },
});

/**
 * drawBorder
 */
stage.addChild(
  nodes.getNode('border', {
    lineColor: 0x0,
    alignment: 0,
  }),
);

/**
 * laod Images
 */
main.textures = {};
main.vm = new Vue({
  render: (h) => h(book),
}).$mount('#app');
