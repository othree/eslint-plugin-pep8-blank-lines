const utils = require('./utils.js');
const arraylize = utils.arraylize;
const nodesWithCommaToken = utils.nodesWithCommaToken;

const visitorKeys = require('./visitor-keys.js');


const walk = function (node, sourceCode, options) {
  if (!node) { return; }
  const callback = options.callback || function () {};
  const enter = options.enter || function () {};
  const leave = options.leave || function () {};

  const nodes = nodesWithCommaToken(arraylize(node), sourceCode);

  nodes.forEach(callback);
  nodes.forEach(n => {
    const children = visitorKeys[n.type];

    if (children && children.length) {
      enter(n);
      children.forEach((childKey) => {
        walk(n[childKey], sourceCode, options);
      });
      leave(n);
    }
  });
};


module.exports = walk;
