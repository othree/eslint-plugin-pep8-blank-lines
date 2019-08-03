var visitorKeys = require('eslint-visitor-keys').KEYS;

visitorKeys.AwaitExpression = ['argument'];

// Stage 3 Spec
visitorKeys.ClassProperty = ['key', 'value'];

// Don't look quasis of template string
visitorKeys.TemplateLiteral = ['expressions'];

module.exports = visitorKeys;
