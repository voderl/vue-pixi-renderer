import {
  Ticker, Texture, BaseTexture, resources,
} from 'pixi.js-legacy';
import TWEEN from '@tweenjs/tween.js';
import diff from './diff';
import Node from './node';
import Render from './Render';
import nodes from './nodes';
import utils from './utils';
import patch from './patch';

/** 拓展TWEEN的destroy方法，在node（节点sprite）destroy时tween也destroy */
TWEEN.Tween.prototype.destroy = function () {
  if (this._isPlaying) this.stop();
  this._group = null;
  this._object = null;
  this._valuesStart = null;
  this._onUpdateCallback = null;
  this._onCompleteCallback = null;
  this._valuesEnd = null;
  this._easingFunction = null;
};

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
Texture.Wrong = createText('Wrong!', 22, 'red');

function createColor(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;

  const context = canvas.getContext('2d');

  context.fillStyle = color;
  context.fillRect(0, 0, 32, 32);
  return new Texture(new BaseTexture(new resources.CanvasResource(canvas)));
}


Ticker.shared.add(() => {
  TWEEN.update();
  nodes.update();
});
const el = (...args) => new Node(...args);
export {
  diff,
  el,
  patch,
  Node,
};
