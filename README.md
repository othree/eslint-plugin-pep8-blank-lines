# eslint-plugin-pep8-blank-lines

[![CircleCI](https://circleci.com/gh/othree/eslint-plugin-pep8-blank-lines.svg?style=svg)](https://circleci.com/gh/othree/eslint-plugin-pep8-blank-lines)

An ESLint blank line rule supports rule for different level. Inspired by PEP8.

Now in Beta. Not widely test.

## Why

The space between chapters and between paragraphs should be different make it 
have good readibility. I believe source code should too. But current 
ESLint rules can't have different blank line rule in different level of scope.

When I write Python and found the [PEP8][] coding style. I fall in love with 
this simple but elegant rule. Basically, it allows two blank line between top 
level classes or functions. So I can keep more spaces between top level objects.
And I decide to implement it in ESLint.


## Usage

### Install

NPM install and save to dev dependency.

```sh
npm install --save-dev eslint-plugin-pep8-blank-lines
```

### Configure

Sample eslintrc:

```
{
  "plugins": [
    "pep8-blank-lines",
  ],

  "rules": {
    "pep8-blank-lines/pep8-blank-lines": 2
  }
}
```

If your config based on other config style. You might need to disable some rule 
related to blank lines. Take [standard][] for example:


```json
{
  "extends": "standard",

  "plugins": [
    "pep8-blank-lines",
    "no-parameter-e"
  ],

  "rules": {
    "semi": [2, "always"],
    "no-extra-semi": 2,
    "comma-dangle": ["error", "always-multiline"],
    "no-multiple-empty-lines": 0,
    "pep8-blank-lines/pep8-blank-lines": 2,
    "no-parameter-e/no-parameter-e": 2
  }
}
```

[PEP8]:https://www.python.org/dev/peps/pep-0008/#blank-lines
[standard]:https://standardjs.com/
