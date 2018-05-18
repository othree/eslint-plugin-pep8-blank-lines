
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
];

const BLOCK_DECLARATION_STARTS = BLOCK_DECLARATIONS.map(name => `${name}Start`);

const BLOCK_EXPRESSIONS = [
  'FunctionExpression',
  'ClassEexpression',
];

const BLOCK_EXPRESSION_STARTS = BLOCK_EXPRESSIONS.map(name => `${name}Start`);

const CONTROL_FLOW_STATEMENTS = [
  'IfStatement',
  'SwitchStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'TryStatement',
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


const isComment = node =>
  COMMENTS.includes(node.type);


const isInParen = info =>
  (info.context &&
    (info.context.type === 'FunctionParams' || info.context.type === 'ControlFlow'));

const isAssign = token =>
  (token.type === 'Punctuator' && token.value === '=');


exports.findTokenBefore = (node, context) => {
  return context.getTokenBefore(node);
};


exports.findFirstTokenBeforeBody = (node, context) => {
  if (BLOCK_DECLARATIONS.includes(node.type) || BLOCK_EXPRESSIONS.includes(node.type)) {
    return context.getTokenBefore(node.body);
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
  } else if (info.context && isControlFlowStatement(info.context)) {
    rule = 'maxzero';
  } else if (info.level === 0) {
    if (isBlock(info.prev)) {
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
