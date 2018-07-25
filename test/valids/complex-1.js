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
        node: bottom,
        messageId: rule,
      });
    }
  });
};
