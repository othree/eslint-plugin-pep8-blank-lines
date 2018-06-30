

const linesBetween = function (top, bottom, scope, guides, callback) {
};

const recursiveLinesBetween = function (nodes, scope, guides, callback) {
  for (let i = 1; i < nodes.length; i += 1) {
    linesBetween(nodes[i - 1], nodes[i], scope, guides, callback);
  }
};


module.exports = function (scope, guides, context, sourceCode) {
  const comments = sourceCode.getCommentsBefore(scope.current);
  const nodes = [scope.prev, ...comments, scope.current];

  recursiveLinesBetween(nodes, scope, guides, function (result) {
  });
};
