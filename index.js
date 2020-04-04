import vtext from './components/vtext.vue';
import zone from './components/zone.vue';
import vroot from './components/vroot.vue';
import sprite from './components/sprite.vue';
import graphics from './components/graphics.vue';
import container from './components/container.vue';

/* eslint-disable */
const version = process.env.VERSION || require('./package.json').version;
/* eslint-enable */

const VuePixiRenderer = {
  install(Vue, options) {
    Vue.component('vtext', vtext);
    Vue.component('vroot', vroot);
    Vue.component('zone', zone);
    Vue.component('sprite', sprite);
    Vue.component('graphics', graphics);
    Vue.component('container', container);
  },
  version,
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VuePixiRenderer);
}

export default VuePixiRenderer;
