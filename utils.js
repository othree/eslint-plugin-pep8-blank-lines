
const ASTUTILS = require('eslint/lib/ast-utils');


const IMPORTS = [
  'ImportDeclaration',
];

const EXPORTS = [
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
];

const BLOCK_DECLARATIONS = [
  'FunctionDeclaration',
  'ClassDeclaration',
  'CatchClause',
  'ArrowFunctionExpression',
];

const BLOCK_DECLARATION_STARTS = BLOCK_DECLARATIONS.map(name => `${name}Start`);

const META_EXPRESSION = [
  'SequenceExpression',
]

const BLOCK_EXPRESSIONS = [
  'FunctionExpression',
  'ClassEexpression',
];

const ARRAY = [
  'ArrayExpression',
];

const OBJECT = [
  'ObjectExpression',
];

const PROPERTY_KEY = [
  'MethodDefinition',
  'Property',
]

const INLINE_EXPRESSIONS = [
  'AssignmentExpression',
  'UnaryExpression',
  'UpdateExpression',
  'BinaryExpression',
  'ConditionalExpression',
  'MemberExpression',
  'CallExpression',
  'NewExpression',
  'AssignmentPattern',
];

const BLOCK_EXPRESSION_STARTS = BLOCK_EXPRESSIONS.map(name => `${name}Start`);

const CONTROL_FLOW_STATEMENTS = [
  'IfStatement',
  'SwitchStatement',
  'SwitchCase',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'TryStatement',
  'CatchClause',
];

const THROW_STATEMENT = [
  'ThrowStatement',
];

const DECLARATIONS = [
  'VariableDeclaration',
];

const DECCLARATORS = [
  'VariableDeclarator',
];

const FUNCTIONS = [
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
];

const CLASS_METHODS = [
  'MethodDefinition'
];

const COMMENTS = [
  'Block',
  'Line',
];


const isImport = node =>
  IMPORTS.includes(node.type);


const isExport = node =>
  EXPORTS.includes(node.type);


const isBlock = (node) => {
  if (BLOCK_DECLARATIONS.includes(node.type)) {
    return true;
  }
  /*
   * Also treat as block level node:
   *
   *     var foo = function () {
   *     };
   *
   */
  if (node.type === 'VariableDeclaration' && node.declarations.length === 1) {
    if (BLOCK_EXPRESSIONS.includes(node.declarations[0].init.type) &&
      node.declarations[0].loc.start.line !== node.declarations[0].loc.end.line) {
      return true;
    }
  }
  return false;
};


const isBlockStart = node =>
  BLOCK_DECLARATION_STARTS.includes(node.type) || BLOCK_EXPRESSION_STARTS.includes(node.type);


const isControlFlowStatement = node =>
  CONTROL_FLOW_STATEMENTS.includes(node.type);


const isStatement = node =>
  DECLARATIONS.includes(node.type);


const isDeclarator = node =>
  DECCLARATORS.includes(node.type);


const isArray = node =>
  ARRAY.includes(node.type);


const isObject = node =>
  OBJECT.includes(node.type);


const isPropertyKey = node =>
  PROPERTY_KEY.includes(node.type);


const isInline = node =>
  INLINE_EXPRESSIONS.includes(node.type);


const isFor = node =>
  node.type === 'ForStatement';


const isClassMethod = node =>
  CLASS_METHODS.includes(node.type);


const isComment = node =>
  COMMENTS.includes(node.type);


const isInExpression = node =>
  node.context && META_EXPRESSION.includes(node.context.type);


const isInFunction = node =>
  node.context && FUNCTIONS.includes(node.context.type);


const isInParen = info =>
  (info.context &&
    (info.context.type === 'FunctionParams' || info.context.type === 'ControlFlow'));


const isArrow = token =>
  (token.type === 'Punctuator' && token.value === '=>');


const isAssign = token =>
  (token.type === 'Punctuator' && token.value === '=');


const isComma = token =>
  (token.type === 'Punctuator' && token.value === ',');


const isNew = token =>
  (token && token.type === 'Keyword' && token.value === 'new');


const isThrow = node =>
  THROW_STATEMENT.includes(node.type);


