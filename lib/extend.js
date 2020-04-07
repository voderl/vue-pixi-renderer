/**
 * 将Ticker 独立出来，avoid HMR add ticker repeatedly
 */
import { Ticker } from 'pixi.js-legacy';
import TWEEN from '@tweenjs/tween.js';
import nodes from './nodes';

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
