const isarray = require('./polyfills/isarray.js');

const astUtils = require('eslint/lib/ast-utils');
const isComma = astUtils.isCommaToken;
const isSemicolon = astUtils.isSemicolonToken;


const arraylize = object => {
  return (isarray(object) ? object : [object]).filter(x => x);
};


const isBeginBracket = token => {
  return (token.type === 'Punctuator' && ['(', '[', '{'].includes(token.value));
};


const isEndBracket = token => {
  return (token.type === 'Punctuator' && [')', ']', '}'].includes(token.value));
};


const isKeyword = (token, word = null) => {
  return (token.type === 'Keyword' || token.type === 'Identifier') && (!word || arraylize(word).includes(token.value));
};


const beginKeyword = (node, sourceCode, word = null) => {
  if (!node || node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getFirstToken(node);
  return token && isKeyword(token, word) ? token : null;
};


const beforeKeyword = (node, sourceCode, word = null) => {
  if (!node || node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getTokenBefore(node);
  return token && isKeyword(token, word) ? token : null;
};


const afterKeyword = (node, sourceCode, word = null) => {
  if (!node || node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getTokenAfter(node);
  return token && isKeyword(token, word) ? token : null;
};


const beforeControlFlowKeyword = (node, sourceCode) => {
  return beforeKeyword(node, sourceCode, [
    'if', 'else', 'for', 'do', 'while', 'switch',
  ]);
};


const beginFunctionKeywords = (node, sourceCode) => {
  const a = beginKeyword(node, sourceCode, ['async', 'function']);
  let ret = (a && a.value === 'async') ? arraylize([a, afterKeyword(a, sourceCode, 'function')]) : a;
  return ret;
};


const nodesWithCommaToken = (nodes, sourceCode) => {
  nodes = arraylize(nodes);
  if (nodes.length === 0) { return nodes; }
  const nodesWithComma = [];
  nodesWithComma.push(nodes[0]);
  for (let i = 1; i < nodes.length; i++) {
    const node = nodes[i];
    const comma = sourceCode.getTokenBefore(node);
    if (isComma(comma)) { nodesWithComma.push(comma); }
    nodesWithComma.push(node);
  }
  return nodesWithComma;
};


const beforeSemicolon = (node, sourceCode) => {
  if (!node || node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getTokenBefore(node);
  return token && isSemicolon(token) ? token : null;
};


const beforeBracket = (node, sourceCode) => {
  if (!node || node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getTokenBefore(node);
  return token && isBeginBracket(token) ? token : null;
};


const afterBracket = (node, sourceCode) => {
  if (!node || node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getTokenAfter(node);
  return token && isEndBracket(token) ? token : null;
};


const nodesWithBracket = (nodes, sourceCode) => {
  nodes = arraylize(nodes);
  if (nodes.length === 1) {
    return [beforeBracket(nodes[0], sourceCode), ...nodes, afterBracket(nodes[0], sourceCode)];
  } else {
    return nodes;
  }
};


const currentScope = (scope) => {
  const reverse = scope.parents.slice().reverse();
  for (const parent of reverse) {
    if (parent.type !== 'BlockStatement') {
      return parent.type;
    }
  }
};


const beginBracket = (node, sourceCode) => {
  if (node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getFirstToken(node);
  return isBeginBracket(token) ? token : null;
};


const endBracket = (node, sourceCode) => {
  if (node.type === 'Program') { return null; }
  if (isarray(node)) { return null; }
  const token = sourceCode.getLastToken(node);
  return isEndBracket(token) ? token : null;
};


const notAtNodeEnd = (node, sourceCode) => {
  const belongNode = node && node.range && sourceCode.getNodeByRangeIndex(node.range[0]);
  return belongNode && belongNode.range[1] !== node.range[1] && node;
};


module.exports = {
  arraylize,
  beginKeyword,
  beforeControlFlowKeyword,
  beginFunctionKeywords,
  nodesWithCommaToken,
  nodesWithBracket,
  currentScope,
  beforeSemicolon,
  beginBracket,
  endBracket,
  notAtNodeEnd,
};
