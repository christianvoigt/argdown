import * as _ from "lodash";
import * as utils from "../utils";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IAstNodeHandler, IRuleNodeHandler, ITokenNodeHandler } from "../ArgdownTreeWalker";
import { IArgdownResponse } from "../IArgdownResponse";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { isConclusion } from "../model/model-utils";
import { ITokenNode, IRuleNode } from "../model/model";
import { TokenNames } from "../TokenNames";
import { RuleNames } from "../RuleNames";

/**
 * Settings used by the HTMLExportPlugin
 */
export interface IHtmlExportSettings {
  /**
   * Remove sourrounding html and body tags, remove head section of HTML.
   *
   * Instead a simple div containing the argdown HTML is returned.
   */
  headless?: boolean;
  /**
   * External CSS file to include in the HTML head section.
   */
  cssFile?: string;
  /** Title of the HTML document. If not provided, the first top-level heading will be used. */
  title?: string;
  lang?: string;
  charset?: string;
  allowFileProtocol?: boolean;
  /** Optional setting to specify a custom head section. */
  head?: string;
  /** Function to test if a link is valid. */
  validateLink?: (url: string, allowFile: boolean) => boolean;
  /** Function to normalize links. */
  normalizeLink?: (url: string) => string;
}
const defaultSettings: IHtmlExportSettings = {
  headless: false,
  cssFile: "./argdown.css",
  title: "Argdown Document",
  lang: "en",
  charset: "utf8",
  allowFileProtocol: false,
  validateLink: utils.validateLink,
  normalizeLink: utils.normalizeLink
};
/**
 * Request configuration data used by the HTMLExportPlugin.
 */
export interface IHtmlRequest extends IArgdownRequest {
  html?: IHtmlExportSettings;
}
/**
 * Response data produced by the HTMLExportPlugin.
 */
export interface IHtmlResponse extends IArgdownResponse {
  /** the exported html string */
  html?: string;
  htmlIds?: { [id: string]: boolean } | null;
}
/**
 * Exports the Argdown code to HTML.
 *
 * Depends on data from: ParserPlugin, ModelPlugin
 *
 * Can use data from: TagPlugin
 */
