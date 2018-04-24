
const walk = node => {
  console.log(node.type, node.loc);
  if (node.body) {
    const body = Array.isArray(node.body) ? node.body : [node.body];

    for (const n of body) {
      walk(n);
    }
  }
};

module.exports = {
  create: function (context) {
    const sourceCode = context.getSourceCode();

    return {
      'Program:exit': function (node) {
        const lines = sourceCode.lines;
        console.log(lines.length);

        walk(node);
      },
    };
  },
};
