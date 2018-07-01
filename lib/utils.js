const isarray = require('./polyfills/isarray.js');

const arraylize = function (object) {
  return isarray(object) ? object : [object];
};

const currentScope = function (scope) {
  const reverse = scope.parents.slice().reverse();
  for (const parent of reverse) {
    if (parent.type !== 'BlockStatement') {
      return parent.type;
    }
  }
};


const statementType = function (node) {
};


const isStatementType = function (node, type) {
  if (/[A-Z]/.test(type)) { // AST node type
    return node.type === type;
  } else { // STATEMENT_TYPE from padding-line-between-statements
    return statementType(node) === type;
  }
};


const matchGuide = function (scope, guides) {
  for(const guide of guides) {
    let flag = 'level' in guide || 'scope' in guide || 'prev' in guide || 'next' in guide;
    if (flag && 'level' in guide) {
       flag = (scope.level === guide.level);
    }
    if (flag && 'scope' in guide) {
      flag = isStatementType(scope.scope, guide.scope);
    }
    if (flag && 'prev' in guide) {
      flag = isStatementType(prev.prev, guide.prev);
    }
    if (flag && 'next' in guide) {
      flag = isStatementType(next.next, guide.next);
    }
    if (flag) {
      return guide;
    }
  }
  return null;
};

module.exports = {
  arraylize: arraylize,
  currentScope: currentScope,
};
