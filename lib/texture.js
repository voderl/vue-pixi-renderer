/**
 * 系统的一些Texture，和Texture的一些获取、sprite的更新
 */
import {
  Ticker, Texture, BaseTexture, resources, utils as pixiUtils, Loader,
} from 'pixi.js-legacy';

function createText(text, fontSize = 22, fillStyle = 'black', width = 100, height = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = fillStyle;
  context.font = `${fontSize}px sans-serif`;
  context.textBaseline = 'middle';
  const w = context.measureText(text).width;
  context.fillText(text, (width - w) / 2, height / 2);
  return new Texture(new BaseTexture(new resources.CanvasResource(canvas)));
}
Texture.Loading = createText('Loading...', 22);
Texture.Error = createText('Error!', 40, 'red');

function createColor(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;

  const context = canvas.getContext('2d');

  context.fillStyle = color;
  context.fillRect(0, 0, 32, 32);
  return new Texture(new BaseTexture(new resources.CanvasResource(canvas)));
}
const textures = {
  data: {
    LOADING: createText('Loading', 22),
    ERROR: createText('Error!', 40, 'red'),
  },
  getTexture(id, options) {
    if (typeof id === 'object') return id;
    const { texture } = options;
    if (this.data[id]) return this.data[id];
    if (texture) {
      if (texture[id]) return textures[id];
      console.error(`未发现${id}图片`);
      return this.data.ERROR;
    }
    const cache = pixiUtils.TextureCache;
    if (cache[id]) return cache[id];
    return function (node, vnode) {
      const { sprite } = options;
      const item = sprite.find(e => e.src === id);
      if (item) item.nodes.push([node, vnode]);
      else {
        sprite.push({
          src: id,
          nodes: [[node, vnode]],
        });
      }
      node = null;
    };
  },
  /**
   * sprite 是 options中附带的参数，返回需要加载的sprite { src: 'xxx', nodes: [xxx]}
   * 和加载成功或失败后需要更新的node数组.
   * 渲染更新 由于依赖cycle以参数传入
   * @param {object} $options
   */
  loadTexture($options, patch) {
    const loader = new Loader();
    $options.sprite.forEach(e => {
      loader.add(e.src, (resource) => {
        const { texture } = resource;
        /** vue调试中输入错误路径能成功获取，但获取到的是根目录网页内容，在此判别 */
        let { src } = e;
        if (!(texture instanceof Texture)) {
          src = 'ERROR';
          console.error(`路径'${e.src}'成功加载资源，但资源不是图片，可能是vue调试中错误路径重定向到主页面`, resource.data);
        }
        e.nodes.forEach(data => {
          const [node, vnode] = data;
          this.updateTexture(patch, node, vnode, src, $options);
        });
      });
      loader.onError.add((err) => {
        e.nodes.forEach(data => {
          const [node, vnode] = data;
          this.updateTexture(patch, node, vnode, 'ERROR', $options);
        });
        console.error('加载错误', err);
      });
    });
    loader.load();
  },
  updateTexture(patch, node, vnode, texture, options) {
    if (node._destroyed) return;
    patch.patchOneNode(node, {
      type: 'PROPS',
      props: {
        texture,
      },
      oldNode: vnode,
    }, options);
  },
};
export default textures;
