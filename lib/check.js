const isarray = require('./polyfills/isarray.js');

const blankLineChecker = require('./blank-line-checker');

const plbsMatcherFactory = require('./padding-line-between-statements/statement-types');
const pep8Matcher = require('./pep8-matcher');
const nodeTypeMatcher = (node, type) => {
  const types = isarray(type) ? type : [type];
  return types.includes(node.type);
};


const match = (node, type, matchers) => matchers.some(matcher => matcher(node, type));


const levelCompare = (guide, level) => {
  if (guide === '*') { return true; }
  return guide === level;
};


const linesBetween = (top, bottom, scope, matchers, guides, callback) => {
  for (const guide of guides) {
    const contraints = [];
    if ('ancestor' in guide) { contraints.push(scope.ancestor.some(a => match(a, guide.ancestor, matchers))); }
    if ('level' in guide) { contraints.push(levelCompare(guide.level, scope.level)); }
    if ('scope' in guide) { contraints.push(match(scope.context, guide.scope, matchers)); }
    if ('prev' in guide) { contraints.push(match(top, guide.prev, matchers)); }
    if ('next' in guide) { contraints.push(match(bottom, guide.next, matchers)); }

    if (contraints.length && contraints.every(r => r)) {
      return callback(blankLineChecker(top, bottom, guide.rule), top, bottom, scope.context, guide.rule);
    }
  }
};


const recursiveLinesBetween = (nodes, scope, matchers, guides, callback) => {
  for (let i = 1; i < nodes.length; i += 1) {
    linesBetween(nodes[i - 1], nodes[i], scope, matchers, guides, callback);
  }
};


const sameStartAsParent = (node, parent) => {
  return node.parent ? node.start === node.parent.start
    : parent ? node.start === parent.start : undefined;
};


module.exports = (scope, guides, context, sourceCode) => {
  const isSameStartAsParent = sameStartAsParent(scope.current, scope.context);
  const comments = isSameStartAsParent ? [] : sourceCode.getCommentsBefore(scope.current);
  const nodes = [...comments, scope.current];
  if (scope.prev && !isSameStartAsParent) { nodes.unshift(scope.prev); }

  const matchers = [
    plbsMatcherFactory(sourceCode),
    pep8Matcher,
    nodeTypeMatcher,
  ];

  recursiveLinesBetween(nodes, scope, matchers, guides, (isValid, top, bottom, scope, rule) => {
    if (!isValid) {
      context.report({
        messageId: rule,
        loc: {
          start: bottom.loc.start,
          end: bottom.loc.start,
        },
      });
    }
  });
};
