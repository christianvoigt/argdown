import * as chevrotain from 'chevrotain';
import { ArgdownLexer } from './ArgdownLexer.js';

const defaultErrorProvider = chevrotain.defaultErrorProvider

const argdownErrorProvider = {
    buildMismatchTokenMessage: function (options) {
        // override mismatch tokens errors when Bravo is expected
        // Imagine Bravo is a terminating Token such as "SemiColon"
        if (options.expected === ArgdownLexer.EMPTYLINE) {
            return "expecting Bravo at end of " + options.ruleName
        } else {
            // fallback to the default behavior otherwise.
            return defaultErrorProvider.buildMismatchTokenMessage(options)
        }
    },
    buildNotAllInputParsedMessage: function (options) {
        // changing the template of the error message #1
        return `very bad dog! you still have some input remaining at offset:${options
            .firstRedundant.startOffset}`
    },
    // we are not overriding "buildNoViableAltMessage"
    // the default implementation will be automatically used instead.
    // buildNoViableAltMessage: function(options) {},

    buildEarlyExitMessage: function (options) {
        // translating the error message to Spanish
        return `Esperando por lo menos una iteración de: ${chevrotain.tokenName(
            options.expectedIterationPaths[0][0]
        )}`
    }
}

module.exports = {
    ArgdownErrorProvider: argdownErrorProvider
};