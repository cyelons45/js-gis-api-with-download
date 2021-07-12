/**
 * Summary: eslint rules class.
 * Description: Describes the eslint rules used in API. 
 */

module.exports = {
    "env": {
        "node": true,
        "jest": true,
        "es6": true
    },
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "quotes" :["error", "single"], // Enforce single quotation.
        "semi": "error", // Enforce semicolons.
        "no-extra-semi": "error", // Disallow unnecessary semicolons
        "space-before-function-paren": ["error", "always"],   // Enforces a space before function parenthesis.
        "no-multiple-empty-lines" : ["error", { "max": 2, "maxEOF": 0 }], // Enforces a maximum number of consecutive empty lines.
        "object-property-newline" : "error", // Enforce to maintain consistency of newlines between object properties.
        "padded-blocks" : ["error", "never"], // Enforce no padding within blocks.
        "no-unused-vars" :"error", // Disallow unused variables
        "eqeqeq": "error" // Enforce use of === 
    }
};