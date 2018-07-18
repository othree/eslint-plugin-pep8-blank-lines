/* eslint space-before-function-paren: 0, quotes: 0, spaced-comment: 0, indent: ["error", 4],
   comma-dangle: 0, padded-blocks: 0, semi: 0 */
/**
 * @fileoverview Based on padding-line-between-statements
 * @link https://github.com/eslint/eslint/blob/master/lib/rules/padding-line-between-statements.js
 */

/**
 * @fileoverview Rule to require or disallow newlines between statements
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const astUtils = require("eslint/lib/ast-utils");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const CJS_EXPORT = /^(?:module\s*\.\s*)?exports(?:\s*\.|\s*\[|$)/;
const CJS_IMPORT = /^require\(/;

/**
 * Creates tester which check if a node starts with specific keyword.
 *
 * @param {string} keyword The keyword to test.
 * @returns {Object} the created tester.
 * @private
 */
function newKeywordTester(keyword) {
    return {
        test: (node, sourceCode) => {
            const token = sourceCode.getFirstToken(node)
            return token && token.value === keyword
        }
    };
}

/**
 * Creates tester which check if a node is specific type.
 *
 * @param {string} type The node type to test.
 * @returns {Object} the created tester.
 * @private
 */
function newNodeTypeTester(type) {
    return {
        test: node =>
            node.type === type
    };
}

/**
 * Checks the given node is an expression statement of IIFE.
 *
 * @param {ASTNode} node The node to check.
 * @returns {boolean} `true` if the node is an expression statement of IIFE.
 * @private
 */
function isIIFEStatement(node) {
    if (node.type === "ExpressionStatement") {
        let call = node.expression;

        if (call.type === "UnaryExpression") {
            call = call.argument;
        }
        return call.type === "CallExpression" && astUtils.isFunction(call.callee);
    }
    return false;
}

/**
 * Checks whether the given node is a block-like statement.
 * This checks the last token of the node is the closing brace of a block.
 *
 * @param {SourceCode} sourceCode The source code to get tokens.
 * @param {ASTNode} node The node to check.
 * @returns {boolean} `true` if the node is a block-like statement.
 * @private
 */
function isBlockLikeStatement(sourceCode, node) {

    // do-while with a block is a block-like statement.
    if (node.type === "DoWhileStatement" && node.body.type === "BlockStatement") {
        return true;
    }

    /*
     * IIFE is a block-like statement specially from
     * JSCS#disallowPaddingNewLinesAfterBlocks.
     */
    if (isIIFEStatement(node)) {
        return true;
    }

    // Checks the last token is a closing brace of blocks.
    const lastToken = sourceCode.getLastToken(node, astUtils.isNotSemicolonToken);
    const belongingNode = lastToken && astUtils.isClosingBraceToken(lastToken)
        ? sourceCode.getNodeByRangeIndex(lastToken.range[0])
        : null;

    return Boolean(belongingNode) && (
        belongingNode.type === "BlockStatement" ||
        belongingNode.type === "SwitchStatement"
    );
}

/**
 * Check whether the given node is a directive or not.
 * @param {ASTNode} node The node to check.
 * @param {SourceCode} sourceCode The source code object to get tokens.
 * @returns {boolean} `true` if the node is a directive.
 */
function isDirective(node, sourceCode) {
    return (
        node.type === "ExpressionStatement" &&
        (
            node.parent.type === "Program" ||
            (
                node.parent.type === "BlockStatement" &&
                astUtils.isFunction(node.parent.parent)
            )
        ) &&
        node.expression.type === "Literal" &&
        typeof node.expression.value === "string" &&
        !astUtils.isParenthesised(sourceCode, node.expression)
    );
}

/**
 * Check whether the given node is a part of directive prologue or not.
 * @param {ASTNode} node The node to check.
 * @param {SourceCode} sourceCode The source code object to get tokens.
 * @returns {boolean} `true` if the node is a part of directive prologue.
 */
function isDirectivePrologue(node, sourceCode) {
    if (isDirective(node, sourceCode)) {
        for (const sibling of node.parent.body) {
            if (sibling === node) {
                break;
            }
            if (!isDirective(sibling, sourceCode)) {
                return false;
            }
        }
        return true;
    }
    return false;
}

/**
 * Types of statements.
 * Those have `test` method to check it matches to the given statement.
 * @private
 */
const StatementTypes = {
    "*": { test: () => true },
    "block-like": {
        test: (node, sourceCode) => isBlockLikeStatement(sourceCode, node)
    },
    "cjs-export": {
        test: (node, sourceCode) =>
            node.type === "ExpressionStatement" &&
            node.expression.type === "AssignmentExpression" &&
            CJS_EXPORT.test(sourceCode.getText(node.expression.left))
    },
    "cjs-import": {
        test: (node, sourceCode) =>
            node.type === "VariableDeclaration" &&
            node.declarations.length > 0 &&
            Boolean(node.declarations[0].init) &&
            CJS_IMPORT.test(sourceCode.getText(node.declarations[0].init))
    },
    directive: {
        test: isDirectivePrologue
    },
    expression: {
        test: (node, sourceCode) =>
            node.type === "ExpressionStatement" &&
            !isDirectivePrologue(node, sourceCode)
    },
    "multiline-block-like": {
        test: (node, sourceCode) =>
            node.loc.start.line !== node.loc.end.line &&
            isBlockLikeStatement(sourceCode, node)
    },
    "multiline-expression": {
        test: (node, sourceCode) =>
            node.loc.start.line !== node.loc.end.line &&
            node.type === "ExpressionStatement" &&
            !isDirectivePrologue(node, sourceCode)
    },

    block: newNodeTypeTester("BlockStatement"),
    empty: newNodeTypeTester("EmptyStatement"),

    break: newKeywordTester("break"),
    case: newKeywordTester("case"),
    class: newKeywordTester("class"),
    const: newKeywordTester("const"),
    continue: newKeywordTester("continue"),
    debugger: newKeywordTester("debugger"),
    default: newKeywordTester("default"),
    do: newKeywordTester("do"),
    export: newKeywordTester("export"),
    for: newKeywordTester("for"),
    function: newKeywordTester("function"),
    if: newKeywordTester("if"),
    import: newKeywordTester("import"),
    let: newKeywordTester("let"),
    return: newKeywordTester("return"),
    switch: newKeywordTester("switch"),
    throw: newKeywordTester("throw"),
    try: newKeywordTester("try"),
    var: newKeywordTester("var"),
    while: newKeywordTester("while"),
    with: newKeywordTester("with")
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function factory(sourceCode) {
    return function match(node, type) {
        let innerStatementNode = node;

        while (innerStatementNode.type === "LabeledStatement") {
            innerStatementNode = innerStatementNode.body;
        }
        if (Array.isArray(type)) {
            return type.some(match.bind(null, innerStatementNode));
        }
        return StatementTypes[type] && StatementTypes[type].test(innerStatementNode, sourceCode);
    }
};

