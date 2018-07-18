const isComma = token =>
  (token.type === 'Punctuator' && token.value === ',');


const isarray = require('./polyfills/isarray.js');


const arraylize = function (object) {
  return isarray(object) ? object : [object];
};


const nodesWithCommaToken = (nodes, sourceCode) => {
  nodes = arraylize(nodes);
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

const beforeBracket = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getTokenBefore(node);
  return isBeginBracket(token) ? token : null;
}


const afterBracket = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getTokenAfter(node);
  return isEndBracket(token) ? token : null;
}


const nodesWithBracket = (nodes, sourceCode) => {
  nodes = arraylize(nodes);
  if (nodes.length === 1) {
    return [beforeBracket(nodes[0], sourceCode), ...nodes, afterBracket(nodes[0], sourceCode)];
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

const isBeginBracket = token =>
  (token.type === 'Punctuator' && ['(', '[', '{'].includes(token.value));


const isEndBracket = token =>
  (token.type === 'Punctuator' && [')', ']', '}'].includes(token.value));


const beginBracket = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getFirstToken(node);
  return isBeginBracket(token) ? token : null;
}


const endBracket = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getLastToken(node);
  return isEndBracket(token) ? token : null;
}


module.exports = {
  arraylize,
  nodesWithCommaToken,
  nodesWithBracket,
  currentScope,
  beginBracket,
  endBracket,
};
