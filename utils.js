
const BLOCK_DECLARATIONS = [
  'FunctionDeclaration',
  'ClassDeclaration',
];

const BLOCK_DECLARATION_STARTS = BLOCK_DECLARATIONS.map(name => `${name}Start`);

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


exports.findFirstTokenBeforeBody = (node, context) => {
  if (BLOCK_DECLARATIONS.includes(node.type)) {
    return context.getTokenBefore(node.body);
    // return findBeforeFirst('Punctuator', context.getTokens(node));
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
  // console.log('ruleFor', info);
  let rule = 'one';
  if (BLOCK_DECLARATION_STARTS.includes(info.prev.type)) {
    rule = 'maxone';
  } else if (info.level === 0) {
    rule = (info.prev.type === 'ProgramStart') ? 'maxtwo' : 'two';
  } else if (info.prev.type === 'BlockStart') {
    rule = 'zero';
  } else {
    rule = 'one';
  }

  if (rule.indexOf('max') === -1) {
    console.log('[]', rule, info.prev.type);
    if (COMMENTS.includes(info.prev.type)) {
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
