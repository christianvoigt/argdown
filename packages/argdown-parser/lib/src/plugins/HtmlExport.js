"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _utils = require("../utils.js");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HtmlExport = function () {
    _createClass(HtmlExport, [{
        key: "getSettings",
        value: function getSettings(request) {
            var settings = request["html"] || request[this.name];
            if (!settings) {
                settings = {};
                request["html"] = settings;
            }
            return settings;
        }
    }, {
        key: "prepare",
        value: function prepare(request) {
            _.defaultsDeep(this.getSettings(request), this.defaults);
        }
    }]);

    function HtmlExport(config) {
        _classCallCheck(this, HtmlExport);

        this.name = "HtmlExport";
        this.defaults = _.defaultsDeep({}, config, {
            headless: false,
            cssFile: "./argdown.css",
            title: "Argdown Document",
            lang: "en",
            charset: "utf8",
            allowFileProtocol: false,
            validateLink: _utils2.default.validateLink,
            normalizeLink: _utils2.default.normalizeLink
        });
        var $ = this;
        this.argdownListeners = {
            argdownEntry: function argdownEntry(request, response) {
                response.html = "";
                response.htmlIds = {};
                var settings = $.getSettings(request);
                if (!settings.headless) {
                    var head = settings.head;
                    if (!head) {
                        head = "<!doctype html><html lang=\"" + settings.lang + "\"><head><meta charset=\"" + settings.charset + "\"><title>" + settings.title + "</title>";
                        if (settings.cssFile) {
                            head += "<link rel=\"stylesheet\" href=" + settings.cssFile + "\">";
                        }
                        head += "</head>";
                    }
                    response.html += head;
                    response.html += "<body>";
                }
                response.html += "<div class=\"argdown\">";
            },
            argdownExit: function argdownExit(request, response) {
                var settings = $.getSettings(request);
                // Remove htmlIds, because other plugins might create their own ones. 
                // Ids only need to be unique within one document, not across documents.
                response.htmlIds = null;
                response.html += "</div>";
                if (!settings.headless) {
                    response.html += "</body></html>";
                }
            },
            statementEntry: function statementEntry(request, response, node) {
                var classes = "statement";
                if (node.equivalenceClass.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.equivalenceClass.sortedTags);
                }
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"" + classes + "\">";
            },
            statementExit: function statementExit(request, response) {
                return response.html += "</div>";
            },
            StatementDefinitionEntry: function StatementDefinitionEntry(request, response, node, parentNode) {
                var htmlId = _utils2.default.getHtmlId("statement", node.statement.title, response.htmlIds);
                response.htmlIds[htmlId] = node.statement;
                var classes = "definition statement-definition definiendum";
                if (parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags) {
                    classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);
                }
                response.html += "<span id=" + htmlId + "\" class=\"" + classes + "\">[<span class=\"title statement-title\">" + _.escape(node.statement.title) + "</span>]: </span>";
            },
            StatementReferenceEntry: function StatementReferenceEntry(request, response, node, parentNode) {
                var htmlId = _utils2.default.getHtmlId("statement", node.statement.title);
                var classes = "reference statement-reference";
                if (parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags) {
                    classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);
                }
                response.html += "<a href=\"#" + htmlId + "\" class=\"" + classes + "\">[<span class=\"title statement-title\">" + _.escape(node.statement.title) + "</span>] </a>";
            },
            StatementMentionEntry: function StatementMentionEntry(request, response, node) {
                var equivalenceClass = response.statements[node.title];
                var classes = "mention statement-mention";
                if (equivalenceClass.sortedTags) {
                    classes += " " + $.getCssClassesFromTags(response, equivalenceClass.sortedTags);
                }
                var htmlId = _utils2.default.getHtmlId("statement", node.title);
                response.html += "<a href=\"#" + htmlId + "\" class=\"" + classes + "\">@[<span class=\"title statement-title\">" + _.escape(node.title) + "</span>]</a>" + node.trailingWhitespace;
            },
            argumentReferenceEntry: function argumentReferenceEntry(request, response, node) {
                var htmlId = _utils2.default.getHtmlId("argument", node.argument.title);
                var classes = "reference argument-reference";
                if (node.argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
                }
                response.html += "<a href=\"#" + htmlId + "\" data-line=\"" + node.startLine + "\" class=\"" + classes + "\">&lt;<span class=\"title argument-title\">" + _.escape(node.argument.title) + "</span>&gt; </a>";
            },
            argumentDefinitionEntry: function argumentDefinitionEntry(request, response, node) {
                var htmlId = _utils2.default.getHtmlId("argument", node.argument.title, response.htmlIds);
                response.htmlIds[htmlId] = node.argument;
                var classes = "definition argument-definition";
                if (node.argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
                }
                response.html += "<div id=\"" + htmlId + "\" data-line=\"" + node.startLine + "\" class=\"" + classes + "\"><span class=\"definiendum argument-definiendum\">&lt;<span class=\"title argument-title\">" + _.escape(node.argument.title) + "</span>&gt;: </span><span class=\"argument-definiens definiens description\">";
            },
            ArgumentMentionEntry: function ArgumentMentionEntry(request, response, node) {
                var htmlId = _utils2.default.getHtmlId("argument", node.title);
                var classes = "mention argument-mention";
                var argument = response.arguments[node.title];
                if (argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, argument.sortedTags);
                }
                response.html += "<a href=\"#" + htmlId + "\" class=\"" + classes + "\">@&lt;<span class=\"title argument-title\">" + _.escape(node.title) + "</span>&gt;</a>" + node.trailingWhitespace;
            },
            argumentDefinitionExit: function argumentDefinitionExit(request, response) {
                return response.html += "</span></div>";
            },
            incomingSupportEntry: function incomingSupportEntry(request, response, node) {
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"incoming support relation\"><div class=\"incoming support relation-symbol\"><span>+&gt;</span></div>";
            },
            incomingSupportExit: function incomingSupportExit(request, response) {
                return response.html += "</div>";
            },
            incomingAttackEntry: function incomingAttackEntry(request, response, node) {
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"incoming attack relation\"><div class=\"incoming attack relation-symbol\"><span>-&gt;</span></div>";
            },
            incomingAttackExit: function incomingAttackExit(request, response) {
                return response.html += "</div>";
            },
            incomingUndercutEntry: function incomingUndercutEntry(request, response, node) {
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"incoming undercut relation\"><div class=\"incoming undercut relation-symbol\"><span>_&gt;</span></div>";
            },
            incomingUndercutExit: function incomingUndercutExit(request, response) {
                return response.html += "</div>";
            },
            outgoingSupportEntry: function outgoingSupportEntry(request, response, node) {
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"outgoing support relation\"><div class=\"outgoing support relation-symbol\"><span>+</span></div>";
            },
            outgoingSupportExit: function outgoingSupportExit(request, response) {
                response.html += "</div>";
            },
            outgoingAttackEntry: function outgoingAttackEntry(request, response, node) {
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"outgoing attack relation\"><div class=\"outgoing attack relation-symbol\"><span>-</span></div>";
            },
            outgoingAttackExit: function outgoingAttackExit(request, response) {
                response.html += "</div>";
            },
            outgoingUndercutEntry: function outgoingUndercutEntry(request, response, node) {
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"outgoing undercut relation\"><div class=\"outgoing undercut relation-symbol\"><span>&lt;_</span></div>";
            },
            outgoingUndercutExit: function outgoingUndercutExit(request, response) {
                response.html += "</div>";
            },
            contradictionEntry: function contradictionEntry(request, response, node) {
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"contradiction relation\"><div class=\"contradiction relation-symbol\"><span>&gt;&lt;</span></div>";
            },
            contradictionExit: function contradictionExit(request, response) {
                response.html += "</div>";
            },
            relationsEntry: function relationsEntry(request, response) {
                response.html += "<div class=\"relations\">";
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
            orderedListItemEntry: function orderedListItemEntry(request, response, node) {
                return response.html += "<li data-line=\"" + node.startLine + "\">";
            },
            orderedListItemExit: function orderedListItemExit(request, response) {
                return response.html += "</li>";
            },
            unorderedListItemEntry: function unorderedListItemEntry(request, response, node) {
                return response.html += "<li data-line=\"" + node.startLine + "\">";
            },
            unorderedListItemExit: function unorderedListItemExit(request, response) {
                return response.html += "</li>";
            },
            headingEntry: function headingEntry(request, response, node) {
                var settings = $.getSettings(request);
                if (node.level == 1) {
                    if (settings.title == "Argdown Document") {
                        response.html = response.html.replace("<title>Argdown Document</title>", "<title>" + _.escape(node.text) + "</title>");
                    }
                }
                var htmlId = _utils2.default.getHtmlId("heading", node.text, response.htmlIds);
                response.htmlIds[htmlId] = node;
                response.html += "<h" + node.level + " data-line=\"" + node.startLine + "\" id=\"" + htmlId + "\">";
            },
            headingExit: function headingExit(request, response, node) {
                return response.html += "</h" + node.level + ">";
            },
            freestyleTextEntry: function freestyleTextEntry(request, response, node, parentNode) {
                if (parentNode.name != "inferenceRules" && parentNode.name != "metadataStatement") {
                    response.html += _.escape(node.text);
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
                var settings = $.getSettings(request);
                var linkUrl = settings.normalizeLink(node.url);
                var linkText = node.text;
                if (!settings.validateLink(linkUrl, settings.allowFileProtocol)) {
                    linkUrl = "";
                    linkText = "removed insecure url.";
                }
                response.html += "<a href=\"" + linkUrl + "\">" + linkText + "</a>" + node.trailingWhitespace;
            },
            TagEntry: function TagEntry(request, response, node) {
                if (node.text) {
                    response.html += "<span class=\"tag " + $.getCssClassesFromTags(response, [node.tag]) + "\">" + _.escape(node.text) + "</span>";
                }
            },
            argumentEntry: function argumentEntry(request, response, node) {
                var classes = "argument";
                if (node.argument.tags) {
                    classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
                }
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"" + classes + "\">";
            },
            argumentExit: function argumentExit(request, response) {
                return response.html += "</div>";
            },
            argumentStatementEntry: function argumentStatementEntry(request, response, node) {
                if (node.statement.role == "conclusion") {
                    var inference = node.statement.inference;
                    var metadataKeys = Object.keys(inference.metaData);
                    if (metadataKeys.length == 0 && inference.inferenceRules.length == 0) {
                        response.html += "<div data-line=\"" + inference.startLine + "\" class=\"inference\">";
                    } else {
                        response.html += "<div data-line=\"" + inference.startLine + "\" class=\"inference with-data\">";
                    }

                    response.html += "<span class=\"inference-rules\">";
                    if (inference.inferenceRules.length > 0) {
                        var i = 0;
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = inference.inferenceRules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var inferenceRule = _step.value;

                                if (i > 0) response.html += ", ";
                                response.html += "<span class=\"inference-rule\">" + inferenceRule + "</span>";
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
                        response.html += "<span class=\"metadata\">(";
                        for (var _i = 0; _i < metadataKeys.length; _i++) {
                            var key = metadataKeys[_i];
                            response.html += "<span class=\"meta-data-statement\">";
                            response.html += "<span class=\"meta-data-key\">" + key + ": </span>";
                            if (_.isString(inference.metaData[key])) {
                                response.html += "<span class=\"meta-data-value\">" + _.escape(inference.metaData[key]) + "</span>";
                            } else {
                                var j = 0;
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = inference.metaData[key][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var value = _step2.value;

                                        if (j > 0) response.html += ", ";
                                        response.html += "<span class=\"meta-data-value\">" + _.escape(value) + "</span>";
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
                response.html += "<div data-line=\"" + node.startLine + "\" class=\"" + node.statement.role + " argument-statement\"><div class=\"statement-nr\">(<span>" + node.statementNr + "</span>)</div>";
            },
            argumentStatementExit: function argumentStatementExit(request, response) {
                return response.html += "</div>";
            }
        };
    }

    _createClass(HtmlExport, [{
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
    }]);

    return HtmlExport;
}();

module.exports = {
    HtmlExport: HtmlExport
};
//# sourceMappingURL=HtmlExport.js.map