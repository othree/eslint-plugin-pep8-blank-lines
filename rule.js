/* global console */

const RULES = require('./blank-line-rules');
const UTILS = require('./utils');

const messages = require('./messages.js');

const findTokenBefore = UTILS.findTokenBefore;
const findFirstTokenBeforeBody = UTILS.findFirstTokenBeforeBody;
const findFirstTokenBeforeParams = UTILS.findFirstTokenBeforeParams;
const blockStartNode = UTILS.blockStartNode;
const ruleFor = UTILS.ruleFor;
const pretendStart = UTILS.pretendStart;

const isNew = UTILS.isNew;
const isComma = UTILS.isComma;


const linesBetween = (top, bottom, rule, callback) =>
  callback(RULES[rule](top.loc.end.line, bottom.loc.start.line), bottom, [top, bottom, rule, callback]);


/**
 * @description Lookup empty lines from top to bottom
 */
const recursiveLinesBetween = (nodes, info, callback) => {
  if (nodes.length === 0) { return null; }
  if (nodes.length === 1) { return nodes[0]; }

  let top = nodes.shift();

  for (let i = 0; i < nodes.length; i += 1) {
    const bottom = nodes[i];
    info.current = bottom;
    linesBetween(top, bottom, ruleFor(info), callback);
    top = bottom;
    info.prev = top;
  }

  return top;
};


