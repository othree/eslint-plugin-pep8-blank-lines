const rules = {
  same: (a, b) => Math.abs(a - b) === 0,
  zero: (a, b) => Math.abs(a - b) === 1,
  one: (a, b) => Math.abs(a - b) === 2,
  two: (a, b) => Math.abs(a - b) === 3,
  maxzero: (a, b) => Math.abs(a - b) <= 1,
  maxone: (a, b) => Math.abs(a - b) <= 2,
  maxtwo: (a, b) => Math.abs(a - b) <= 3,
  zerosame: (a, b) => Math.abs(a - b) === 0,
  zeroone: (a, b) => {
    const delta = Math.abs(a - b);
    return delta === 1 || delta === 2;
  },
  zerotwo: (a, b) => {
    const delta = Math.abs(a - b);
    return delta === 1 || delta === 3;
  },
};


module.exports = (top, bottom, rule) => {
  const validator = rules[rule];
  if (!validator) { throw new Error(`Blank line rule: ${rule} not exists.`); }
  return validator(top.loc.end.line, bottom.loc.start.line);
};
