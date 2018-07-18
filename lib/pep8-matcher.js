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
  'level-node': {
    test: node => {
      return LEVEL_TYPES.includes(node.type);
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
