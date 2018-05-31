const rule = require('../rule.js');
const load = require('./load.js');

const RuleTester = require('eslint').RuleTester;

const readfile = load.readfile;
const prefixdir = load.prefixdir;
const readdir = load.readdir;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

const message = 'invalid';

const testCase = process.argv[2] || '*';

const testFilter = filename => testCase === '*' ? true : filename.indexOf(testCase) >= 0;

const VALID = 'test/valids/';
const INVALID = 'test/invalids/';

const valids = readdir(VALID).filter(testFilter).map(prefixdir(VALID));
const invalids = readdir(INVALID).filter(testFilter).map(prefixdir(INVALID));

ruleTester.run('pep8-blank-lines', rule, {
  valid: valids.map(readfile),
  invalid: invalids.map(filename => { 
    return {
      code: readfile(filename),
      errors: [{ message }],
    };
  }),
});
