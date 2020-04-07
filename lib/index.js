import diff from './diff';
import Node from './node';
import patch from './patch';

require('./extend');

const el = (...args) => new Node(...args);
export { diff, el, patch, Node };
