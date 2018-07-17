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

const beforeBracker = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getTokenBefore(node);
  return isBeginBracker(token) ? token : null;
}


const afterBracker = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getTokenAfter(node);
  return isEndBracker(token) ? token : null;
}


const nodesWithBracket = (nodes, sourceCode) => {
  nodes = arraylize(nodes);
  if (nodes.length === 1) {
    return [beforeBracker(nodes[0], sourceCode), ...nodes, afterBracker(nodes[0], sourceCode)];
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

const isBeginBracker = token =>
  (token.type === 'Punctuator' && ['(', '[', '{'].includes(token.value));


const isEndBracker = token =>
  (token.type === 'Punctuator' && [')', ']', '}'].includes(token.value));


const beginBracker = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getFirstToken(node);
  return isBeginBracker(token) ? token : null;
}


const endBracker = function (node, sourceCode) {
  if (node.type === 'Program') { return null; }
  if (Array.isArray(node)) { return null; }
  const token = sourceCode.getLastToken(node);
  return isEndBracker(token) ? token : null;
}


module.exports = {
  arraylize,
  nodesWithCommaToken,
  nodesWithBracket,
  currentScope,
  beginBracker,
  endBracker,
};