export class HtmlExportPlugin implements IArgdownPlugin {
  name = "HtmlExportPlugin";
  defaults: IHtmlExportSettings;
  ruleListeners: { [eventId: string]: IRuleNodeHandler };
  tokenListeners: { [eventId: string]: ITokenNodeHandler };
  getSettings(request: IArgdownRequest) {
    const r = request as IHtmlRequest;
    let settings = r.html;
    if (!settings) {
      settings = {};
      r.html = settings;
    }
    return settings;
  }
  prepare: IRequestHandler = (request, response, logger) => {
    _.defaultsDeep(this.getSettings(request), this.defaults);
    if (!response.ast) {
      throw new ArgdownPluginError(this.name, "No AST field in response.");
    }
    if (!response.statements) {
      throw new ArgdownPluginError(this.name, "No statements field in response.");
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(this.name, "No arguments field in response.");
    }
  };
  constructor(config?: IHtmlExportSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
    const $ = this;
    let htmlRequest: IHtmlRequest;
    let htmlResponse: IHtmlResponse;
    this.tokenListeners = {
      [TokenNames.STATEMENT_DEFINITION]: (request, response, token, parentNode) => {
        let htmlId = utils.getHtmlId("statement", token.title!, htmlResponse.htmlIds!);
        htmlResponse.htmlIds![htmlId] = true;
        let classes = "definition statement-definition definiendum";
        if (parentNode!.equivalenceClass && parentNode!.equivalenceClass!.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, parentNode!.equivalenceClass!.sortedTags!);
        }
        htmlResponse.html += `<span id=${htmlId}" class="${classes}">[<span class="title statement-title">${_.escape(
          token.title
        )}</span>]: </span>`;
      },
      [TokenNames.STATEMENT_REFERENCE]: (request, response, token, parentNode) => {
        let htmlId = utils.getHtmlId("statement", token.title!);
        let classes = "reference statement-reference";
        if (parentNode!.equivalenceClass && parentNode!.equivalenceClass!.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, parentNode!.equivalenceClass!.sortedTags!);
        }
        htmlResponse.html += `<a href="#${htmlId}" class="${classes}">[<span class="title statement-title">${_.escape(
          token.title
        )}</span>] </a>`;
      },
      [TokenNames.STATEMENT_MENTION]: (request, response, token) => {
        const equivalenceClass = response.statements![token.title!];
        let classes = "mention statement-mention";
        if (equivalenceClass.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, equivalenceClass.sortedTags);
        }
        let htmlId = utils.getHtmlId("statement", token.title!);
        htmlResponse.html += `<a href="#${htmlId}" class="${classes}">@[<span class="title statement-title">${_.escape(
          token.title
        )}</span>]</a>${token.trailingWhitespace}`;
      },
      [TokenNames.ARGUMENT_MENTION]: (request, response, token) => {
        let htmlId = utils.getHtmlId("argument", token.title!);
        let classes = "mention argument-mention";
        const argument = response.arguments![token.title!];
        if (argument.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, argument.sortedTags);
        }
        htmlResponse.html += `<a href="#${htmlId}" class="${classes}">@&lt;<span class="title argument-title">${_.escape(
          token.title
        )}</span>&gt;</a>${token.trailingWhitespace}`;
      },
      [TokenNames.LINK]: (request, response, token) => {
        let settings = $.getSettings(request);
        let linkUrl = settings.normalizeLink!(token.url!);
        let linkText = token.text;
        if (!settings.validateLink!(linkUrl, settings.allowFileProtocol || false)) {
          linkUrl = "";
          linkText = "removed insecure url.";
        }
        htmlResponse.html += `<a href="${linkUrl}">${linkText}</a>${token.trailingWhitespace}`;
      },
      [TokenNames.TAG]: (request, response, node) => {
        const token = node as ITokenNode;
        if (token.text) {
          htmlResponse.html += `<span class="tag ${$.getCssClassesFromTags(response, [token.tag!])}">${_.escape(
            token.text
          )}</span>`;
        }
      }
    };
    this.ruleListeners = {
      [RuleNames.ARGDOWN + "Entry"]: (request, response) => {
        htmlRequest = request as IHtmlRequest;
        htmlResponse = response as IHtmlResponse;
        htmlResponse.html = "";
        htmlResponse.htmlIds = {};
        let settings = $.getSettings(request);
        if (!settings.headless) {
          let head = settings.head;
          if (!head) {
            head = `<!doctype html><html lang="${settings.lang}"><head><meta charset="${settings.charset}"><title>${
              settings.title
            }</title>`;
            if (settings.cssFile) {
              head += `<link rel="stylesheet" href=${settings.cssFile}">`;
            }
            head += "</head>";
          }
          htmlResponse.html += head;
          htmlResponse.html += "<body>";
        }
        htmlResponse.html += `<div class="argdown">`;
      },
      [RuleNames.ARGDOWN + "Exit"]: (request, response) => {
        let settings = $.getSettings(request);
        // Remove htmlIds, because other plugins might create their own ones.
        // Ids only need to be unique within one document, not across documents.
        htmlResponse.htmlIds = null;
        htmlResponse.html += "</div>";
        if (!settings.headless) {
          htmlResponse.html += "</body></html>";
        }
      },
      [RuleNames.STATEMENT + "Entry"]: (request, response, node) => {
        let classes = "statement";
        if (node.equivalenceClass && node.equivalenceClass.tags && node.equivalenceClass.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, node.equivalenceClass.sortedTags);
        }
        htmlResponse.html += `<div data-line="has-line ${node.startLine}" class="${classes}">`;
      },
      [RuleNames.STATEMENT + "Exit"]: (request, response) => (htmlResponse.html += "</div>"),
      [RuleNames.ARGUMENT_REFERENCE + "Entry"]: (request, response, node) => {
        let htmlId = utils.getHtmlId("argument", node.argument!.title!);
        let classes = "reference argument-reference";
        if (node.argument!.tags && node.argument!.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, node.argument!.sortedTags!);
        }
        htmlResponse.html += `<a href="#${htmlId}" data-line="${
          node.startLine
        }" class="has-line ${classes}">&lt;<span class="title argument-title">${_.escape(
          node.argument!.title
        )}</span>&gt; </a>`;
      },
      [RuleNames.ARGUMENT_DEFINITION + "Entry"]: (request, response, node) => {
        let htmlId = utils.getHtmlId("argument", node.argument!.title!, htmlResponse.htmlIds!);
        htmlResponse.htmlIds![htmlId] = true;
        let classes = "definition argument-definition";
        if (node.argument!.tags && node.argument!.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, node.argument!.sortedTags!);
        }
        htmlResponse.html += `<div id="${htmlId}" data-line="${
          node.startLine
        }" class="has-line ${classes}"><span class="definiendum argument-definiendum">&lt;<span class="title argument-title">${_.escape(
          node.argument!.title
        )}</span>&gt;: </span><span class="argument-definiens definiens description">`;
      },
      [RuleNames.ARGUMENT_DEFINITION + "Exit"]: (request, response) => (htmlResponse.html += "</span></div>"),
      [RuleNames.INCOMING_SUPPORT + "Entry"]: (request, response, node) => {
        htmlResponse.html += `<div data-line="${
          node.startLine
        }" class="has-line incoming support relation"><div class="incoming support relation-symbol"><span>+&gt;</span></div>`;
      },
      [RuleNames.INCOMING_SUPPORT + "Exit"]: (request, response) => (htmlResponse.html += "</div>"),
      [RuleNames.INCOMING_ATTACK + "Entry"]: (request, response, node) => {
        htmlResponse.html += `<div data-line="${
          node.startLine
        }" class="has-line incoming attack relation"><div class="incoming attack relation-symbol"><span>-&gt;</span></div>`;
      },
      [RuleNames.INCOMING_ATTACK + "Exit"]: (request, response) => (htmlResponse.html += "</div>"),
      [RuleNames.INCOMING_UNDERCUT + "Entry"]: (request, response, node) => {
        htmlResponse.html += `<div data-line="${
          node.startLine
        }" class="has-line incoming undercut relation"><div class="incoming undercut relation-symbol"><span>_&gt;</span></div>`;
      },
      [RuleNames.INCOMING_UNDERCUT + "Exit"]: (request, response) => (htmlResponse.html += "</div>"),
      [RuleNames.OUTGOING_SUPPORT + "Entry"]: (request, response, node) => {
        htmlResponse.html += `<div data-line="${
          node.startLine
        }" class="has-line outgoing support relation"><div class="outgoing support relation-symbol"><span>+</span></div>`;
      },
      [RuleNames.OUTGOING_SUPPORT + "Exit"]: (request, response) => {
        htmlResponse.html += "</div>";
      },
      [RuleNames.OUTGOING_ATTACK + "Entry"]: (request, response, node) => {
        htmlResponse.html += `<div data-line="${
          node.startLine
        }" class="has-line outgoing attack relation"><div class="outgoing attack relation-symbol"><span>-</span></div>`;
      },
      [RuleNames.OUTGOING_ATTACK + "Exit"]: (request, response) => {
        htmlResponse.html += "</div>";
      },
      [RuleNames.OUTGOING_UNDERCUT + "Entry"]: (request, response, node) => {
        htmlResponse.html += `<div data-line="${
          node.startLine
        }" class="has-line outgoing undercut relation"><div class="outgoing undercut relation-symbol"><span>&lt;_</span></div>`;
      },
      [RuleNames.OUTGOING_UNDERCUT + "Exit"]: (request, response) => {
        htmlResponse.html += "</div>";
      },
      [RuleNames.CONTRADICTION + "Entry"]: (request, response, node) => {
        htmlResponse.html += `<div data-line="${
          node.startLine
        }" class="has-line contradiction relation"><div class="contradiction relation-symbol"><span>&gt;&lt;</span></div>`;
      },
      [RuleNames.CONTRADICTION + "Exit"]: (request, response) => {
        htmlResponse.html += "</div>";
      },
      [RuleNames.RELATIONS + "Entry"]: (request, response) => {
        htmlResponse.html += `<div class="relations">`;
      },
      [RuleNames.RELATIONS + "Exit"]: (request, response) => {
        htmlResponse.html += "</div>";
      },
      [RuleNames.ORDERED_LIST + "Entry"]: (request, response) => (htmlResponse.html += "<ol>"),
      [RuleNames.ORDERED_LIST + "Exit"]: (request, response) => (htmlResponse.html += "</ol>"),
      [RuleNames.UNORDERED_LIST + "Entry"]: (request, response) => (htmlResponse.html += "<ul>"),
      [RuleNames.UNORDERED_LIST + "Exit"]: (request, response) => (htmlResponse.html += "</ul>"),
      [RuleNames.ORDERED_LIST_ITEM + "Entry"]: (request, response, node) =>
        (htmlResponse.html += `<li data-line="${node.startLine}" class="has-line">`),
      [RuleNames.ORDERED_LIST_ITEM + "Exit"]: (request, response) => (htmlResponse.html += "</li>"),
      [RuleNames.UNORDERED_LIST_ITEM + "Entry"]: (request, response, node) =>
        (htmlResponse.html += `<li data-line="${node.startLine}" class="has-line">`),
      [RuleNames.UNORDERED_LIST_ITEM + "Exit"]: (request, response) => (htmlResponse.html += "</li>"),
      [RuleNames.HEADING + "Entry"]: (request, response, node) => {
        let settings = $.getSettings(request);
        if (node.level === 1) {
          if (settings.title == "Argdown Document") {
            htmlResponse.html = htmlResponse.html!.replace(
              "<title>Argdown Document</title>",
              "<title>" + _.escape(node.text) + "</title>"
            );
          }
        }
        let htmlId = utils.getHtmlId("heading", node.text!, htmlResponse.htmlIds!);
        htmlResponse.htmlIds![htmlId] = true;
        htmlResponse.html += `<h${node.level} data-line="${node.startLine}" id="${htmlId}" class="has-line heading">`;
      },
      [RuleNames.HEADING + "Exit"]: (request, response, node) =>
        (htmlResponse.html += "</h" + (<IRuleNode>node).level + ">"),
      freestyleTextEntry: (request, response, node, parentNode) => {
        if (parentNode && parentNode.name != "inferenceRules") {
          htmlResponse.html += _.escape(node.text);
        }
      },
      [RuleNames.BOLD + "Entry"]: (request, response) => (htmlResponse.html += "<b>"),
      boldExit: (request, response, node) => (htmlResponse.html += "</b>" + node.trailingWhitespace),
      italicEntry: (request, response) => (htmlResponse.html += "<i>"),
      italicExit: (request, response, node) => (htmlResponse.html += "</i>" + node.trailingWhitespace),
      pcsEntry: (request, response, node) => {
        let classes = "argument pcs";
        if (node.argument!.sortedTags) {
          classes += " " + $.getCssClassesFromTags(response, node.argument!.sortedTags!);
        }
        htmlResponse.html += `<div class="${classes}">`;
      },
      [RuleNames.PCS + "Exit"]: (request, response) => (htmlResponse.html += "</div>"),
      argumentStatementEntry: (request, response, node) => {
        const statement = node.statement;
        if (statement && isConclusion(statement) && statement.inference) {
          let inference = statement.inference;
          if (!inference.inferenceRules || inference.inferenceRules.length == 0) {
            htmlResponse.html += `<div data-line="${inference.startLine}" class="has-line inference">`;
          } else {
            htmlResponse.html += `<div data-line="${inference.startLine}" class="has-line inference with-data">`;
          }

          htmlResponse.html += `<span class="inference-rules">`;
          if (inference.inferenceRules && inference.inferenceRules.length > 0) {
            let i = 0;
            for (let inferenceRule of inference.inferenceRules) {
              if (i > 0) htmlResponse.html += ", ";
              htmlResponse.html += `<span class="inference-rule">${inferenceRule}</span>`;
              i++;
            }
            htmlResponse.html += "</span> ";
          }
          htmlResponse.html += "</div>";
        }
        htmlResponse.html += `<div data-line="${node.startLine}" class="has-line ${
          node.statement!.role
        } argument-statement"><div class="statement-nr">(<span>${node.statementNr}</span>)</div>`;
      },
      [RuleNames.ARGUMENT_STATEMENT + "Exit"]: (request, response) => (htmlResponse.html += "</div>")
    };
  }
  getCssClassesFromTags(response: IArgdownResponse, tags: string[]): string {
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
