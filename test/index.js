const rule = require('../rule.js');

const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

const message = 'invalid';

ruleTester.run('pep8-blank-lines', rule, {
  valid: [
    `
class A {
    constructor () {}

    methodA () {}
}


function func () {}


// Comment Line


/* 
 * comments
 */
class B {
}
    `,
  ],
  invalid: [
    {
      code:
    `

class C {
    constructor () {}
    methodA () {}
}


class D {}
    `,
      errors: [{ message }],
    },
  ],
});
