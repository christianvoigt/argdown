'use strict';

var _chevrotain = require('chevrotain');

var chevrotain = _interopRequireWildcard(_chevrotain);

var _ArgdownLexer = require('./ArgdownLexer.js');

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var defaultErrorProvider = chevrotain.defaultErrorProvider;
var tokenMatcher = chevrotain.tokenMatcher;
var EOF = chevrotain.EOF;
var MISSING_TEXT_CONTENT_ERROR = "Missing text content. " + "Please add a line of text or refer to an existing statement or argument instead by replacing the content in this line with [Statement Title] or <Argument Title> (without a colon). " + "If you want to define a statement ([Statement Title]:) or argument (<Argument Title>:), the defining text content has to follow the defined element title without any empty lines in between.";
var INVALID_INFERENCE_ERROR = "Invalid inference. Inferences can either be marked by four hyphens (----) or have the following format: " + "--Inference Rule 1, Inference Rule 2 (my meta data property 1: 1, 2, 3; my meta data property 2: value) --";
var INVALID_METADATA_ERROR = "Invalid metadata statement. Metadata has the following format: (my meta data property 1: 1, 2, 3; my meta data property 2: value)";
var INVALID_RELATION_ERROR = "Invalid relation syntax. This may either be caused by a) an invalid relation parent or b) invalid indentation. a) Invalid relation parent: Only statements and arguments can have relations as child elements. b) Invalid Indentation tree: Please check that if there are preceding relations in this paragraph, there is at least one with equal or less indentation.";
var MISSING_RELATION_CONTENT_ERROR = "Missing relation content. Please define or refer to a statement or argument (you can define a statement by simply adding a line of text).";
var MISSING_INFERENCE_END_ERROR = "Invalid inference syntax. Please end your inference with two hyphens (--)";
var INVALID_INFERENCE_POSITION_ERROR = "Invalid inference position. An inference may only occur within an argument reconstruction, in which it is preceded by a premise and followed by a conclusion (both of which have to be numbered statements: '(1) Statement').";
var MISSING_INFERENCE_ERROR = "Missing inference. Use four hyphens (----) between two numbered statements to insert an inference in your reconstruction and mark the latter statement as a conclusion.";
var MISSING_CONCLUSION_ERROR = "Missing conclusion. Please add a numbered statement after the inference.";
var ARGUMENT_RECONSTRUCTION_POSITION_ERROR = "Invalid position of argument reconstruction. Make sure the argument reconstruction is preceded by an empty line.";
var INVALID_ARGUMENT_STATEMENT_CONTENT_ERROR = "Invalid statement content. An argument reference (<Argument Title>) or definition (<Argument Title>:) can not be used as premise or conclusion within an argument reconstruction. Use statement references ([Statement Title]) or definitions ([Statement Title]:) instead.";
var INCOMPLETE_ARGUMENT_RECONSTRUCTION_ERROR = "Incomplete argument reconstruction. An argument reconstruction has to consist of at least one premise (a numbered statement: '(1) Statement Text'), one inference (marked by four hyphens ----) and one conclusion (a numbered statement after an inference). There may no be any empty lines between these elements.";

