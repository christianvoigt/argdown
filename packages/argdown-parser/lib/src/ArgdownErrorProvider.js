'use strict';

var _chevrotain = require('chevrotain');

var chevrotain = _interopRequireWildcard(_chevrotain);

var _ArgdownLexer = require('./ArgdownLexer.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var defaultErrorProvider = chevrotain.defaultErrorProvider;

var argdownErrorProvider = {
    buildMismatchTokenMessage: function buildMismatchTokenMessage(options) {
        // override mismatch tokens errors when Bravo is expected
        // Imagine Bravo is a terminating Token such as "SemiColon"
        if (options.expected === _ArgdownLexer.ArgdownLexer.EMPTYLINE) {
            return "expecting Bravo at end of " + options.ruleName;
        } else {
            // fallback to the default behavior otherwise.
            return defaultErrorProvider.buildMismatchTokenMessage(options);
        }
    },
    buildNotAllInputParsedMessage: function buildNotAllInputParsedMessage(options) {
        // changing the template of the error message #1
        return 'very bad dog! you still have some input remaining at offset:' + options.firstRedundant.startOffset;
    },
    // we are not overriding "buildNoViableAltMessage"
    // the default implementation will be automatically used instead.
    // buildNoViableAltMessage: function(options) {},

    buildEarlyExitMessage: function buildEarlyExitMessage(options) {
        // translating the error message to Spanish
        return 'Esperando por lo menos una iteraci\xF3n de: ' + chevrotain.tokenName(options.expectedIterationPaths[0][0]);
    }
};

module.exports = {
    ArgdownErrorProvider: argdownErrorProvider
};
//# sourceMappingURL=ArgdownErrorProvider.js.map