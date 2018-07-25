/**
 * @fileoverview Custom matchers introduced in this project
 */
const astUtils = require('eslint/lib/ast-utils');
const isarray = require('./polyfills/isarray.js');


const COMMENT_TYPES = [
  'Block',
  'Line',
];


const CONTROL_FLOW_TYPES = [
  'DoWhileStatement',
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'SwitchStatement',
  'SwitchCase',
  'WhileStatement',
];

const INLINE_TYPES = [
  'AssignmentExpression',
  'AssignmentPattern',
  'AwaitExpression',
  'BinaryExpression',
  'CallExpression',
  'ConditionalExpression',
  'LabeledStatement',
  'MemberExpression',
  'NewExpression',
  'Property',
  'SequenceExpression',
  'TaggedTemplateExpression',
  'TemplateExpression',
  'UnaryExpression',
  'UpdateExpression',
  'YieldExpression',
];


const LEVEL_TYPES = [
  'ArrayExpression',
  'BlockStatement',
  'ObjectExpression',
  'SwitchStatement',
];


const BLOCK_EXPRESSION_TYPES = [
  'FunctionExpression',
  'ClassEexpression',
];


const TYPES = {
  'class-like': {
    test: node => {
      return node.type === 'ClassDeclaration';
    },
  },
  'block-exp': {
    test: node => {
      return (BLOCK_EXPRESSION_TYPES.includes(node.type) &&
        node.loc.start.line !== node.loc.end.line);
    },
  },
  'block-dcltor': {
    test: node => {
      return (node.type === 'VariableDeclarator' &&
        TYPES['block-exp'].test(node.init));
    },
  },
  'block-dcl': {
    test: node => {
      return (node.type === 'VariableDeclaration' &&
        node.declarations.length === 1 &&
        TYPES['block-dcltor'].test(node.declarations[0]));
    },
  },
  'control-flow': {
    test: node => {
      return CONTROL_FLOW_TYPES.includes(node.type);
    },
  },
  'level-node': {
    test: node => {
      return LEVEL_TYPES.includes(node.type);
    },
  },
  comment: {
    test: node => {
      return COMMENT_TYPES.includes(node.type);
    },
  },
  functions: {
    test: node => {
      return astUtils.isFunction(node);
    },
  },
  inline: {
    test: node => {
      return INLINE_TYPES.includes(node.type);
    },
  },
  loop: {
    test: node => {
      return astUtils.isLoop(node);
    },
  },
};


module.exports = (node, type) => {
  const types = isarray(type) ? type : [type];
  return types.some(type => TYPES[type] && TYPES[type].test(node));
};
