import * as $ from 'pixi.js-legacy';
import diff from './diff';
import Node from './node';
import Render from './Render';
import nodes from './nodes';
import utils from './utils';
import patch from './patch';

const el = (...args) => new Node(...args);
export {
  diff,
  el,
  patch,
  Node,
};
