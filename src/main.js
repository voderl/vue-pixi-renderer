import * as $ from 'pixi.js-legacy';
import Vue from 'vue/dist/vue';
import TWEEN from '@tweenjs/tween.js';
import nodes from '../lib/nodes';
import ui from './ui.vue';
import VuePixiRenderer from '../index';
import utils from '../lib/utils';
import diff from '../lib/diff';

Vue.use(VuePixiRenderer);
// window.diff = diff;
window.$ = $;
// window.book = book;
// window.test = test;

window.Vue = Vue;
window.main = {};
main.diff = diff;
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

/**
 * laod Images
 */
// const components = new CompenentsManager(app.stage);
// components.add(book);
// components.add(test);
// window.components = components;
// Vue.directive('test', {
//   bind() {
//     console.log('bind', arguments);
//   },
//   update() {
//     console.log('update', arguments);
//   },
// });
main.current = null;
main.ui = new Vue({
  render: (h) => h(ui),
}).$mount('#app');
main.closePanel = () => {
  window.ui.show(null);
};
main.drawBook = () => {
  window.ui.show('book', {
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
      {
        name: '第二页',
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
  });
};
main.drawBook();
