

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
  if (node.type === 'ClassDeclaration') {
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


const BLOCK_DECLARATIONS = [
  'ClassDeclarationStart',
];

const COMMENTS = [
  'Block',
  'Line',
];

exports.ruleFor = info => {
  // console.log('ruleFor', info);
  let rule = 'one';
  if (BLOCK_DECLARATIONS.includes(info.prev.type)) {
    rule = 'maxone';
  } else if (info.level === 0) {
    rule = (info.prev.type === 'ProgramStart') ? 'maxtwo' : 'two';
  } else {
    rule = 'one';
  }

  if (rule.indexOf('max') === -1) {
    console.log('[]', rule, info.prev.type);
    if (COMMENTS.includes(info.prev.type)) {
      rule = `zero${rule}`;
    }
  }

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
