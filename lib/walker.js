const utils = require('./utils.js');
const arraylize = utils.arraylize;
const nodesWithCommaToken = utils.nodesWithCommaToken;
const nodesWithBracket = utils.nodesWithBracket;
const beforeControlFlowKeyword = utils.beforeControlFlowKeyword;
const beforeSemicolon = utils.beforeSemicolon;
const beginBracket = utils.beginBracket;
const endBracket = utils.endBracket;
const notAtNodeEnd = utils.notAtNodeEnd;

const visitorKeys = require('./visitor-keys.js');


const hollow = function () {};


const walk = function (node, sourceCode, options) {
  if (!node) { return; }
  const callback = options.callback || hollow;
  const enter = options.enter || hollow;
  const leave = options.leave || hollow;

  const nodes = nodesWithCommaToken(arraylize(node), sourceCode);

  nodes.forEach(callback);
  nodes.forEach(n => {
    const children = visitorKeys[n.type];

    if (children && children.length) {
      enter(n);
      const begin = beginBracket(n, sourceCode);
      walk(begin, sourceCode, options);
      children.forEach((childKey) => {
        let child = n[childKey];
        walk(notAtNodeEnd(beforeSemicolon(child, sourceCode), sourceCode), sourceCode, options);
        walk(beforeControlFlowKeyword(child, sourceCode), sourceCode, options);
        if (childKey === 'right') { walk(sourceCode.getTokenBefore(child), sourceCode, options); }
        child = nodesWithBracket(child, sourceCode);
        walk(child, sourceCode, options);
      });
      walk(begin && endBracket(n, sourceCode), sourceCode, options);
      leave(n);
    }
  });
};


module.exports = walk;
