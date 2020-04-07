import { Ticker } from 'pixi.js-legacy';
import TWEEN from '@tweenjs/tween.js';
import diff from './diff';
import Node from './node';
import Render from './Render';
import nodes from './nodes';
import utils from './utils';
import patch from './patch';

/** 拓展TWEEN的destroy方法，在node（节点sprite）destroy时tween也destroy */
TWEEN.Tween.prototype.destroy = function() {
  if (this._isPlaying) this.stop();
  this._group = null;
  this._object = null;
  this._valuesStart = null;
  this._onUpdateCallback = null;
  this._onCompleteCallback = null;
  this._valuesEnd = null;
  this._easingFunction = null;
};

Ticker.shared.add(() => {
  TWEEN.update();
  nodes.update();
});
const el = (...args) => new Node(...args);
export { diff, el, patch, Node };
