import * as $ from 'pixi.js-legacy';
import Vue from 'vue/dist/vue';
import TWEEN from '@tweenjs/tween.js';
import nodes from '../lib/nodes';
import show from './show.vue';
import logo from './images/logo.png';
import VuePixi from '../index';
import utils from '../lib/utils';

Vue.use(VuePixi);
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
  resolution: 1,
});
window.app = app;
document.body.appendChild(app.view);
const width = document.body.clientWidth;
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
stage.addChild(nodes.getNode('border', {
  lineColor: 0x0,
  alignment: 0,
}));

/**
 * laod Images
 */
main.textures = {};
const loader = $.Loader.shared;
loader.add('logo', logo, (resource) => {
  const { texture } = resource;
  console.log(resource);
  main.textures[resource.name] = texture;
});
loader.onComplete.add(() => {
  main.vm = new Vue({
    render: (h) => h(show),
  }).$mount('#app');
});
loader.load();
