import vtext from './components/vtext.vue';
import vroot from './components/vroot.vue';
import sprite from './components/sprite.vue';
import container from './components/container.vue';

const version = process.env.VERSION || require('./package.json').version;

const VuePixi = {
  install(Vue, options) {
    Vue.component('vtext', vtext);
    Vue.component('vroot', vroot);
    Vue.component('sprite', sprite);
    Vue.component('container', container);
  },
  version,
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VuePixi);
}

export default VuePixi;
