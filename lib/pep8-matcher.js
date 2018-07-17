/**
 * @fileoverview Custom matchers introduced in this project
 */


const COMMENT_TYPES = [
  'Block',
  'Line',
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
  'TaggedTemplateExpression',
  'TemplateExpression',
  'UnaryExpression',
  'UpdateExpression',
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
