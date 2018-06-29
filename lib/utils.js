const isarray = require('./polyfills/isarray.js');

const arraylize = function (object) {
  return isarray(object) ? object : [object];
};

const currentScope = function (scope) {
  const reverse = scope.parents.slice().reverse();
  for (const parent of reverse) {
    if (parent.type !== 'BlockStatement') {
      return parent.type;
    }
  }
};

module.exports = {
  arraylize: arraylize,
  currentScope: currentScope,
};
