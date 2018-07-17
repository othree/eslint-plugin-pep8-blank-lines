/**
 * @fileoverview Custom matchers introduced in this project
 */


const COMMENT_TYPES = [
  'Block',
  'Line',
];


const INLINE_TYPES = [
  'AssignmentExpression',
  'UnaryExpression',
  'UpdateExpression',
  'BinaryExpression',
  'ConditionalExpression',
  'MemberExpression',
  'CallExpression',
  'NewExpression',
  'AssignmentPattern',
  'AwaitExpression',
  'ArrayExpression',
  'TaggedTemplateExpression',
  'TemplateExpression',
  'LabeledStatement',
  'YieldExpression',
];


const TYPES = {
  'class-like': {
    test: node => {
      return node.type === 'ClassDeclaration';
    },
  },
  comment: {
    test: node => {
      return COMMENT_TYPES.includes(node.type);
    },
  },
  inline: {
    test: node => {
      return INLINE_TYPES.includes(node.type);
    },
  },
};


module.exports = (node, type) => {
  const types = Array.isArray(type) ? type : [type];
  return types.some(type => TYPES[type] && TYPES[type].test(node));
};