function GetParagraphStartTokenDescription(token) {
    if (tokenMatcher(token, _ArgdownLexer.ArgdownLexer.OutgoingSupport)) {
        return "an outgoing support relation (+ or <+)";
    } else if (tokenMatcher(token, _ArgdownLexer.ArgdownLexer.IncomingSupport)) {
        return "an incoming support relation (+>)";
    } else if (tokenMatcher(token, _ArgdownLexer.ArgdownLexer.OutgoingAttack)) {
        return "an outgoing attack relation (- or <-)";
    } else if (tokenMatcher(token, _ArgdownLexer.ArgdownLexer.IncomingAttack)) {
        return "an incoming attack relation (->)";
    } else if (tokenMatcher(token, _ArgdownLexer.ArgdownLexer.Contradiction)) {
        return "a contradictory relation (><)";
    } else if (tokenMatcher(token, _ArgdownLexer.ArgdownLexer.IncomingUndercut)) {
        return "an incoming undercut relation (_>)";
    } else if (tokenMatcher(token, _ArgdownLexer.ArgdownLexer.OutgoingUndercut)) {
        return "an incoming undercut relation (<_)";
    }
}
function isRelationToken(token) {
    return tokenMatcher(token, _ArgdownLexer.ArgdownLexer.IncomingSupport) || tokenMatcher(token, _ArgdownLexer.ArgdownLexer.OutgoingSupport) || tokenMatcher(token, _ArgdownLexer.ArgdownLexer.IncomingAttack) || tokenMatcher(token, _ArgdownLexer.ArgdownLexer.OutgoingAttack) || tokenMatcher(token, _ArgdownLexer.ArgdownLexer.IncomingUndercut) || tokenMatcher(token, _ArgdownLexer.ArgdownLexer.OutgoingUndercut) || tokenMatcher(token, _ArgdownLexer.ArgdownLexer.Contradiction);
}
function isRelationRule(ruleName) {
    return ruleName.endsWith("Support") || ruleName.endsWith("Attack") || ruleName.endsWith("Undercut") || ruleName == "Contradiction";
}
var argdownErrorMessageProvider = {
    buildMismatchTokenMessage: function buildMismatchTokenMessage(options) {
        if (options.ruleName == "inference") {
            if (options.expected == _ArgdownLexer.ArgdownLexer.InferenceStart) {
                return MISSING_INFERENCE_ERROR;
            } else if (options.expected == _ArgdownLexer.ArgdownLexer.InferenceEnd) {
                return MISSING_INFERENCE_END_ERROR;
            }
        } else if (options.ruleName == "metadataStatement") {
            return INVALID_METADATA_ERROR;
        } else if (options.expected == _ArgdownLexer.ArgdownLexer.Dedent && (options.ruleName == "statementRelations" || options.ruleName == "argumentRelations")) {
            if (tokenMatcher(options.actual, _ArgdownLexer.ArgdownLexer.ArgumentReference)) {
                return "Invalid relation text content. An argument reference (<Argument Title>) may not be preceded or followed by other content. If you want to start a new paragraph, insert an empty line before the reference. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
            } else if (tokenMatcher(options.actual, _ArgdownLexer.ArgdownLexer.ArgumentDefinition)) {
                return "Invalid relation text content. An argument definition (<Argument Title>:) may not be preceded by other content. If you want to start a new paragraph, insert an empty line before the definition. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
            } else if (tokenMatcher(options.actual, _ArgdownLexer.ArgdownLexer.StatementReference)) {
                return "Invalid relation text content. A statement reference ([Statement Title]) may not be preceded or followed by other content.  If you want to start a new paragraph, insert an empty line before the reference. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
            } else if (tokenMatcher(options.actual, _ArgdownLexer.ArgdownLexer.StatementDefinition)) {
                return "Invalid relation text content. A statement definition ([Statement Title]:) may not be preceded by other content.  If you want to start a new paragraph, insert an empty line before the definition. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
            } else {
                return "Invalid relation text content. Check that the content is not preceded by a statement reference ([Statement Title]) or argument reference (<Argument Title>). If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
            }
        } else if (options.ruleName == "argumentStatement") {
            if (options.expected == _ArgdownLexer.ArgdownLexer.StatementNumber) {
                return MISSING_CONCLUSION_ERROR;
            }
        }
        return defaultErrorProvider.buildMismatchTokenMessage(options);
    },
    buildNotAllInputParsedMessage: function buildNotAllInputParsedMessage(options) {
        var tokenDescription = "";
        if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.Indent) || isRelationToken(options.firstRedundant)) {
            return INVALID_RELATION_ERROR;
        } else if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.InferenceStart)) {
            return INVALID_INFERENCE_POSITION_ERROR;
        } else if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.StatementNumber)) {
            return ARGUMENT_RECONSTRUCTION_POSITION_ERROR;
        } else if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.ArgumentReference)) {
            tokenDescription = "An argument reference (<Argument Title>)";
        } else if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.ArgumentDefinition)) {
            tokenDescription = "An argument definition (<Argument TItle>:)";
        } else if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.StatementReference)) {
            tokenDescription = "A statement reference ([Statement Title])";
        } else if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.StatementDefinition)) {
            tokenDescription = "A statement  definition ([Statement Title]:)";
        } else if (tokenMatcher(options.firstRedundant, _ArgdownLexer.ArgdownLexer.Freestyle)) {
            tokenDescription = "Invalid position of text content. Make sure it is not preceded by a statement reference ([Statement Title]) or argument reference (<Argument Title>).";
        } else {
            return defaultErrorProvider.buildNotAllInputParsedMessage(options);
        }
        return tokenDescription + ' may only occur at the beginning of a line or after a relation symbol.';
    },
    buildNoViableAltMessage: function buildNoViableAltMessage(options) {
        var tokens = options.actual;
        if (options.ruleName == "argdown" && tokens.length > 0) {
            var tokenDescription = "";
            if (tokens.length >= 2 && tokenMatcher(tokens[0], _ArgdownLexer.ArgdownLexer.Indent)) {
                var secondToken = tokens[1];
                tokenDescription = GetParagraphStartTokenDescription(secondToken);
            } else if (tokens.length > 0) {
                tokenDescription = GetParagraphStartTokenDescription(tokens[0]);
            }
            return 'Invalid paragraph. Argdown paragraphs may not start with ' + tokenDescription + '. If you do not want to start a new paragraph, remove any empty lines above this one. If you do want to start a new paragraph, try starting with normal text, a statement title, argument title or a list item (using * for unordered or 1. for ordered lists).';
        } else if (isRelationRule(options.ruleName)) {
            return MISSING_RELATION_CONTENT_ERROR;
        } else if (options.ruleName == "statement") {
            if (tokens.length > 0 && (tokenMatcher(tokens[0], _ArgdownLexer.ArgdownLexer.ArgumentReference) || tokenMatcher(tokens[0], _ArgdownLexer.ArgdownLexer.ArgumentDefinition))) {
                return INVALID_ARGUMENT_STATEMENT_CONTENT_ERROR;
            }
            return MISSING_TEXT_CONTENT_ERROR;
        }
        return defaultErrorProvider.buildNoViableAltMessage(options);
    },
    buildEarlyExitMessage: function buildEarlyExitMessage(options) {
        var firstToken = options.actual[0] ? options.actual[0] : null;
        if (options.ruleName == "argdown") {
            if (firstToken && isRelationToken(firstToken)) {
                return INVALID_RELATION_ERROR;
            } else if (firstToken && tokenMatcher(firstToken, _ArgdownLexer.ArgdownLexer.InferenceStart)) {
                return INVALID_INFERENCE_POSITION_ERROR;
            }
        } else if (options.ruleName == "statementContent") {
            return MISSING_TEXT_CONTENT_ERROR;
        } else if (options.ruleName == "argument") {
            if (firstToken && isRelationToken(firstToken)) {
                return INVALID_INDENTATION_ERROR;
            }
            return INCOMPLETE_ARGUMENT_RECONSTRUCTION_ERROR;
        } else if (options.ruleName == "metadata") {
            return INVALID_INFERENCE_ERROR;
        } else if (firstToken && tokenMatcher(firstToken, _ArgdownLexer.ArgdownLexer.MetadataEnd)) {
            return INVALID_METADATA_ERROR;
        } else if (firstToken && tokenMatcher(firstToken, _ArgdownLexer.ArgdownLexer.InferenceEnd)) {
            return INVALID_INFERENCE_ERROR;
        }
        return defaultErrorProvider.buildEarlyExitMessage(options);
    }
};

module.exports = {
    ArgdownErrorMessageProvider: argdownErrorMessageProvider
};
//# sourceMappingURL=ArgdownErrorMessageProvider.js.map