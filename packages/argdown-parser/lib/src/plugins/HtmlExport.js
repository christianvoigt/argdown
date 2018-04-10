"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _util = require("./util.js");

var _util2 = _interopRequireDefault(_util);

var _PluginWithSettings2 = require("./PluginWithSettings.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HtmlExport = function (_PluginWithSettings) {
    _inherits(HtmlExport, _PluginWithSettings);

    function HtmlExport(config) {
        _classCallCheck(this, HtmlExport);

        var _this = _possibleConstructorReturn(this, (HtmlExport.__proto__ || Object.getPrototypeOf(HtmlExport)).call(this, {
            headless: false,
            cssFile: "./argdown.css",
            title: "Argdown Document",
            lang: "en",
            charset: "utf8"
        }, config));

        _this.name = "HtmlExport";
        var $ = _this;
        _this.argdownListeners = {
            argdownEntry: function argdownEntry(request, response) {
                if (request.html) {
                    $.reset(request.html);
                }

                response.html = "";
                response.htmlIds = {};
                if (!$.settings.headless) {
                    var head = $.settings.head;
                    if (!head) {
                        head = "<!doctype html>\n\n" + "<html lang='" + $.settings.lang + "'>\n" + "<head>\n" + "<meta charset='" + $.settings.charset + "'>\n" + "<title>" + $.settings.title + "</title>\n";
                        if ($.settings.cssFile) {
                            head += "<link rel='stylesheet' href='" + $.settings.cssFile + "'>\n";
                        }
                        head += "</head>";
                    }
                    response.html += head;
                    response.html += "<body>";
                }
                response.html += "<div class='argdown'>";
            },
            argdownExit: function argdownExit(request, response) {
                response.html += "</div>";
                if (!$.settings.headless) {
                    response.html += "</body></html>";
                }
            },
            statementEntry: function statementEntry(request, response, node) {
                var classes = "statement";
                if (node.equivalenceClass.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.equivalenceClass.sortedTags);
                }
                response.html += "<div class='" + classes + "'>";
            },
            statementExit: function statementExit(request, response) {
                return response.html += "</div>";
            },
            StatementDefinitionEntry: function StatementDefinitionEntry(request, response, node, parentNode) {
                var htmlId = $.getHtmlId(response, "statement", node.statement.title);
                response.htmlIds[htmlId] = node.statement;
                var classes = "definition statement-definition definiendum";
                if (parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags) {
                    classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);
                }
                response.html += "<span id='" + htmlId + "' class='" + classes + "'>[<span class='title statement-title'>" + $.escapeHtml(node.statement.title) + "</span>]: </span>";
            },
            StatementReferenceEntry: function StatementReferenceEntry(request, response, node, parentNode) {
                var htmlId = $.getHtmlId(response, "statement", node.statement.title, true);
                var classes = "reference statement-reference";
                if (parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags) {
                    classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);
                }
                response.html += "<a href='#" + htmlId + "' class='" + classes + "'>[<span class='title statement-title'>" + $.escapeHtml(node.statement.title) + "</span>] </a>";
            },
            StatementMentionEntry: function StatementMentionEntry(request, response, node) {
                var equivalenceClass = response.statements[node.title];
                var classes = "mention statement-mention";
                if (equivalenceClass.sortedTags) {
                    classes += " " + $.getCssClassesFromTags(response, equivalenceClass.sortedTags);
                }
                var htmlId = $.getHtmlId(response, "statement", node.title, true);
                response.html += "<a href='#" + htmlId + "' class='" + classes + "'>@[<span class='title statement-title'>" + $.escapeHtml(node.title) + "</span>]</a>" + node.trailingWhitespace;
            },
            argumentReferenceEntry: function argumentReferenceEntry(request, response, node) {
                var htmlId = $.getHtmlId(response, "argument", node.argument.title, true);
                var classes = "reference argument-reference";
                if (node.argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
                }
                response.html += "<a href='#" + htmlId + "' class='" + classes + "'>&lt;<span class='title argument-title'>" + $.escapeHtml(node.argument.title) + "</span>&gt; </a>";
            },
            argumentDefinitionEntry: function argumentDefinitionEntry(request, response, node) {
                var htmlId = $.getHtmlId(response, "argument", node.argument.title);
                response.htmlIds[htmlId] = node.argument;
                var classes = "definition argument-definition";
                if (node.argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
                }
                response.html += "<div id='" + htmlId + "' class='" + classes + "'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>" + $.escapeHtml(node.argument.title) + "</span>&gt;: </span><span class='argument-definiens definiens description'>";
            },
            ArgumentMentionEntry: function ArgumentMentionEntry(request, response, node) {
                var htmlId = $.getHtmlId(response, "argument", node.title, true);
                var classes = "mention argument-mention";
                var argument = response.arguments[node.title];
                if (argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, argument.sortedTags);
                }
                response.html += "<a href='#" + htmlId + "' class='" + classes + "'>@&lt;<span class='title argument-title'>" + $.escapeHtml(node.title) + "</span>&gt;</a>" + node.trailingWhitespace;
            },
            argumentDefinitionExit: function argumentDefinitionExit(request, response) {
                return response.html += "</span></div>";
            },
            incomingSupportEntry: function incomingSupportEntry(request, response) {
                response.html += "<div class='incoming support relation'><div class='incoming support relation-symbol'><span>+&gt;</span></div>";
            },
            incomingSupportExit: function incomingSupportExit(request, response) {
                return response.html += "</div>";
            },
            incomingAttackEntry: function incomingAttackEntry(request, response) {
                response.html += "<div class='incoming attack relation'><div class='incoming attack relation-symbol'><span>-&gt;</span></div>";
            },
            incomingAttackExit: function incomingAttackExit(request, response) {
                return response.html += "</div>";
            },
            incomingUndercutEntry: function incomingUndercutEntry(request, response) {
                response.html += "<div class='incoming undercut relation'><div class='incoming undercut relation-symbol'><span>_&gt;</span></div>";
            },
            incomingUndercutExit: function incomingUndercutExit(request, response) {
                return response.html += "</div>";
            },
            outgoingSupportEntry: function outgoingSupportEntry(request, response) {
                response.html += "<div class='outgoing support relation'><div class='outgoing support relation-symbol'><span>+</span></div>";
            },
            outgoingSupportExit: function outgoingSupportExit(request, response) {
                response.html += "</div>";
            },
            outgoingAttackEntry: function outgoingAttackEntry(request, response) {
                response.html += "<div class='outgoing attack relation'><div class='outgoing attack relation-symbol'><span>-</span></div>";
            },
            outgoingAttackExit: function outgoingAttackExit(request, response) {
                response.html += "</div>";
            },
            outgoingUndercutEntry: function outgoingUndercutEntry(request, response) {
                response.html += "<div class='outgoing undercut relation'><div class='outgoing undercut relation-symbol'><span>&lt;_</span></div>";
            },
            outgoingUndercutExit: function outgoingUndercutExit(request, response) {
                response.html += "</div>";
            },
            contradictionEntry: function contradictionEntry(request, response) {
                response.html += "<div class='contradiction relation'><div class='contradiction relation-symbol'><span>&gt;&lt;</span></div>";
            },
            contradictionExit: function contradictionExit(request, response) {
                response.html += "</div>";
            },
            relationsEntry: function relationsEntry(request, response) {
                response.html += "<div class='relations'>";
            },
            relationsExit: function relationsExit(request, response) {
                response.html += "</div>";
            },
            orderedListEntry: function orderedListEntry(request, response) {
                return response.html += "<ol>";
            },
            orderedListExit: function orderedListExit(request, response) {
                return response.html += "</ol>";
            },
            unorderedListEntry: function unorderedListEntry(request, response) {
                return response.html += "<ul>";
            },
            unorderedListExit: function unorderedListExit(request, response) {
                return response.html += "</ul>";
            },
            orderedListItemEntry: function orderedListItemEntry(request, response) {
                return response.html += "<li>";
            },
            orderedListItemExit: function orderedListItemExit(request, response) {
                return response.html += "</li>";
            },
            unorderedListItemEntry: function unorderedListItemEntry(request, response) {
                return response.html += "<li>";
            },
            unorderedListItemExit: function unorderedListItemExit(request, response) {
                return response.html += "</li>";
            },
            headingEntry: function headingEntry(request, response, node) {
                if (node.level == 1) {
                    if ($.settings.title == "Argdown Document") {
                        response.html = response.html.replace("<title>Argdown Document</title>", "<title>" + $.escapeHtml(node.text) + "</title>");
                    }
                }
                var htmlId = $.getHtmlId(response, "heading", node.text);
                response.htmlIds[htmlId] = node;
                response.html += "<h" + node.level + " id='" + htmlId + "'>";
            },
            headingExit: function headingExit(request, response, node) {
                return response.html += "</h" + node.level + ">";
            },
            freestyleTextEntry: function freestyleTextEntry(request, response, node, parentNode) {
                if (parentNode.name != "inferenceRules" && parentNode.name != "metadataStatement") {
                    response.html += $.escapeHtml(node.text);
                }
            },
            boldEntry: function boldEntry(request, response) {
                return response.html += "<b>";
            },
            boldExit: function boldExit(request, response, node) {
                return response.html += "</b>" + node.trailingWhitespace;
            },
            italicEntry: function italicEntry(request, response) {
                return response.html += "<i>";
            },
            italicExit: function italicExit(request, response, node) {
                return response.html += "</i>" + node.trailingWhitespace;
            },
            LinkEntry: function LinkEntry(request, response, node) {
                return response.html += "<a href='" + node.url + "'>" + node.text + "</a>" + node.trailingWhitespace;
            },
            TagEntry: function TagEntry(request, response, node) {
                if (node.text) {
                    response.html += "<span class='tag " + $.getCssClassesFromTags(response, [node.tag]) + "'>" + $.escapeHtml(node.text) + "</span>";
                }
            },
            argumentEntry: function argumentEntry(request, response, node) {
                var classes = "argument";
                if (node.argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
                }
                response.html += "<div class='" + classes + "'>";
            },
            argumentExit: function argumentExit(request, response) {
                return response.html += "</div>";
            },
            argumentStatementEntry: function argumentStatementEntry(request, response, node) {
                if (node.statement.role == "conclusion") {
                    var inference = node.statement.inference;
                    var metadataKeys = Object.keys(inference.metaData);
                    if (metadataKeys.length == 0 && inference.inferenceRules.length == 0) {
                        response.html += "<div class='inference'>";
                    } else {
                        response.html += "<div class='inference with-data'>";
                    }

                    response.html += "<span class='inference-rules'>";
                    if (inference.inferenceRules.length > 0) {
                        var i = 0;
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = inference.inferenceRules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var inferenceRule = _step.value;

                                if (i > 0) response.html += ", ";
                                response.html += "<span class='inference-rule'>" + inferenceRule + "</span>";
                                i++;
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

                        response.html += "</span> ";
                    }
                    if (metadataKeys.length > 0) {
                        response.html += "<span class='metadata'>(";
                        for (var _i = 0; _i < metadataKeys.length; _i++) {
                            var key = metadataKeys[_i];
                            response.html += "<span class='meta-data-statement'>";
                            response.html += "<span class='meta-data-key'>" + key + ": </span>";
                            if (_.isString(inference.metaData[key])) {
                                response.html += "<span class='meta-data-value'>" + $.escapeHtml(inference.metaData[key]) + "</span>";
                            } else {
                                var j = 0;
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = inference.metaData[key][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var value = _step2.value;

                                        if (j > 0) response.html += ", ";
                                        response.html += "<span class='meta-data-value'>" + $.escapeHtml(value) + "</span>";
                                        j++;
                                    }
                                } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                            _iterator2.return();
                                        }
                                    } finally {
                                        if (_didIteratorError2) {
                                            throw _iteratorError2;
                                        }
                                    }
                                }
                            }
                            if (_i < metadataKeys.length - 1) response.html += "; ";
                            response.html += "</span>";
                        }
                        response.html += " )</span>";
                    }

                    response.html += "</div>";
                }
                response.html += "<div class='" + node.statement.role + " argument-statement'><div class='statement-nr'>(<span>" + node.statementNr + "</span>)</div>";
            },
            argumentStatementExit: function argumentStatementExit(request, response) {
                return response.html += "</div>";
            }
        };
        return _this;
    }

    _createClass(HtmlExport, [{
        key: "getHtmlId",
        value: function getHtmlId(response, type, title, ignoreDuplicates) {
            var id = type + "-" + title;
            id = _util2.default.getHtmlId(id);
            if (!ignoreDuplicates) {
                var originalId = id;
                var i = 1;
                while (response.htmlIds && response.htmlIds[id]) {
                    i++;
                    id = originalId + "-occurrence-" + i;
                }
            }
            return id;
        }
    }, {
        key: "getCssClassesFromTags",
        value: function getCssClassesFromTags(response, tags) {
            var classes = "";
            if (!tags || !response.tagsDictionary) {
                return classes;
            }
            var index = 0;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = tags[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var tag = _step3.value;

                    if (index > 0) {
                        classes += " ";
                    }
                    index++;
                    var tagData = response.tagsDictionary[tag];
                    classes += tagData.cssClass;
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return classes;
        }
    }, {
        key: "replaceAll",
        value: function replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, "g"), replace);
        }
    }, {
        key: "escapeHtml",
        value: function escapeHtml(unsafe) {
            return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }
    }, {
        key: "escapeRegExp",
        value: function escapeRegExp(str) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }
    }]);

    return HtmlExport;
}(_PluginWithSettings2.PluginWithSettings);

module.exports = {
    HtmlExport: HtmlExport
};
//# sourceMappingURL=HtmlExport.js.map