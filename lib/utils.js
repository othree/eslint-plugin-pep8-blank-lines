const isComma = token =>
  (token.type === 'Punctuator' && token.value === ',');


const isarray = require('./polyfills/isarray.js');


const arraylize = function (object) {
  return isarray(object) ? object : [object];
};


const nodesWithCommaToken = (nodes, sourceCode) => {
  if (nodes.length > 1) {
    const nodesWithComma = [];
    nodesWithComma.push(nodes[0]);
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      const comma = sourceCode.getTokenBefore(node);
      if (isComma(comma)) { nodesWithComma.push(comma); }
      nodesWithComma.push(node);
    }
    return nodesWithComma;
  } else {
    return nodes;
  }
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
  nodesWithCommaToken: nodesWithCommaToken,
  currentScope: currentScope,
};
