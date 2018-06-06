import * as _ from "lodash";
import utils from "../utils.js";

class HtmlExport {
  getSettings(request) {
    let settings = request["html"] || request[this.name];
    if (!settings) {
      settings = {};
      request["html"] = settings;
    }
    return settings;
  }
  prepare(request, response, logger) {
    _.defaultsDeep(this.getSettings(request), this.defaults);
    if (!response.ast) {
      logger.log("error", "[HTMLExportPlugin]: No AST field in response");
    }
    if (!response.statements) {
      logger.log(
        "error",
        "[HTMLExportPlugin]: No statements field in response"
      );
    }
    if (!response.arguments) {
      logger.log("error", "[HTMLExportPlugin]: No arguments field in response");
    }
  }
  constructor(config) {
    this.name = "HtmlExport";
    this.defaults = _.defaultsDeep({}, config, {
      headless: false,
      cssFile: "./argdown.css",
      title: "Argdown Document",
      lang: "en",
      charset: "utf8",
      allowFileProtocol: false,
      validateLink: utils.validateLink,
      normalizeLink: utils.normalizeLink
    });
    let $ = this;
    this.argdownListeners = {
      argdownEntry: (request, response) => {
        response.html = "";
        response.htmlIds = {};
        let settings = $.getSettings(request);
        if (!settings.headless) {
          let head = settings.head;
          if (!head) {
            head = `<!doctype html><html lang="${
              settings.lang
            }"><head><meta charset="${settings.charset}"><title>${
              settings.title
            }</title>`;
            if (settings.cssFile) {
              head += `<link rel="stylesheet" href=${settings.cssFile}">`;
            }
            head += "</head>";
          }
          response.html += head;
          response.html += "<body>";
        }
        response.html += `<div class="argdown">`;
      },
      argdownExit: (request, response) => {
        let settings = $.getSettings(request);
        // Remove htmlIds, because other plugins might create their own ones.
        // Ids only need to be unique within one document, not across documents.
        response.htmlIds = null;
        response.html += "</div>";
        if (!settings.headless) {
          response.html += "</body></html>";
        }
      },
      statementEntry: (request, response, node) => {
        let classes = "statement";
        if (node.equivalenceClass.tags) {
          classes +=
            " " +
            $.getCssClassesFromTags(response, node.equivalenceClass.sortedTags);
        }
        response.html += `<div data-line="has-line ${
          node.startLine
        }" class="${classes}">`;
      },
      statementExit: (request, response) => (response.html += "</div>"),
      StatementDefinitionEntry: (request, response, node, parentNode) => {
        let htmlId = utils.getHtmlId("statement", node.title, response.htmlIds);
        response.htmlIds[htmlId] = parentNode.statement;
        let classes = "definition statement-definition definiendum";
        if (
          parentNode.equivalenceClass &&
          parentNode.equivalenceClass.sortedTags
        ) {
          classes +=
            " " +
            $.getCssClassesFromTags(
              response,
              parentNode.equivalenceClass.sortedTags
            );
        }
        response.html += `<span id=${htmlId}" class="${classes}">[<span class="title statement-title">${_.escape(
          node.title
        )}</span>]: </span>`;
      },
      StatementReferenceEntry: (request, response, node, parentNode) => {
        let htmlId = utils.getHtmlId("statement", node.title);
        let classes = "reference statement-reference";
        if (
          parentNode.equivalenceClass &&
          parentNode.equivalenceClass.sortedTags
        ) {
          classes +=
            " " +
            $.getCssClassesFromTags(
              response,
              parentNode.equivalenceClass.sortedTags
            );
        }
        response.html += `<a href="#${htmlId}" class="${classes}">[<span class="title statement-title">${_.escape(
          node.title
        )}</span>] </a>`;
      },
      StatementMentionEntry: (request, response, node) => {
        const equivalenceClass = response.statements[node.title];
        let classes = "mention statement-mention";
        if (equivalenceClass.sortedTags) {
          classes +=
            " " +
            $.getCssClassesFromTags(response, equivalenceClass.sortedTags);
        }
        let htmlId = utils.getHtmlId("statement", node.title);
        response.html += `<a href="#${htmlId}" class="${classes}">@[<span class="title statement-title">${_.escape(
          node.title
        )}</span>]</a>${node.trailingWhitespace}`;
      },
      argumentReferenceEntry: (request, response, node) => {
        let htmlId = utils.getHtmlId("argument", node.argument.title);
        let classes = "reference argument-reference";
        if (node.argument.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
        }
        response.html += `<a href="#${htmlId}" data-line="${
          node.startLine
        }" class="has-line ${classes}">&lt;<span class="title argument-title">${_.escape(
          node.argument.title
        )}</span>&gt; </a>`;
      },
      argumentDefinitionEntry: (request, response, node) => {
        let htmlId = utils.getHtmlId(
          "argument",
          node.argument.title,
          response.htmlIds
        );
        response.htmlIds[htmlId] = node.argument;
        let classes = "definition argument-definition";
        if (node.argument.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
        }
        response.html += `<div id="${htmlId}" data-line="${
          node.startLine
        }" class="has-line ${classes}"><span class="definiendum argument-definiendum">&lt;<span class="title argument-title">${_.escape(
          node.argument.title
        )}</span>&gt;: </span><span class="argument-definiens definiens description">`;
      },
      ArgumentMentionEntry: (request, response, node) => {
        let htmlId = utils.getHtmlId("argument", node.title);
        let classes = "mention argument-mention";
        const argument = response.arguments[node.title];
        if (argument.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, argument.sortedTags);
        }
        response.html += `<a href="#${htmlId}" class="${classes}">@&lt;<span class="title argument-title">${_.escape(
          node.title
        )}</span>&gt;</a>${node.trailingWhitespace}`;
      },
      argumentDefinitionExit: (request, response) =>
        (response.html += "</span></div>"),
      incomingSupportEntry: (request, response, node) => {
        response.html += `<div data-line="${
          node.startLine
        }" class="has-line incoming support relation"><div class="incoming support relation-symbol"><span>+&gt;</span></div>`;
      },
      incomingSupportExit: (request, response) => (response.html += "</div>"),
      incomingAttackEntry: (request, response, node) => {
        response.html += `<div data-line="${
          node.startLine
        }" class="has-line incoming attack relation"><div class="incoming attack relation-symbol"><span>-&gt;</span></div>`;
      },
      incomingAttackExit: (request, response) => (response.html += "</div>"),
      incomingUndercutEntry: (request, response, node) => {
        response.html += `<div data-line="${
          node.startLine
        }" class="has-line incoming undercut relation"><div class="incoming undercut relation-symbol"><span>_&gt;</span></div>`;
      },
      incomingUndercutExit: (request, response) => (response.html += "</div>"),
      outgoingSupportEntry: (request, response, node) => {
        response.html += `<div data-line="${
          node.startLine
        }" class="has-line outgoing support relation"><div class="outgoing support relation-symbol"><span>+</span></div>`;
      },
      outgoingSupportExit: (request, response) => {
        response.html += "</div>";
      },
      outgoingAttackEntry: (request, response, node) => {
        response.html += `<div data-line="${
          node.startLine
        }" class="has-line outgoing attack relation"><div class="outgoing attack relation-symbol"><span>-</span></div>`;
      },
      outgoingAttackExit: (request, response) => {
        response.html += "</div>";
      },
      outgoingUndercutEntry: (request, response, node) => {
        response.html += `<div data-line="${
          node.startLine
        }" class="has-line outgoing undercut relation"><div class="outgoing undercut relation-symbol"><span>&lt;_</span></div>`;
      },
      outgoingUndercutExit: (request, response) => {
        response.html += "</div>";
      },
      contradictionEntry: (request, response, node) => {
        response.html += `<div data-line="${
          node.startLine
        }" class="has-line contradiction relation"><div class="contradiction relation-symbol"><span>&gt;&lt;</span></div>`;
      },
      contradictionExit: (request, response) => {
        response.html += "</div>";
      },
      relationsEntry: (request, response) => {
        response.html += `<div class="relations">`;
      },
      relationsExit: (request, response) => {
        response.html += "</div>";
      },
      orderedListEntry: (request, response) => (response.html += "<ol>"),
      orderedListExit: (request, response) => (response.html += "</ol>"),
      unorderedListEntry: (request, response) => (response.html += "<ul>"),
      unorderedListExit: (request, response) => (response.html += "</ul>"),
      orderedListItemEntry: (request, response, node) =>
        (response.html += `<li data-line="${
          node.startLine
        }" class="has-line">`),
      orderedListItemExit: (request, response) => (response.html += "</li>"),
      unorderedListItemEntry: (request, response, node) =>
        (response.html += `<li data-line="${
          node.startLine
        }" class="has-line">`),
      unorderedListItemExit: (request, response) => (response.html += "</li>"),
      headingEntry: (request, response, node) => {
        let settings = $.getSettings(request);
        if (node.level == 1) {
          if (settings.title == "Argdown Document") {
            response.html = response.html.replace(
              "<title>Argdown Document</title>",
              "<title>" + _.escape(node.text) + "</title>"
            );
          }
        }
        let htmlId = utils.getHtmlId("heading", node.text, response.htmlIds);
        response.htmlIds[htmlId] = node;
        response.html += `<h${node.level} data-line="${
          node.startLine
        }" id="${htmlId}" class="has-line heading">`;
      },
      headingExit: (request, response, node) =>
        (response.html += "</h" + node.level + ">"),
      freestyleTextEntry: (request, response, node, parentNode) => {
        if (
          parentNode.name != "inferenceRules" &&
          parentNode.name != "metadataStatement"
        ) {
          response.html += _.escape(node.text);
        }
      },
      boldEntry: (request, response) => (response.html += "<b>"),
      boldExit: (request, response, node) =>
        (response.html += "</b>" + node.trailingWhitespace),
      italicEntry: (request, response) => (response.html += "<i>"),
      italicExit: (request, response, node) =>
        (response.html += "</i>" + node.trailingWhitespace),
      LinkEntry: (request, response, node) => {
        let settings = $.getSettings(request);
        let linkUrl = settings.normalizeLink(node.url);
        let linkText = node.text;
        if (!settings.validateLink(linkUrl, settings.allowFileProtocol)) {
          linkUrl = "";
          linkText = "removed insecure url.";
        }
        response.html += `<a href="${linkUrl}">${linkText}</a>${
          node.trailingWhitespace
        }`;
      },
      TagEntry: (request, response, node) => {
        if (node.text) {
          response.html += `<span class="tag ${$.getCssClassesFromTags(
            response,
            [node.tag]
          )}">${_.escape(node.text)}</span>`;
        }
      },
      argumentEntry: (request, response, node) => {
        let classes = "argument";
        if (node.argument.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
        }
        response.html += `<div class="${classes}">`;
      },
      argumentExit: (request, response) => (response.html += "</div>"),
      argumentStatementEntry: (request, response, node) => {
        if (node.statement.role == "conclusion") {
          let inference = node.statement.inference;
          let metadataKeys = Object.keys(inference.metaData);
          if (
            metadataKeys.length == 0 &&
            inference.inferenceRules.length == 0
          ) {
            response.html += `<div data-line="${
              inference.startLine
            }" class="has-line inference">`;
          } else {
            response.html += `<div data-line="${
              inference.startLine
            }" class="has-line inference with-data">`;
          }

          response.html += `<span class="inference-rules">`;
          if (inference.inferenceRules.length > 0) {
            let i = 0;
            for (let inferenceRule of inference.inferenceRules) {
              if (i > 0) response.html += ", ";
              response.html += `<span class="inference-rule">${inferenceRule}</span>`;
              i++;
            }
            response.html += "</span> ";
          }
          if (metadataKeys.length > 0) {
            response.html += `<span class="metadata">(`;
            for (let i = 0; i < metadataKeys.length; i++) {
              let key = metadataKeys[i];
              response.html += `<span class="meta-data-statement">`;
              response.html += `<span class="meta-data-key">${key}: </span>`;
              if (_.isString(inference.metaData[key])) {
                response.html += `<span class="meta-data-value">${_.escape(
                  inference.metaData[key]
                )}</span>`;
              } else {
                let j = 0;
                for (let value of inference.metaData[key]) {
                  if (j > 0) response.html += ", ";
                  response.html += `<span class="meta-data-value">${_.escape(
                    value
                  )}</span>`;
                  j++;
                }
              }
              if (i < metadataKeys.length - 1) response.html += "; ";
              response.html += "</span>";
            }
            response.html += " )</span>";
          }

          response.html += "</div>";
        }
        response.html += `<div data-line="${node.startLine}" class="has-line ${
          node.statement.role
        } argument-statement"><div class="statement-nr">(<span>${
          node.statementNr
        }</span>)</div>`;
      },
      argumentStatementExit: (request, response) => (response.html += "</div>")
    };
  }
  getCssClassesFromTags(response, tags) {
    let classes = "";
    if (!tags || !response.tagsDictionary) {
      return classes;
    }
    let index = 0;
    for (let tag of tags) {
      if (index > 0) {
        classes += " ";
      }
      index++;
      const tagData = response.tagsDictionary[tag];
      classes += tagData.cssClass;
    }
    return classes;
  }
}
module.exports = {
  HtmlExport: HtmlExport
};
