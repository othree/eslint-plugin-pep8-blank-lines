var visitorKeys = require('espree/lib/visitor-keys.js');

// Stage 3 Spec
visitorKeys.ClassProperty = ['key', 'value'];

// Don't look quasis of template string
visitorKeys.TemplateLiteral = ['expressions'];

module.exports = visitorKeys;
