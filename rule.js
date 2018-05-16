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
  let cursorLine = node.loc.start.line;
  if (node.type === 'Program') {
    cursorLine = 0;
  }

  if (node.type !== 'Program') {
    const comments = context.getCommentsBefore(node);

    recursiveLinesBetween([info.prev, ...comments, node], info, (ok, n, args) => {
      if (!ok) { console.log('[report][prev]', args[0]); }
      if (!ok) { console.log('[report][curr]', args[1]); }
      if (!ok) { context.report(node, 'invalid'); }
    });
  }

  // props by order
  // class: decorators > id > superClass > body
  // class prop: key > value
  // method def: key > value
  // if: test > consequent > alternate
  // while: test > body
  // try: block > handler > finally
  // block: block
  // for: init > test > update > body
  // object: properties
  // property: key > value
  // label: body
  // literal: value
  // exp: left > right
  // cal exp: arguments
  // member exp: property
  //
  // all: decorators > > init > test > update > consequent > alternate > params[] > body[] or body > properties > property > value 

  if (node.declarations && node.declarations.length) {
    info.prev = context.getTokenBefore(node.declarations[0].id); // get var/let/const
    for (const n of node.declarations) {
      walk(n, context, info);
      info.prev = n;
    }
  }

  if (node.init) {
    walk(node.init, context, info);
    info.prev = node.init;
  }

  if (node.test) {
    walk(node.test, context, info);
    info.prev = node.test;
  }

  if (node.update) {
    walk(node.update, context, info);
    info.prev = node.update;
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

  if (node.value && node.value.type) {
    if (node.type === 'ClassProperty') {
      info.prev = context.getTokenAfter(node.key);
    }
    walk(node.value, context, info);
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
