const rule = require('../lib/rule.js');
const load = require('./load.js');

const messages = require('../lib/blank-line-checker.js').messages;

const RuleTester = require('eslint').RuleTester;

const readfile = load.readfile;
const prefixdir = load.prefixdir;
const readdir = load.readdir;
const readmsgkey = load.readmsgkey;

const ruleTester = new RuleTester({
  parser: require.resolve('babel-eslint'),
});

const testCase = process.argv[2] || '*';

const testFilter = filename => testCase === '*' ? true : filename.indexOf(testCase) === 0;

const hiddenFilter = filename => filename.indexOf('.') !== 0;

const VALID = 'test/valids/';
const INVALID = 'test/invalids/';

const valids = readdir(VALID).filter(hiddenFilter).filter(testFilter).map(prefixdir(VALID));
const invalids = readdir(INVALID).filter(hiddenFilter).filter(testFilter).map(prefixdir(INVALID));

valids.map(filename => {
  console.log(filename);
  ruleTester.run('pep8-blank-lines', rule, {
    valid: [{
      code: readfile(filename)
    }],
    invalid: [],
  });
});

invalids.map(filename => {
  console.log(filename);

  const msgkey = readmsgkey(filename);
  const msg = messages[msgkey] || 'Unspecified Invalid';

  ruleTester.run('pep8-blank-lines', rule, {
    valid: [],
    invalid: [{
      code: readfile(filename),
      errors: [{ message: msg }],
    }],
  });
});