const walk = function (node, context, info) {
  if (!node.type) {
    return;
  }

  let cursorLine = node.loc.start.line;
  if (node.type === 'Program') {
    cursorLine = 0;
  }

  if (node.type !== 'Program') {
    /**
     * Some structure didn't send info.prev
     * Don't check blank line to avoid double check
     * ex: SequenceExpression
     */
    if (info.prev) {
      const comments = context.getCommentsBefore(node);
      const nodes = [...comments, node];
      nodes.unshift(info.prev);

      recursiveLinesBetween(nodes, info, (ok, n, [top, bottom, rule, callback]) => {
        // if (!ok) { console.log('[report][rule]', rule); }
        // if (!ok) { console.log('[report][prev]', top); }
        // if (!ok) { console.log('[report][curr]', bottom); }
        if (!ok) { console.log('[report][msg]', messages[rule]); }
        if (!ok) { context.report(node, messages[rule]); }
      });
    }
  }

  // props by order
  // class: decorators > id > superClass > body
  // class prop: key > value
  // method def: key > value
  // if: test > consequent > alternate
  // switch: discriminat > cases
  // case: test? > consequent
  // while: test > body
  // try: block > handler > finally
  // block: block
  // for: init > test > update > body
  // forin: left > right > body
  // forof: left > right > body
  // object: properties
  // array: elements
  // property: key > value
  // label: body
  // literal: value
  // exp: left > right
  // unary exp: argument
  // cal exp: callee > arguments
  // object prop exp: key
  // exp: expression
  // exps: expressions
  //
  //   decorators > declarations > init > test > update > cases > consequent > alternate > params[]
  // > block > handler > finally
  // > body[] or body > properties > elements > key > value > left > right > argument
  // > expression > expressions

  if (node.declarations && node.declarations.length) {
    info.prev = context.getTokenBefore(node.declarations[0].id); // get var/let/const
    for (const n of node.declarations) {
      walk(n, context, info);
      info.prev = n;
    }
  }

  if (node.init) {
    info.prev = findTokenBefore(node.init, context);
    const currContext = info.context;
    info.context = node;
    walk(node.init, context, info);
    info.prev = node.init;
    info.context = currContext;
  }

  if (node.test) {
    info.prev = findTokenBefore(node.test, context);
    const currContext = info.context;
    info.context = node;
    walk(node.test, context, info);
    info.prev = node.test;
    info.context = currContext;
  }

  if (node.update) {
    info.prev = findTokenBefore(node.update, context);
    const currContext = info.context;
    info.context = node;
    walk(node.update, context, info);
    info.prev = node.update;
    info.context = currContext;
  }

  if (node.cases && node.cases.length) {
    info.prev = findTokenBefore(node.cases[0], context);
    const currContext = info.context;
    info.context = node;
    for (const n of node.cases) {
      walk(n, context, info);
      info.prev = n;
    }
    info.context = currContext;
  }

  if (node.consequent) {
    const currContext = info.context;
    info.context = node;
    walk(node.consequent, context, info);
    info.prev = node.consequent;
    info.context = currContext;
  }

  if (node.alternate) {
    const currContext = info.context;
    info.context = node;
    info.prev = findTokenBefore(node.alternate, context);
    walk(node.alternate, context, info);
    info.prev = node.alternate;
    info.context = currContext;
  }

  if (node.block) {
    const currContext = info.context;
    info.context = node;
    info.prev = findTokenBefore(node.block, context);
    walk(node.block, context, info);
    info.prev = node.block;
    info.context = currContext;
  }

  if (node.handler) {
    const currContext = info.context;
    info.context = node;
    info.prev = findTokenBefore(node.handler, context);
    walk(node.handler, context, info);
    info.prev = node.handler;
    info.context = currContext;
  }

  if (node.finalizer) {
    const currContext = info.context;
    info.context = node;
    info.prev = findTokenBefore(node.finalizer, context);
    walk(node.finalizer, context, info);
    info.prev = node.finalizer;
    info.context = currContext;
  }

  if (node.params && node.params.length) {
    const currContext = info.context;
    info.context = {type: 'FunctionParams'};
    info.prev = findFirstTokenBeforeParams(node, context);
    for (const n of node.params) {
      walk(n, context, info);
      info.prev = n;
    }
    info.context = currContext;
  }

  if (node.body) {
    const currContext = info.context;
    info.context = node;

    if (node.type !== 'Program' && Array.isArray(node.body)) {
      // console.log('{level +1}');
      info.level += 1;
      info.prev = blockStartNode(cursorLine);
    } else {
      info.prev = pretendStart(node, findFirstTokenBeforeBody(node, context)) || info.prev;
    }

    const body = Array.isArray(node.body) ? node.body : [node.body];

    for (const n of body) {
      walk(n, context, info);
      info.prev = n;
    }

    if (node.type !== 'Program' && Array.isArray(node.body)) {
      // console.log('{level -1}');
      info.level -= 1;
    }

    info.context = currContext;
  }

  if (node.properties && node.properties.length) {
    const currContext = info.context;
    info.context = node;

    info.prev = findTokenBefore(node.properties[0], context);
    for (const n of node.properties) {
      if (info.prev) {
        comma = context.getTokenBefore(n);
        if (isComma(comma)) {
          walk(comma, context, info);
          info.prev = comma;
        }
      }
      walk(n, context, info);
      info.prev = n;
    }

    info.context = currContext;
  }

  if (node.elements && node.elements.length) {
    const currContext = info.context;
    info.context = node;

    info.prev = findTokenBefore(node.elements[0], context);
    for (const n of node.elements) {
      if (info.prev) {
        comma = context.getTokenBefore(n);
        if (isComma(comma)) {
          walk(comma, context, info);
          info.prev = comma;
        }
      }
      walk(n, context, info);
      info.prev = n;
    }

    info.context = currContext;
  }

  if (node.property) {
    walk(node.property, context, info);
    info.prev = node.property;
  }

  if (node.key) {
    if (node.computed) {
      info.prev = context.getTokenBefore(node.key);
    } else {
      info.prev = null;
    }
    const currContext = info.context;
    info.context = node;
    walk(node.key, context, info);
    info.prev = node.key;
    info.context = currContext;
  }

  if (node.value && node.value.type) {
    if (node.type === 'ClassProperty') {
      info.prev = context.getTokenAfter(node.key);
    }
    walk(node.value, context, info);
  }

  if (node.left) {
    info.prev = node.left;
  }

  if (node.operator || (node.left && node.right)) {
    const currContext = info.context;
    info.context = node;
    const op = context.getTokenBefore(node.right || node.argument);
    if (node.left) {
      walk(op, context, info);
    }
    info.prev = op;
    info.context = currContext;
  }

  if (node.right) {
    const currContext = info.context;
    info.context = node;
    walk(node.right, context, info);
    info.prev = node.right;
    info.context = currContext;
  }

  if (node.callee) {
    const op = context.getTokenBefore(node.callee);
    if (isNew(op)) {
      const currContext = info.context;
      info.context = node;
      info.prev = op;
      walk(node.callee, context, info);
      info.context = currContext;
    } else {
      walk(node.callee, context, info);
    }
  }

  if (node.argument && !(node.operator && !node.prefix)) {
    const currContext = info.context;
    info.context = node;
    info.prev = context.getTokenBefore(node.argument);
    walk(node.argument, context, info);
    info.prev = node.argument;
    info.context = currContext;
  }

  if (node.expression) {
    const currContext = info.context;
    info.context = node;
    info.prev = null;
    walk(node.expression, context, info);
    info.prev = node.expression;
    info.context = currContext;
  }

  if (node.expressions) {
    const currContext = info.context;
    info.context = node;
    info.prev = null;
    for (const n of node.expressions) {
      if (info.prev) {
        comma = context.getTokenBefore(n);
        walk(comma, context, info);
        info.prev = comma;
      }
      walk(n, context, info);
      info.prev = n;
    }
    info.context = currContext;
  }

  info.prev = node;
};


module.exports = {
  create: function (context) {
    return {
      'Program:exit': function (node) {
        const info = {
          level: 0,
          prev: {
            type: 'ProgramStart',
            loc: {
              start: { line: 0 },
              end: { line: 0 },
            },
          },
          current: null,
        };

        walk(node, context, info);
      },
    };
  },
};
