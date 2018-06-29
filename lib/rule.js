var walker = require('./walker.js');
var check = require('./check.js');

var ruleContext = function (program, context) {
  var sourceCode = context.getSourceCode();
  var scope = {
    level: 0,
    context: program,
    parents: [],
    prev: {
      type: 'Program:enter',
      loc: {
        start: { line: 0 },
        end: { line: 0 },
      },
    },
    current: null,
  };

  return {
    callback: function (node) {
      scope.current = node;
      check(scope, context, sourceCode);
      scope.prev = node;
    },
    enter: function (node) {
      scope.parents.push(scope.context);
      scope.context = node;
      if (node.type === 'BlockStatement') {
        scope.level = scope.level + 1;
      }
      /**
       * Normally we cleanup prev node to avoid double check when enter children
       * But for the first node(Program) of the entire file
       * We didn't check anything before
       * So keep the first prev node(Program:enter)
       */
      if (scope.prev.type !== 'Program:enter') {
        scope.prev = null;
      }
      scope.current = null;
    },
    leave: function (node) {
      scope.current = null;
      scope.prev = node;
      if (node.type === 'BlockStatement') {
        scope.level = scope.level - 1;
      }
      scope.context = scope.parents.pop();
    },
  };
};


module.exports = {
  create: function (context) {
    return {
      'Program:exit': function (node) {
        walker(node, ruleContext(node, context));
      },
    };
  },
};