

const i = nodes => {
  console.log('[i]')
  for (const n of nodes) {
    console.log(n.type);
    if (n.loc.start) {
      console.log(` s: ${n.loc.start.line}`);
    }
    console.log(` e: ${n.loc.end.line}`);
  }
  console.log('[/i]')
}


const RULES = {
  same: (a, b) => Math.abs(a - b) === 0,
  zero: (a, b) => Math.abs(a - b) === 1,
  one: (a, b) => Math.abs(a - b) === 2,
  two: (a, b) => Math.abs(a - b) === 3,
  maxzero: (a, b) => Math.abs(a - b) <= 1,
  maxone: (a, b) => Math.abs(a - b) <= 2,
  maxtwo: (a, b) => Math.abs(a - b) <= 3,
  zerosame: (a, b) => Math.abs(a - b) === 0,
  zeroone: (a, b) => {
    const delta = Math.abs(a - b);
    return delta === 1 || delta === 2;
  },
  zerotwo: (a, b) => {
    const delta = Math.abs(a - b);
    return delta === 1 || delta === 3;
  },
};


const linesBetween = (top, bottom, rule, callback) => callback(rule(top.loc.end.line, bottom.loc.start.line), bottom, [top, bottom, rule, callback]);


/**
 * @description Lookup empty line from buttom to top
 */
const recursiveLinesBetween = (nodes, rule, callback) => {
  if (nodes.length === 0) { return; }
  if (nodes.length === 1) { return nodes[0]; }

  let top = nodes.shift();

  for (let i = 0; i < nodes.length; i++) {
    let bottom = nodes[i];
    // console.log(top.type, bottom.type);
    // console.log(top.loc.end.line, bottom.loc.start.line);
    if (top.type === 'BlockStart' && i === 0) {
      linesBetween(top, bottom, RULES['zero'], callback);
    } else {
      linesBetween(top, bottom, rule, callback);
    }
    top = bottom;
  }

  return top;
}


const walk = (node, context, info) => {
  let cursorLine = node.loc.start.line;
  if (node.type === 'Program') {
    // console.log(node.loc);
    cursorLine = 0;
  }

  console.log(`<<< ${info.prev.type}`);
  console.log('>>>', node.type);

  let rule = 'two';
  if (info.level > 0) { rule = 'one'; }

  if (node.type !== 'Program') {
    // console.log('prev', info.prev)
    // console.log('curr', node.type, node.loc)
    // if (node.decorators && node.decorators.length) {
      // const decorators = [...node.decorators];
      // const firstDeco = decorators.shift();

      // let prefixes = []

      // for (let deco of decorators) {
        // prefixes = [...prefixes, ...context.getCommentsBefore(deco), deco];
      // }

      // console.log('1');
      // // i([firstDeco, ...prefixes, node]);
      // // recursiveLinesBetween([info.prev, firstDeco], RULES[`zero${rule}`], (ok, node, args) => {
        // // if (!ok) { console.log('wow', args[0], args[1], info.level, `zero${rule}`); };
        // // if (!ok) { context.report(node, 'invalid'); };
      // // });

      // console.log('2');
      // recursiveLinesBetween([firstDeco, ...prefixes], RULES['zero'], (ok, node, args) => {
        // if (!ok) { console.log('wow', args[0], args[1], info.level, 'zero'); };
        // if (!ok) { context.report(node, 'invalid'); };
      // });

      // const latest = prefixes.pop();
      // if (latest) {
        // info.prev.loc = latest.loc;
      // }
    // } else {
      // console.log('start comments');
      // const commentsBefore = context.getCommentsBefore(node);
      // recursiveLinesBetween([info.prev, ...commentsBefore], RULES[`zero${rule}`], (ok, node, args) => {
        // if (!ok) { console.log('wow', args[0], args[1], info.level, 'zerotwo'); };
        // if (!ok) { context.report(node, 'invalid') };
      // });
      // console.log('passed comments');
    // }

    console.log('start comments');
    const comments = context.getCommentsBefore(node);
    // i([info.prev, ...commentsBefore, node]);

    if (node.type === 'ClassBody') {
      rule = 'same';
    }

    if (comments.length) {
      const last = comments.pop();
      recursiveLinesBetween([last, node], RULES[`zero${rule}`], (ok, node, args) => {
        if (!ok) { console.log('wow0', info.level, `zero${rule}`); };
        if (!ok) { console.log('wow2', args[0]); };
        if (!ok) { console.log('wow3', args[1]); };
        if (!ok) { context.report(node, 'invalid') };
      });
    } else {
      last = node;
    }

    console.log('><1', info.prev.type, info.prev.loc)
    console.log('><2', last.type, last.loc)
    console.log('><3', node.type, node.loc)
    recursiveLinesBetween([info.prev, ...comments, last], RULES[`${rule}`], (ok, node, args) => {
      if (!ok) { console.log('wow0', info.level, rule); };
      if (!ok) { console.log('wow2', args[0]); };
      if (!ok) { console.log('wow3', args[1]); };
      if (!ok) { context.report(node, 'invalid') };
    });
    console.log('passed comments');
  }

  if (node.body) {
    console.log('???')
    info.prev = { 
      type: info.level ? 'BlockStart' : 'ProgramStart',
      loc: { 
        start: { line: cursorLine },
        end: { line: cursorLine }
      } 
    };
    console.log('i1', info)

    if (node.body.type === 'ClassBody') {
      console.log('+1')
      info.level++;
    }

    const body = Array.isArray(node.body) ? node.body : [node.body];

    console.log('before for')
    for (const n of body) {
      console.log('i2', info, n.type, n.loc)
      walk(n, context, info);
      info.prev = n;
    }
    if (node.body.type === 'ClassBody') {
      console.log('-1')
      info.level--;
    }
  }

  info.prev = node;

};


module.exports = {
  create: function (context) {
    const sourceCode = context.getSourceCode();

    return {
      'Program:exit': function (node) {
        const lines = sourceCode.lines;
        const info = {
          level: 0,
          prev: { loc: { end: { line: 0 } } },
          current: {},
        };
        // console.log(lines.length);

        walk(node, context, info);
      },
    };
  },
};
