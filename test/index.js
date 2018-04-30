const rule = require('../rule.js');
const load = require('./load.js');

const RuleTester = require('eslint').RuleTester;

const readfile = load.readfile;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

const message = 'invalid';

ruleTester.run('pep8-blank-lines', rule, {
  valid: [
    readfile('test/valids/index.js'),
  ],
  invalid: [
    {
      code: readfile('test/invalids/index.js'),
      errors: [{ message }],
    },
  ],
});
