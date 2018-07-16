const blankLineChecker = require('./blank-line-checker');

const plbsMatcherFactory = require('./padding-line-between-statements/statement-types');
const nodeTypeMatcher = (node, type) => node.type === type;


const match = (node, type, matchers) => {
  return matchers.some(matcher => matcher(node, type));
};


const linesBetween = function (top, bottom, scope, matchers, guides, callback) {
  for (const guide of guides) {
    const matched = [];
    if (guide.level) { matched.push(guide.level === scope.level); }
    if (guide.prev) { matched.push(match(top, guide.prev, matchers)); }
    if (guide.next) { matched.push(match(bottom, guide.next, matchers)); }

    //   0 constraint -> default false
    // > 0 constraint -> default true, use && to see real result
    //
    // Can't use every because it returns false on empty array
    const result = matched.reduce((sum, curr) => sum && curr, !!matched.length);

    if (result) {
      return callback(blankLineChecker(top, bottom, guide.rule), top, bottom, guide.rule);
    }
  }
};


const recursiveLinesBetween = function (nodes, scope, matchers, guides, callback) {
  for (let i = 1; i < nodes.length; i += 1) {
    linesBetween(nodes[i - 1], nodes[i], scope, matchers, guides, callback);
  }
};


module.exports = function (scope, guides, context, sourceCode) {
  const comments = sourceCode.getCommentsBefore(scope.current);
  const nodes = [scope.prev, ...comments, scope.current];

  const matchers = [
    plbsMatcherFactory(sourceCode),
    nodeTypeMatcher,
  ];

  recursiveLinesBetween(nodes, scope, matchers, guides, function (result, top, bottom, rule) {
    context.report(bottom, rule);
  });
};
