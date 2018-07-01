/**
 * @fileoverview Provide PEP8 like blank line rule guide
 *
 * Guides for blank lines
 * ----------------------
 *
 * - First match rule will be used. So write fallback guide at bottom
 * - Guide strcture:
 *
 *       {
 *         level: 1,
 *         scope: STATEMENT_TYPE,
 *         prev: STATEMENT_TYPE,
 *         next: STATEMENT_TYPE,
 *         rule: LINEBREAK_TYPE
 *       }
 *
 *   STATEMENT_TYPE can be node type or definition from 'padding-line-between-statements'(TODO)
 *   or function.
 *
 *   * `level` changes when enter or leave `BlockStatement`.
 *   * While matching, scope node will never be `BlockStatement`, always return its parent node.
 *
 *    `rule` property are required. Other properties are optional, must have at least one of optional property.
 *
 *   [1]:https://eslint.org/docs/rules/padding-line-between-statements
 *   [2]:https://github.com/eslint/eslint/blob/master/lib/rules/padding-line-between-statements.js
 *
 *   LINEBREAK_TYPE
 *   
 *   Allow value from 'padding-line-between-statements'
 *
 *   * any
 *   * never
 *   * always
 *
 *   And following extensions
 *
 *   * same: 'Expected no newline here.',
 *   * zero: 'Expected no blank line here',
 *   * one: 'Expected one blank line here',
 *   * two: 'Expected two blank lines here',
 *   * maxzero: 'Expected no blank line here',
 *   * maxone: 'Expected max one blank line here',
 *   * maxtwo: 'Expected max two blank lines here',
 *   * zerosame: 'Expected no new line here.',
 *   * zeroone: 'Expected max one blank line here',
 *   * zerotwo: 'Expected zero or two blank lines here',
 *
 *
 * PEP8 guides
 * -----------
 *
 * Top Level:
 * - 2 blank lines around class-like syntax
 * - Max 2 blank lines around expression/statement
 * - Max 1 blank line inside inline syntax
 *
 * Other Level:
 * - 1 blank line around class-like syntax
 * - 1 blank line between class method
 * - Max 1 blank lines around expression/statement
 * - Max 1 blank line inside inline syntax
 *
 *  Inline Syntax:
 *  - Expressions
 *  - Pattern
 */

module.exports = [
  {
    scope: 'inline',
    rule: 'maxone',
  },
  {
    prev: 'MethodDefinition',
    next: 'MethodDefinition',
    rule: 'one'
  },
  {
    level: 0,
    prev: 'class-like',
    next: '*',
    rule: 'two',
  },
  {
    level: 0,
    prev: 'Program:enter',
    next: 'class-like',
    rule: 'zerotwo',
  },
  {
    level: 0,
    prev: 'comment',
    next: 'class-like',
    rule: 'zerotwo',
  },
  {
    level: 0,
    prev: '*',
    next: 'class-like',
    rule: 'two',
  },
  {
    level: 0,
    rule: 'maxtwo',
  },
  {
    prev: 'class-like',
    next: '*',
    rule: 'one',
  },
  {
    prev: 'comment',
    next: 'class-like',
    rule: 'zeroone',
  },
  {
    prev: '*',
    next: 'class-like',
    rule: 'one',
  },
  {
    level: '*',
    rule: 'maxone',
  },
];
