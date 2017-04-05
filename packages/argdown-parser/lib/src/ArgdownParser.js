'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chevrotain = require('chevrotain');

var _chevrotain2 = _interopRequireDefault(_chevrotain);

var _ArgdownLexer = require('./ArgdownLexer.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArgdownParser = function (_chevrotain$Parser) {
    _inherits(ArgdownParser, _chevrotain$Parser);

    function ArgdownParser(input, lexer) {
        _classCallCheck(this, ArgdownParser);

        var _this = _possibleConstructorReturn(this, (ArgdownParser.__proto__ || Object.getPrototypeOf(ArgdownParser)).call(this, input, lexer.tokens));

        var $ = _this;
        $.lexer = lexer;

        $.argdown = $.RULE("argdown", function () {
            var atLeastOne = $.AT_LEAST_ONE_SEP({
                SEP: lexer.Emptyline,
                DEF: function DEF() {
                    return $.OR([{
                        ALT: function ALT() {
                            return $.SUBRULE($.heading);
                        }
                    }, {
                        ALT: function ALT() {
                            return $.SUBRULE($.statement);
                        }
                    }, {
                        ALT: function ALT() {
                            return $.SUBRULE($.argument);
                        }
                    }, {
                        ALT: function ALT() {
                            return $.SUBRULE($.argumentDefinition);
                        }
                    }, {
                        ALT: function ALT() {
                            return $.SUBRULE($.argumentReference);
                        }
                    }, {
                        ALT: function ALT() {
                            return $.SUBRULE($.orderedList);
                        }
                    }, {
                        ALT: function ALT() {
                            return $.SUBRULE($.unorderedList);
                        }
                    }]);
                }
            });
            return {
                name: 'argdown',
                children: atLeastOne.values
            };
        });

        $.heading = $.RULE("heading", function () {
            var children = [];
            children.push($.CONSUME(lexer.HeadingStart));
            $.AT_LEAST_ONE({
                DEF: function DEF() {
                    return $.OR({
                        DEF: [{
                            ALT: function ALT() {
                                return children.push($.CONSUME(lexer.ArgumentMention));
                            }
                        }, {
                            ALT: function ALT() {
                                return children.push($.CONSUME(lexer.StatementMention));
                            }
                        }, {
                            ALT: function ALT() {
                                return children.push($.SUBRULE($.freestyleText));
                            }
                        }]
                    });
                }
            });

            return {
                name: "heading",
                children: children
            };
        });
        /*
         * An argument consists of at least one inferential step.
         * Note that the inferential steps are not atomic self-contained elements within the argument.
         * An inferential step can use and depend on statements from other inferential steps.
         * Inferential steps are only used to ascertain that the basic syntax of arguments is maintained:
         * There can not be inferences without premises or conclusions.
         * Isolated inferential steps are thus of no further use when working with Argdown data and should be ignored.
         * Instead, always work with the complete argument.
         */
        $.argument = $.RULE("argument", function () {
            var children = [];
            var atLeastOne = $.AT_LEAST_ONE(function () {
                return children.push($.SUBRULE($.inferentialStep));
            });
            children.concat(atLeastOne.values);
            return {
                name: "argument",
                children: children
            };
        });

        /*
         * One inferential step in an argument consisting of at least one premise, an inference and a conclusion.
         * Do not use this when traversing the AST. Instead, always work with the whole argument.
         * For further information, see $.argument.
         */
        $.inferentialStep = $.RULE("inferentialStep", function () {
            var children = [];
            $.AT_LEAST_ONE(function () {
                return children.push($.SUBRULE1($.argumentStatement));
            });
            children.push($.SUBRULE($.inference));
            children.push($.SUBRULE2($.argumentStatement));
            return {
                name: "inferentialStep",
                children: children
            };
        });
        $.argumentStatement = $.RULE("argumentStatement", function () {
            var children = [];
            children.push($.CONSUME(lexer.ArgumentStatementStart));
            children.push($.SUBRULE($.statement));
            return {
                name: "argumentStatement",
                children: children
            };
        });
        $.inference = $.RULE("inference", function () {
            var children = [];
            children.push($.CONSUME(lexer.InferenceStart));
            $.OPTION1(function () {
                children.push($.SUBRULE($.inferenceRules));
            });
            $.OPTION2(function () {
                children.push($.SUBRULE($.metadata));
            });
            children.push($.CONSUME(lexer.InferenceEnd));
            return {
                name: "inference",
                children: children
            };
        });
        $.inferenceRules = $.RULE("inferenceRules", function () {
            var children = [];
            $.AT_LEAST_ONE_SEP1({
                SEP: lexer.ListDelimiter,
                DEF: function DEF() {
                    return children.push($.SUBRULE($.freestyleText));
                }
            });
            return {
                name: "inferenceRules",
                children: children
            };
        });
        $.metadata = $.RULE("metadata", function () {
            var children = [];
            children.push($.CONSUME(lexer.MetadataStart));
            $.AT_LEAST_ONE_SEP({
                SEP: lexer.MetadataStatementEnd,
                DEF: function DEF() {
                    return children.push($.SUBRULE($.metadataStatement));
                }
            });
            children.push($.CONSUME(lexer.MetadataEnd));
            return {
                name: "metadata",
                children: children
            };
        });
        $.metadataStatement = $.RULE("metadataStatement", function () {
            var children = [];
            children.push($.SUBRULE1($.freestyleText));
            $.CONSUME(lexer.Colon);
            $.AT_LEAST_ONE_SEP({
                SEP: lexer.ListDelimiter,
                DEF: function DEF() {
                    return children.push($.SUBRULE2($.freestyleText));
                }
            });
            return {
                name: "metadataStatement",
                children: children
            };
        });

        $.list = $.RULE("orderedList", function () {
            var children = [];
            children.push($.CONSUME(lexer.Indent));
            $.AT_LEAST_ONE(function () {
                return children.push($.SUBRULE($.orderedListItem));
            });
            children.push($.CONSUME(lexer.Dedent));
            return {
                name: 'orderedList',
                children: children
            };
        });
        $.list = $.RULE("unorderedList", function () {
            var children = [];
            children.push($.CONSUME(lexer.Indent));
            $.AT_LEAST_ONE(function () {
                return children.push($.SUBRULE($.unorderedListItem));
            });
            children.push($.CONSUME(lexer.Dedent));
            return {
                name: 'unorderedList',
                children: children
            };
        });

        $.unorderedListItem = $.RULE("unorderedListItem", function () {
            var children = [];
            children.push($.CONSUME(lexer.UnorderedListItem));
            children.push($.SUBRULE($.statement));
            return {
                name: "unorderedListItem",
                children: children
            };
        });
        $.orderedListItem = $.RULE("orderedListItem", function () {
            var children = [];
            children.push($.CONSUME(lexer.OrderedListItem));
            children.push($.SUBRULE($.statement));
            return {
                name: "orderedListItem",
                children: children
            };
        });

        $.argumentReference = $.RULE("argumentReference", function () {
            var children = [];
            children.push($.CONSUME(lexer.ArgumentReference));
            $.OPTION(function () {
                children.push($.SUBRULE($.relations));
            });
            return {
                name: 'argumentReference',
                children: children
            };
        });

        $.argumentDescription = $.RULE("argumentDefinition", function () {
            var children = [];
            children.push($.CONSUME(lexer.ArgumentDefinition));
            children.push($.SUBRULE2($.statementContent));
            $.OPTION1(function () {
                children.push($.SUBRULE($.relations));
            });
            return {
                name: 'argumentDefinition',
                children: children
            };
        });

        $.statement = $.RULE("statement", function () {
            var children = [];
            children[0] = $.OR([{
                ALT: function ALT() {
                    return $.SUBRULE1($.statementContent);
                }
            }, {
                ALT: function ALT() {
                    return $.CONSUME(lexer.StatementReference);
                }
            }, {
                ALT: function ALT() {
                    var children = [];
                    children.push($.CONSUME(lexer.StatementDefinition));
                    children.push($.SUBRULE2($.statementContent));
                    return {
                        name: "statementDefinition",
                        children: children
                    };
                }
            }]);
            $.OPTION(function () {
                children.push($.SUBRULE($.relations));
            });
            return {
                name: 'statement',
                children: children
            };
        });

        $.relations = $.RULE("relations", function () {
            var children = [];
            children.push($.CONSUME(lexer.Indent));
            var atLeastOne = $.AT_LEAST_ONE(function () {
                return $.OR([{
                    ALT: function ALT() {
                        return $.SUBRULE($.incomingSupport);
                    }
                }, {
                    ALT: function ALT() {
                        return $.SUBRULE($.incomingAttack);
                    }
                }, {
                    ALT: function ALT() {
                        return $.SUBRULE($.outgoingSupport);
                    }
                }, {
                    ALT: function ALT() {
                        return $.SUBRULE($.outgoingAttack);
                    }
                }, {
                    ALT: function ALT() {
                        return $.SUBRULE($.contradiction);
                    }
                }]);
            });
            children = children.concat(atLeastOne);
            children.push($.CONSUME(lexer.Dedent));
            return {
                name: 'relations',
                children: children
            };
        });

        $.incomingSupport = $.RULE("incomingSupport", function () {
            var children = [];
            children.push($.CONSUME(lexer.IncomingSupport));
            $.OR({
                DEF: [{ ALT: function ALT() {
                        return children.push($.SUBRULE($.statement));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentDefinition));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentReference));
                    } }]
            });

            return {
                name: 'incomingSupport',
                children: children
            };
        });
        $.incomingAttack = $.RULE("incomingAttack", function () {
            var children = [];
            children.push($.CONSUME(lexer.IncomingAttack));
            $.OR({
                DEF: [{ ALT: function ALT() {
                        return children.push($.SUBRULE($.statement));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentDefinition));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentReference));
                    } }]
            });
            return {
                name: 'incomingAttack',
                children: children
            };
        });
        $.outgoingSupport = $.RULE("outgoingSupport", function () {
            var children = [];
            children.push($.CONSUME(lexer.OutgoingSupport));
            $.OR({
                DEF: [{ ALT: function ALT() {
                        return children.push($.SUBRULE($.statement));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentDefinition));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentReference));
                    } }]
            });
            return {
                name: 'outgoingSupport',
                children: children
            };
        });
        $.outgoingAttack = $.RULE("outgoingAttack", function () {
            var children = [];
            children.push($.CONSUME(lexer.OutgoingAttack));
            $.OR({
                DEF: [{ ALT: function ALT() {
                        return children.push($.SUBRULE($.statement));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentDefinition));
                    } }, { ALT: function ALT() {
                        return children.push($.SUBRULE($.argumentReference));
                    } }]
            });
            return {
                name: 'outgoingAttack',
                children: children
            };
        });
        $.contradiction = $.RULE("contradiction", function () {
            var children = [];
            children.push($.CONSUME(lexer.Contradiction));
            children.push($.SUBRULE($.statement));
            return {
                name: 'contradiction',
                children: children
            };
        });

        $.bold = $.RULE("bold", function () {
            var children = [];
            $.OR([{
                ALT: function ALT() {
                    children.push($.CONSUME(lexer.UnderscoreBoldStart));
                    children.push($.SUBRULE1($.statementContent));
                    children.push($.CONSUME(lexer.UnderscoreBoldEnd));
                }
            }, {
                ALT: function ALT() {
                    children.push($.CONSUME(lexer.AsteriskBoldStart));
                    children.push($.SUBRULE2($.statementContent));
                    children.push($.CONSUME(lexer.AsteriskBoldEnd));
                }
            }]);
            return { name: 'bold', children: children };
        });
        $.italic = $.RULE("italic", function () {
            var children = [];
            $.OR([{
                ALT: function ALT() {
                    children.push($.CONSUME(lexer.UnderscoreItalicStart));
                    children.push($.SUBRULE3($.statementContent));
                    children.push($.CONSUME(lexer.UnderscoreItalicEnd));
                }
            }, {
                ALT: function ALT() {
                    children.push($.CONSUME(lexer.AsteriskItalicStart));
                    children.push($.SUBRULE4($.statementContent));
                    children.push($.CONSUME(lexer.AsteriskItalicEnd));
                }
            }]);
            return { name: 'italic', children: children };
        });
        $.statementContent = $.RULE("statementContent", function () {
            var children = [];
            $.AT_LEAST_ONE(function () {
                return $.OR([{
                    ALT: function ALT() {
                        return children.push($.SUBRULE($.freestyleText));
                    }
                }, {
                    ALT: function ALT() {
                        return children.push($.CONSUME(lexer.Link));
                    }
                }, {
                    ALT: function ALT() {
                        return children.push($.SUBRULE($.bold));
                    }
                }, {
                    ALT: function ALT() {
                        return children.push($.SUBRULE($.italic));
                    }
                }, {
                    ALT: function ALT() {
                        return children.push($.CONSUME(lexer.ArgumentMention));
                    }
                }, {
                    ALT: function ALT() {
                        return children.push($.CONSUME(lexer.StatementMention));
                    }
                }]);
            });
            return {
                name: 'statementContent',
                children: children
            };
        });

        $.freestyleText = $.RULE("freestyleText", function () {
            var children = [];
            $.AT_LEAST_ONE(function () {
                return $.OR([{
                    ALT: function ALT() {
                        return children.push($.CONSUME(lexer.Freestyle));
                    }
                }, {
                    ALT: function ALT() {
                        return children.push($.CONSUME(lexer.UnusedControlChar));
                    }
                }]);
            });
            return {
                name: "freestyleText",
                children: children
            };
        });
        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        _chevrotain.Parser.performSelfAnalysis(_this);
        return _this;
    }

    _createClass(ArgdownParser, [{
        key: 'astToString',
        value: function astToString(value) {
            return this.logAstRecursively(value, "", "");
        }
    }, {
        key: 'astToJsonString',
        value: function astToJsonString(value) {
            return JSON.stringify(value, null, 2);
        }
    }, {
        key: 'logAstRecursively',
        value: function logAstRecursively(value, pre, str) {
            if (value === undefined) {
                str += "undefined";
                return str;
            } else if (value.tokenType) {
                str += (0, _chevrotain.getTokenConstructor)(value).tokenName;
                return str;
            }
            str += value.name;
            if (value.children && value.children.length > 0) {
                var nextPre = pre + " |";
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = value.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var child = _step.value;

                        str += "\n" + nextPre + "__";
                        str = this.logAstRecursively(child, nextPre, str);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                str += "\n" + pre;
            }
            return str;
        }
    }]);

    return ArgdownParser;
}(_chevrotain2.default.Parser);

module.exports = {
    ArgdownParser: new ArgdownParser(null, _ArgdownLexer.ArgdownLexer)
};
//# sourceMappingURL=ArgdownParser.js.map