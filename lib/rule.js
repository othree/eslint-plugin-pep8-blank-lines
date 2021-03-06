const walker = require('./walker.js');
const check = require('./check.js');
const messages = require('./blank-line-checker').messages;
const matcher = require('./pep8-matcher');

const pep8 = require('./guides/pep8.js');

const ruleContext = (program, context) => {
  const sourceCode = context.getSourceCode();
  const guides = pep8;
  const scope = {
    level: 0,
    context: program,
    ancestor: [],
    prev: {
      type: 'Program:enter',
      loc: {
        start: { line: 0 },
        end: { line: 0 },
      },
      range: [0, 0],
    },
    current: null,
  };

  const sameStartAsParent = (node) => node.parent && node.start === node.parent.start;

  return {
    callback: node => {
      scope.current = node;
      check(scope, guides, context, sourceCode);
      scope.prev = node;
    },
    enter: node => {
      scope.ancestor.push(scope.context);
      scope.context = node;
      if (matcher(node, 'level-node')) {
        scope.level = scope.level + 1;
      }
      /**
       * Normally we cleanup prev node to avoid double check when enter children
       * But for the first node(Program) of the entire file
       * We didn't check anything before
       * So keep the first prev node(Program:enter)
       */
      if (scope.prev.type !== 'Program:enter' || sameStartAsParent(node)) {
        scope.prev = null;
      }
      scope.current = null;
    },
    leave: node => {
      scope.current = null;
      scope.prev = node;
      if (matcher(node, 'level-node')) {
        scope.level = scope.level - 1;
      }
      scope.context = scope.ancestor.pop();
    },
  };
};


module.exports = {
  meta: {
    messages: messages,
  },
  create: function (context) {
    return {
      'Program:exit': function (node) {
        walker(node, context.getSourceCode(), ruleContext(node, context));
      },
    };
  },
};
