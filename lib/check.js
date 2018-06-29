

const linesBetween = function (top, bottom, scope, callback) {
};

const recursiveLinesBetween = function (nodes, scope, callback) {
  for (let i = 1; i < nodes.length; i += 1) {
    linesBetween(nodes[i - 1], nodes[i], scope, callback);
  }
};


module.exports = function (scope, context, sourceCode) {
  const comments = sourceCode.getCommentsBefore(scope.current);
  const nodes = [scope.prev, ...comments, scope.current];

  recursiveLinesBetween(nodes, scope, function (result) {
  });
};