const isParenthesised = (context, node) => {
  if (Array.isArray(node)) {
    if (node.length > 1) {
      return true;
    }

    const previousToken = context.getTokenBefore(node[0]);
    const nextToken = context.getTokenAfter(node[node.length - 1]);

    return Boolean(previousToken && nextToken) &&
        previousToken.value === "(" && previousToken.range[1] <= node.range[0] &&
        nextToken.value === ")" && nextToken.range[0] >= node.range[1];
  } else {
    return ASTUTILS.isParenthesised(context, node);
  }
};


exports.findParamsLoc = (context, node) => {
  let n = null;
  let loc = null;
  let range = null;
  if (node.params) {
    loc = {};
    range = [];
    // loc
    let right = null;
    let left = null;

    if (node.params.length) {
      if (isParenthesised(context, node.params)) {
        left = context.getTokenBefore(node.params[0]);
        right = context.getTokenAfter(node.params[node.params.length - 1]);
      } else {
        left = right = node.params[0];
      }
    } else if (node.params) {
      right = context.getTokenBefore(node.body);
      if (isArrow(right)) {
        right = context.getTokenBefore(right);
      }
      left = context.getTokenBefore(right);
    }
    loc.end = right.loc.end;
    loc.start = left.loc.start;
    range.push(left.range[0]);
    range.push(right.range[1]);
    n = {loc, range};
  }
  return n;
};


exports.findTokenBefore = (node, context) => {
  return context.getTokenBefore(node);
};


exports.findFirstTokenBeforeBody = (node, context) => {
  if (node.body) {
    return context.getTokenBefore(node.body[0] || node.body);
  }
  return null;
};


exports.findFirstTokenBeforeParams = (node, context) => {
  if (FUNCTIONS.includes(node.type) && node.params[0]) {
    return context.getTokenBefore(node.params[0]);
  }
  return null;
};


exports.blockStartNode = (cursorLine) => {
  return {
    type: 'BlockStart',
    loc: {
      start: { line: cursorLine },
      end: { line: cursorLine },
    },
  };
};


exports.ruleFor = (info) => {
  let rule = 'maxone';
  if (isBlockStart(info.prev)) {
    rule = 'maxzero';
  } else if (isAssign(info.prev)) {
    rule = 'maxzero';
  } else if (isInParen(info)) {
    rule = 'maxzero';
  } else if (isInExpression(info)) {
    rule = 'maxzero';
  } else if (isInFunction(info)) {
    rule = 'maxzero';
  } else if (info.context && isControlFlowStatement(info.context)) {
    rule = 'maxzero';
  } else if (info.context && isInline(info.context)) {
    rule = 'maxzero';
  } else if (info.context && isArray(info.context)) {
    rule = 'maxone';
  } else if (info.context && isPropertyKey(info.context)) {
    rule = 'maxzero';
  } else if (info.context && isObject(info.context)) {
    rule = 'maxone';
  } else if (info.context && isFor(info.context)) {
    rule = 'maxzero';
  } else if (info.context && isThrow(info.context)) {
    rule = 'maxzero';
  } else if (info.prev && isClassMethod(info.prev) && isClassMethod(info.current)) {
    rule = 'one';
  } else if (info.level === 0) {
    if (isBlock(info.prev) || isBlock(info.current)) {
      rule = 'two';
    } else if (isImport(info.prev) && isImport(info.current)) {
      rule = 'maxtwo';
    } else if (isExport(info.prev) && isExport(info.current)) {
      rule = 'maxtwo';
    } else if (isStatement(info.prev) && isStatement(info.current)) {
      rule = 'maxtwo';
    } else if (isDeclarator(info.prev)) {
      rule = 'maxone';
    } else if (isDeclarator(info.current)) {
      rule = 'maxzero';
    } else if ((isStatement(info.prev) && isComment(info.current)) || (isComment(info.prev) && isStatement(info.current))) {
      rule = 'maxtwo';
    } else {
      rule = (info.prev.type === 'ProgramStart') ? 'maxtwo' : 'two';
    }
  } else {
    if (isBlock(info.prev)) {
      rule = 'one';
    } else {
      rule = 'maxone';
    }
  }

  if (rule.indexOf('max') === -1) {
    if (isComment(info.prev)) {
      rule = `zero${rule}`;
    }
  }

  return rule;
};


exports.pretendStart = (node, token) => {
  if (token) {
    return {
      type: `${node.type}Start`,
      loc: token.loc,
    };
  }
  return null;
};

exports.isParenthesised = isParenthesised;

exports.isNew = isNew;
exports.isComma = isComma;
