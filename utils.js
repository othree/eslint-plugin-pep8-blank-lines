
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

const DECLARATIONS = [
  'VariableDeclaration',
];

const COMMENTS = [
  'Block',
  'Line',
];


const findBeforeFirst = (target, tokens) => {
  let prev = null;
  for (const token of tokens) {
    if (token.type === target) {
      return token;
    }
    prev = token;
  }
  throw new Error(`Unexpected token <${target}> not found`);
};


const isBlock = node => {
  if (BLOCK_DECLARATIONS.includes(node.type)) {
    return true;
  }
  /*
   * Also treat as block level node:
   * 
   *     var foo = function () {};
   *
   */
  if (node.type === 'VariableDeclaration' && node.declarations.length === 1) {
    if (BLOCK_EXPRESSIONS.includes(node.declarations[0].init.type)) {
      return true;
    }
  }
  return false;
};


const isBlockStart = node => {
  return BLOCK_DECLARATION_STARTS.includes(node.type) || BLOCK_EXPRESSION_STARTS.includes(node.type);
};


const isStatement = node => {
  return DECLARATIONS.includes(node.type);
};


const isComment = node => {
  return COMMENTS.includes(node.type);
};


exports.findFirstTokenBeforeBody = (node, context) => {
  if (BLOCK_DECLARATIONS.includes(node.type)) {
    return context.getTokenBefore(node.body);
  }
};


exports.blockStartNode = cursorLine => {
  return { 
    type: 'BlockStart',
    loc: { 
      start: { line: cursorLine },
      end: { line: cursorLine }
    } 
  };
};


exports.ruleFor = info => {
  let rule = 'maxone';
  if (isBlockStart(info.prev)) {
    rule = 'maxone';
  } else if (info.level === 0) {
    if (isBlock(info.prev)) {
      rule = 'two';
    } else if (isStatement(info.prev) && isStatement(info.current)) {
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

  console.log(rule);
  return rule;
}


exports.pretendStart = (node, token) => {
  if (token) {
    return {
      type: `${node.type}Start`,
      loc: token.loc
    }
  }
}
