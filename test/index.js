const rule = require('../rule.js');

const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

const message = 'Blank line not exptected';

ruleTester.run('pep8-blank-lines', rule, {
  valid: [
    `
class A {}


class B {
  constructor () {
  }

  methodA () {}
}
    `,
  ],
  invalid: [
    {
      code:
    `
class A {}

class B {}
    `,
      errors: [{ message }],
    },
  ],
});
