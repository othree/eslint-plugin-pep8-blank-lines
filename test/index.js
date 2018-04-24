const rule = require('../rule.js');

const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

const message = 'invalid';

ruleTester.run('pep8-blank-lines', rule, {
  valid: [
    `

class A {}


// XD


/**
 * @class B
 */
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

class C {}


// comment
class D {}
    `,
      errors: [{ message }],
    },
  ],
});
