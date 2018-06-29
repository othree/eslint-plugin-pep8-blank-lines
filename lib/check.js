

var linesBetween = function (top, bottom, scope, callback) {
};

var recursiveLinesBetween = function (nodes, scope, callback) {
  var i = 0;
  for (i = 1; i < nodes.length; i += 1) {
    linesBetween(nodes[i - 1], nodes[i], scope, callback);
  }
};


module.exports = function (scope, context, sourceCode) {
  var nodes = [scope.prev];
  var comments = sourceCode.getCommentsBefore(scope.current);

  nodes = nodes.concat(comments);
  nodes.push(scope.current);

  recursiveLinesBetween(nodes, scope, function (result) {
  });
};
