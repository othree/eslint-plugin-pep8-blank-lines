const utils = require('./utils.js');
const arraylize = utils.arraylize;

const visitorKeys = require('./visitor-keys.js');


const walk = function (node, options) {
  const callback = options.callback || function () {};
  const enter = options.enter || function () {};
  const leave = options.leave || function () {};

  arraylize(node).forEach(callback);

  const children = visitorKeys[node];

  if (children) {
    enter(node);
    children.forEach(function (childKey) {
      walk(node[childKey], options);
    });
    leave(node);
  }
};


module.exports = walk;
