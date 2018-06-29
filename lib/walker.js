var visitorKeys = require('./visitor-keys.js');

var isarray = require('./polyfills/isarray.js');


var walk = function (node, options) {
  var callback = options.callback || function () {};
  var enter = options.enter || function () {};
  var leave = options.leave || function () {};

  var i = 0;

  if (isarray(node)) {
    for (i = 0; i < node.length; i++) {
      callback(node[i]);
    }
  } else {
    callback(node);
  }

  var children = visitorKeys[node];

  if (children) {
    enter(node);
    for (i = 0; i < children.length; i++) {
      walk(node[children[i]], options);
    }
    leave(node);
  }
};


module.exports = walk;
