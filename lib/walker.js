const utils = require('./utils.js');
const arraylize = utils.arraylize;
const nodesWithCommaToken = utils.nodesWithCommaToken;
const nodesWithBracket = utils.nodesWithBracket;
const beginBracket = utils.beginBracket;
const endBracket = utils.endBracket;

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
      const begin = beginBracket(n, sourceCode)
      walk(begin, sourceCode, options);
      children.forEach((childKey) => {
        let child = n[childKey];
        if (childKey === 'right') { walk(sourceCode.getTokenBefore(child), sourceCode, options); }
        if (n.computed && ['key', 'property'].includes(childKey)) { child = nodesWithBracket(child, sourceCode); }
        walk(child, sourceCode, options);
      });
      walk(begin && endBracket(n, sourceCode), sourceCode, options);
      leave(n);
    }
  });
};


module.exports = walk;
