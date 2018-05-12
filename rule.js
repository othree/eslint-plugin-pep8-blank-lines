/* global console */

const RULES = require('./blank-line-rules');
const UTILS = require('./utils');


const findFirstTokenBeforeBody = UTILS.findFirstTokenBeforeBody;
const findFirstTokenBeforeParams = UTILS.findFirstTokenBeforeParams;
const blockStartNode = UTILS.blockStartNode;
const ruleFor = UTILS.ruleFor;
const pretendStart = UTILS.pretendStart;


const linesBetween = (top, bottom, rule, callback) =>
  callback(rule(top.loc.end.line, bottom.loc.start.line), bottom, [top, bottom, rule, callback]);


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
    console.log(ruleFor(info));
    linesBetween(top, bottom, RULES[ruleFor(info)], callback);
    top = bottom;
    info.prev = top;
  }

  return top;
};


const walk = function (node, context, info) {
  /**
   * Transparent Node
   * VariableDeclarator
   */
  if (node.type === 'VariableDeclarator') {
    return walk(node.init, context, info);
  }

  let cursorLine = node.loc.start.line;
  if (node.type === 'Program') {
    // console.log(node.loc);
    cursorLine = 0;
  }

  if (node.type !== 'Program') {
    // console.log('start comments');
    const comments = context.getCommentsBefore(node);

    recursiveLinesBetween([info.prev, ...comments, node], info, (ok, n, args) => {
      if (!ok) { console.log('[report][prev]', args[0]); }
      if (!ok) { console.log('[report][curr]', args[1]); }
      if (!ok) { context.report(node, 'invalid'); }
    });
    // console.log('passed comments');
  }

  if (node.params && node.params.length) {
    const currContext = info.context;
    info.context = {type: 'FunctionParams'};
    console.log(node);
    info.prev = findFirstTokenBeforeParams(node, context);
    console.log(info.prev);
    for (const n of node.params) {
      walk(n, context, info);
      info.prev = n;
    }
    info.context = currContext;
  }

  if (node.body) {
    if (node.type !== 'Program' && Array.isArray(node.body)) {
      console.log('{level +1}');
      info.level += 1;
      info.prev = blockStartNode(cursorLine);
    } else {
      info.prev = pretendStart(node, findFirstTokenBeforeBody(node, context)) || info.prev;
    }

    const body = Array.isArray(node.body) ? node.body : [node.body];

    console.log(`start body ${node.type}-${info.level}`);
    for (const n of body) {
      // console.log('[info]', info.prev.type);
      // console.log('[n]', n);
      walk(n, context, info);
      info.prev = n;
    }
    console.log(`end body ${node.type}-${info.level}`);

    if (node.type !== 'Program' && Array.isArray(node.body)) {
      console.log('{level -1}');
      info.level -= 1;
    }
  }

  if (node.declarations && node.declarations.length) {
    info.prev = context.getTokenAfter(node.declarations[0].id);
    for (const n of node.declarations) {
      walk(n, context, info);
      info.prev = n;
    }
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
