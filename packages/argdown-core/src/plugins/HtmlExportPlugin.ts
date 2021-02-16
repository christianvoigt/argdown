import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IRuleNodeHandler, ITokenNodeHandler } from "../ArgdownTreeWalker";
import { checkResponseFields } from "../ArgdownPluginError";
import { ITokenNode, IRuleNode, isConclusion } from "../model/model";
import { TokenNames } from "../TokenNames";
import { RuleNames } from "../RuleNames";
import { IArgdownRequest, IArgdownResponse } from "../index";
import {
  validateLink,
  normalizeLink,
  mergeDefaults,
  getHtmlId,
  escapeHtml,
  validateColorString,
  DefaultSettings,
  isObject
} from "../utils";
import defaultsDeep from "lodash.defaultsdeep";

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
   * Create a document header from config data
   *
   * Looks for config.title,  config.author, config.date, config.subTitle and config.abstract.
   * If present will insert the data into a header section, using h1 for the title.
   * The only field required for this is the title field.
   *
   */
  createHeaderFromMetadata?: boolean;
  /**
   * External CSS file to include in the HTML head section.
   */
  cssFile?: string;
  lang?: string;
  charset?: string;
  allowFileProtocol?: boolean;
  /** Optional setting to specify a custom head section. */
  head?: string;
  /** Function to test if a link is valid. */
  validateLink?: (url: string, allowFile: boolean) => boolean;
  /** Function to normalize links. */
  normalizeLink?: (url: string) => string;
  /** Where should the html file be saved (if SaveAsPlugin is used)? */
  outputDir?: string;
  css?: string;
}
const defaultSettings: DefaultSettings<IHtmlExportSettings> = {
  headless: false,
  createHeaderFromMetadata: true,
  cssFile: "./argdown.css",
  lang: "en",
  charset: "utf8",
  allowFileProtocol: false,
  validateLink: validateLink,
  normalizeLink: normalizeLink
};
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[HtmlExportPlugin]]
     */
    html?: IHtmlExportSettings;
  }
  interface IArgdownResponse {
    /**
     * Exported html
     *
     * Provided by the [[HtmlExportPlugin]]
     **/
    html?: string;
    /**
     * Temporary store of ids for the [[HtmlExportPlugin]]
     */
    htmlIds?: { [id: string]: boolean } | null;
  }
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
    let settings = request.html;
    if (!isObject(settings)) {
      settings = {};
      request.html = settings;
    }
    return settings;
  }
  prepare: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, ["statements", "arguments", "ast"]);
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  constructor(config?: IHtmlExportSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
    const $ = this;
    this.tokenListeners = {
      [TokenNames.STATEMENT_DEFINITION]: (
        _request,
        response,
        token,
        parentNode
      ) => {
        let htmlId = getHtmlId("statement", token.title!, response.htmlIds!);
        response.htmlIds![htmlId] = true;
        let classes = "definition statement-definition definiendum";
        if (
          parentNode!.equivalenceClass &&
          parentNode!.equivalenceClass!.tags
        ) {
          classes +=
            " " +
            $.getCssClassesFromTags(
              response,
              parentNode!.equivalenceClass!.tags!
            );
        }
        const isTopLevel = parentNode!.statement!.isTopLevel;
        if (isTopLevel) {
          classes += " top-level";
        }

        response.html += `<span id="${htmlId}" class="${classes}">[<span class="title statement-title">${escapeHtml(
          token.title
        )}</span>]: </span>`;
      },
      [TokenNames.STATEMENT_REFERENCE]: (
        _request,
        response,
        token,
        parentNode
      ) => {
        let htmlId = getHtmlId("statement", token.title!);
        let classes = "reference statement-reference";
        if (
          parentNode!.equivalenceClass &&
          parentNode!.equivalenceClass!.tags
        ) {
          classes +=
            " " +
            $.getCssClassesFromTags(
              response,
              parentNode!.equivalenceClass!.tags!
            );
        }
        const isTopLevel = parentNode!.statement!.isTopLevel;
        if (isTopLevel) {
          classes += " top-level";
        }

        response.html += `<a href="#${htmlId}" class="${classes}">[<span class="title statement-title">${escapeHtml(
          token.title
        )}</span>] </a>`;
      },
      [TokenNames.STATEMENT_MENTION]: (
        _request,
        response,
        token,
        _parentNode,
        _childIndex,
        logger
      ) => {
        const equivalenceClass = response.statements![token.title!];
        let classes = "mention statement-mention";
        if (!equivalenceClass) {
          logger.log("error", "Mentioned statement not found: " + token.title);
        }
        if (equivalenceClass && equivalenceClass.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, equivalenceClass.tags);
        }
        let htmlId = getHtmlId("statement", token.title!);
        response.html += `<a href="#${htmlId}" class="${classes}">@[<span class="title statement-title">${escapeHtml(
          token.title
        )}</span>]</a>${token.trailingWhitespace}`;
      },
      [TokenNames.ARGUMENT_REFERENCE]: (
        _request,
        response,
        token,
        parentNode
      ) => {
        const argument = response.arguments![token.title!] || response.arguments![token.title!+" - 1"];// if argument was exploded, simply take argument generated from first step
        let htmlId = "";
        if (argument.members.length == 0 && argument.pcs.length == 0) {
          let htmlId = getHtmlId(
            "argument",
            token!.title!,
            response.htmlIds!
          );
          response.htmlIds![htmlId] = true;
        }
        let htmlIdLink = getHtmlId("argument", token.title!);
        let classes = "reference argument-reference";
        const isTopLevel = parentNode!.statement!.isTopLevel;
        if (isTopLevel) {
          classes += " top-level";
        }
        if (argument!.tags) {
          classes += " " + $.getCssClassesFromTags(response, argument!.tags!);
        }
        response.html += `<a id="${htmlId}" href="#${htmlIdLink}" data-line="${
          token.startLine
        }" class="has-line ${classes}">&lt;<span class="title argument-title">${escapeHtml(
          token!.title
        )}</span>&gt; </a>`;
      },
      [TokenNames.ARGUMENT_DEFINITION]: (
        _request,
        response,
        token,
        parentNode
      ) => {
        const argument = response.arguments![token.title!] || response.arguments![token.title!+" - 1"]; // if argument was exploded, simply take argument generated from first step
        let htmlId = "";
        if (argument.pcs.length == 0) {
          htmlId = getHtmlId("argument", token.title!, response.htmlIds!);
        }
        let htmlIdLink = getHtmlId("argument", token.title!);
        response.htmlIds![htmlId] = true;
        let classes = "definition argument-definition definiendum";
        const isTopLevel = parentNode!.statement!.isTopLevel;
        if (isTopLevel) {
          classes += " top-level";
        }

        if (argument!.tags) {
          classes += " " + $.getCssClassesFromTags(response, argument!.tags!);
        }
        response.html += `<a id="${htmlId}" href="#${htmlIdLink}" class="${classes}">&lt;<span class="title argument-title">${escapeHtml(
          token!.title
        )}</span>&gt;: </a>`;
      },
      [TokenNames.ARGUMENT_MENTION]: (
        _request,
        response,
        token,
        _parentNode,
        _childIndex,
        logger
      ) => {
        let htmlId = getHtmlId("argument", token.title!);
        let classes = "mention argument-mention";
        const argument = response.arguments![token.title!] || response.arguments![token.title!+" - 1"]; // if argument was exploded, simply take argument generated from first step
        if (!argument) {
          logger.log("error", "Mentioned argument not found: " + token.title);
        }
        if (argument && argument.tags) {
          classes += " " + $.getCssClassesFromTags(response, argument.tags);
        }
        response.html += `<a href="#${htmlId}" class="${classes}">@&lt;<span class="title argument-title">${escapeHtml(
          token.title
        )}</span>&gt;</a>${token.trailingWhitespace}`;
      },
      [TokenNames.LINK]: (request, response, token) => {
        let settings = $.getSettings(request);
        let linkUrl = settings.normalizeLink!(token.url!);
        let linkText = token.text;
        if (
          !settings.validateLink!(linkUrl, settings.allowFileProtocol || false)
        ) {
          linkUrl = "";
          linkText = "removed insecure url.";
        }
        response.html += `<a href="${linkUrl}">${linkText}</a>${token.trailingWhitespace}`;
      },
      [TokenNames.TAG]: (_request, response, node) => {
        const token = node as ITokenNode;
        if (token.text) {
          response.html += `<span class="tag ${$.getCssClassesFromTags(
            response,
            [token.tag!]
          )}">${escapeHtml(token.text)}</span>`;
        }
      },
      [TokenNames.NEWLINE]: (
        _request,
        response,
        _node,
        parentNode,
        childIndex
      ) => {
        if (
          response.html!.charAt(response.html!.length - 1) !== " " &&
          childIndex != parentNode!.children!.length - 1
        ) {
          response.html += " ";
        }
      }
    };
    this.ruleListeners = {
      [RuleNames.ARGDOWN + "Entry"]: (request, response) => {
        response.html = "";
        response.htmlIds = {};
        let settings = $.getSettings(request);
        let title = request.title || "Argdown Document";
        if (response.frontMatter && response.frontMatter.title) {
          title = response.frontMatter.title;
        }
        if (!settings.headless) {
          let head = settings.head;
          if (!head) {
            head = `<!doctype html><html lang="${settings.lang}"><head><meta charset="${settings.charset}"><title>${title}</title>`;
            if (settings.cssFile) {
              head += `<link rel="stylesheet" href="${settings.cssFile}">`;
            }
            if (settings.css) {
              head += `<style>${settings.css}</style>`;
            }
            if (
              response.tags &&
              (!request.color || request.color.colorizeByTag !== false)
            ) {
              let tagColorCss = "";
              for (let tag of Object.values(response.tags)) {
                if (
                  tag.cssClass &&
                  tag.color &&
                  validateColorString(tag.color)
                ) {
                  tagColorCss += `.${tag.cssClass}{color: ${tag.color};}\n`;
                }
              }
              if (tagColorCss.length > 0) {
                head += `<style>${tagColorCss}</style>`;
              }
            }
            head += "</head>";
          }
          response.html += head;
          response.html += "<body>";
        }
        response.html += `<div class="argdown">`;
        if (settings.createHeaderFromMetadata) {
          const headerTitle = request.title
            ? `<h1>${escapeHtml(request.title)}</h1>`
            : "";
          const headerSubTitle = request.subTitle
            ? `<h2 class="subtitle">${escapeHtml(request.subTitle)}</h2>`
            : "";
          let author = "";
          if (request.author) {
            let authorData = request.author;
            if (!Array.isArray(authorData)) {
              authorData = [authorData];
            }
            let i = 0;
            for (let authorStr of authorData) {
              if (i > 0) {
                author += `<span class="separator">, </span>`;
              }
              author += `<span class="author">${authorStr}</>`;
              i++;
            }
            author = `<div class="authors">${author}</div>`;
          }
          const date = request.date
            ? `<div class="date">${escapeHtml(request.date)}</div>`
            : "";
          const abstract = request.abstract
            ? `<div class="abstract">${escapeHtml(request.abstract)}</div>`
            : "";
          if (headerTitle) {
            response.html += `<header>${headerTitle}${headerSubTitle}${author}${date}${abstract}</header>`;
          }
        }
      },
      [RuleNames.ARGDOWN + "Exit"]: (request, response) => {
        let settings = $.getSettings(request);
        // Remove htmlIds, because other plugins might create their own ones.
        // Ids only need to be unique within one document, not across documents.
        response.htmlIds = null;
        response.html += "</div>";
        if (!settings.headless) {
          response.html += "</body></html>";
        }
      },
      [RuleNames.STATEMENT + "Entry"]: (_request, response, node) => {
        let classes = "statement has-line";
        if (node.equivalenceClass && node.equivalenceClass.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, node.equivalenceClass.tags);
        }
        if (node.statement && node.statement.isTopLevel) {
          classes += " top-level";
        }
        response.html += `<div data-line="${node.startLine}" class="${classes}">`;
      },
      [RuleNames.STATEMENT + "Exit"]: (_request, response) =>
        (response.html += "</div>"),
      [RuleNames.ARGUMENT + "Entry"]: (_request, response, node) => {
        let classes = "argument has-line";
        if (node.argument && node.argument.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, node.argument.tags);
        }
        if (node.statement && node.statement.isTopLevel) {
          classes += " top-level";
        }
        response.html += `<div data-line="${node.startLine}" class="${classes}">`;
      },
      [RuleNames.ARGUMENT + "Exit"]: (_request, response) =>
        (response.html += "</div>"),
      [RuleNames.PCS + "Entry"]: (_request, response, node) => {
        let classes = "pcs has-line";
        let htmlId = getHtmlId(
          "argument",
          node.argument!.title!,
          response.htmlIds!
        );
        response.htmlIds![htmlId] = true;

        if (node.argument && node.argument.tags && node.argument.tags) {
          classes +=
            " " + $.getCssClassesFromTags(response, node.argument.tags);
        }
        response.html += `<div id="${htmlId}" data-line="${node.startLine}" class="${classes}">`;
      },
      [RuleNames.PCS + "Exit"]: (_request, response) =>
        (response.html += "</div>"),
      [RuleNames.INCOMING_SUPPORT + "Entry"]: (_request, response, node) => {
        response.html += `<div data-line="${node.startLine}" class="has-line incoming support relation"><div class="incoming support relation-symbol"><span>+&gt;</span></div>`;
      },
      [RuleNames.INCOMING_SUPPORT + "Exit"]: (_request, response) =>
        (response.html += "</div>"),
      [RuleNames.INCOMING_ATTACK + "Entry"]: (_request, response, node) => {
        response.html += `<div data-line="${node.startLine}" class="has-line incoming attack relation"><div class="incoming attack relation-symbol"><span>-&gt;</span></div>`;
      },
      [RuleNames.INCOMING_ATTACK + "Exit"]: (_request, response) =>
        (response.html += "</div>"),
      [RuleNames.INCOMING_UNDERCUT + "Entry"]: (_request, response, node) => {
        response.html += `<div data-line="${node.startLine}" class="has-line incoming undercut relation"><div class="incoming undercut relation-symbol"><span>_&gt;</span></div>`;
      },
      [RuleNames.INCOMING_UNDERCUT + "Exit"]: (_request, response) =>
        (response.html += "</div>"),
      [RuleNames.OUTGOING_SUPPORT + "Entry"]: (_request, response, node) => {
        response.html += `<div data-line="${node.startLine}" class="has-line outgoing support relation"><div class="outgoing support relation-symbol"><span>+</span></div>`;
      },
      [RuleNames.OUTGOING_SUPPORT + "Exit"]: (_request, response) => {
        response.html += "</div>";
      },
      [RuleNames.OUTGOING_ATTACK + "Entry"]: (_request, response, node) => {
        response.html += `<div data-line="${node.startLine}" class="has-line outgoing attack relation"><div class="outgoing attack relation-symbol"><span>-</span></div>`;
      },
      [RuleNames.OUTGOING_ATTACK + "Exit"]: (_request, response) => {
        response.html += "</div>";
      },
      [RuleNames.OUTGOING_UNDERCUT + "Entry"]: (_request, response, node) => {
        response.html += `<div data-line="${node.startLine}" class="has-line outgoing undercut relation"><div class="outgoing undercut relation-symbol"><span>&lt;_</span></div>`;
      },
      [RuleNames.OUTGOING_UNDERCUT + "Exit"]: (_requst, response) => {
        response.html += "</div>";
      },
      [RuleNames.CONTRADICTION + "Entry"]: (_request, response, node) => {
        response.html += `<div data-line="${node.startLine}" class="has-line contradiction relation"><div class="contradiction relation-symbol"><span>&gt;&lt;</span></div>`;
      },
      [RuleNames.CONTRADICTION + "Exit"]: (_request, response) => {
        response.html += "</div>";
      },
      [RuleNames.RELATIONS + "Entry"]: (_request, response) => {
        response.html += `<div class="relations">`;
      },
      [RuleNames.RELATIONS + "Exit"]: (_request, response) => {
        response.html += "</div>";
      },
      [RuleNames.ORDERED_LIST + "Entry"]: (_request, response) =>
        (response.html += "<ol>"),
      [RuleNames.ORDERED_LIST + "Exit"]: (_request, response) =>
        (response.html += "</ol>"),
      [RuleNames.UNORDERED_LIST + "Entry"]: (_request, response) =>
        (response.html += "<ul>"),
      [RuleNames.UNORDERED_LIST + "Exit"]: (_request, response) =>
        (response.html += "</ul>"),
      [RuleNames.ORDERED_LIST_ITEM + "Entry"]: (_request, response, node) =>
        (response.html += `<li data-line="${node.startLine}" class="has-line">`),
      [RuleNames.ORDERED_LIST_ITEM + "Exit"]: (_request, response) =>
        (response.html += "</li>"),
      [RuleNames.UNORDERED_LIST_ITEM + "Entry"]: (_request, response, node) =>
        (response.html += `<li data-line="${node.startLine}" class="has-line">`),
      [RuleNames.UNORDERED_LIST_ITEM + "Exit"]: (_request, response) =>
        (response.html += "</li>"),
      [RuleNames.HEADING + "Entry"]: (request, response, node) => {
        if (node.level === 1) {
          if (!request.title) {
            response.html = response.html!.replace(
              "<title>Argdown Document</title>",
              "<title>" + escapeHtml(node.text) + "</title>"
            );
          }
        }
        let htmlId = getHtmlId("heading", node.text!, response.htmlIds!);
        response.htmlIds![htmlId] = true;
        response.html += `<h${node.level} data-line="${node.startLine}" id="${htmlId}" class="has-line heading">`;
      },
      [RuleNames.HEADING + "Exit"]: (_request, response, node) =>
        (response.html += "</h" + (<IRuleNode>node).level + ">"),
      [RuleNames.STATEMENT_CONTENT + "Entry"]: (
        _request,
        response,
        _node,
        parentNode
      ) => {
        let classes = "statement-content";
        const isTopLevel =
          parentNode!.statement && parentNode!.statement!.isTopLevel;
        if (isTopLevel) {
          classes += " top-level";
        }
        response.html += `<span class="${classes}">`;
      },
      [RuleNames.STATEMENT_CONTENT + "Exit"]: (_request, response) => {
        response.html += `</span>`;
      },
      [RuleNames.FREESTYLE_TEXT + "Entry"]: (
        _request,
        response,
        node,
        parentNode
      ) => {
        if (parentNode && parentNode.name != "inferenceRules") {
          response.html += escapeHtml(node.text) || "";
        }
      },
      [RuleNames.BOLD + "Entry"]: (_request, response) =>
        (response.html += "<b>"),
      [RuleNames.BOLD + "Exit"]: (_request, response, node) =>
        (response.html += "</b>" + node.trailingWhitespace),
      [RuleNames.ITALIC + "Entry"]: (_request, response) =>
        (response.html += "<i>"),
      [RuleNames.ITALIC + "Exit"]: (_request, response, node) =>
        (response.html += "</i>" + node.trailingWhitespace),
      [RuleNames.PCS_STATEMENT + "Entry"]: (_request, response, node) => {
        const statement = node.statement;
        if (statement && isConclusion(statement) && statement.inference) {
          let inference = statement.inference;
          if (
            !inference.inferenceRules ||
            inference.inferenceRules.length == 0
          ) {
            response.html += `<div data-line="${inference.startLine}" class="has-line inference">`;
          } else {
            response.html += `<div data-line="${inference.startLine}" class="has-line inference with-data">`;
          }

          response.html += `<span class="inference-rules">`;
          if (inference.inferenceRules && inference.inferenceRules.length > 0) {
            let i = 0;
            for (let inferenceRule of inference.inferenceRules) {
              if (i > 0) response.html += ", ";
              response.html += `<span class="inference-rule">${inferenceRule}</span>`;
              i++;
            }
            response.html += "</span> ";
          }
          response.html += "</div>";
        }
        response.html += `<div data-line="${node.startLine}" class="has-line ${
          node.statement!.role
        } pcs-statement"><div class="statement-nr">(<span>${
          node.statementNr
        }</span>)</div>`;
      },
      [RuleNames.PCS_STATEMENT + "Exit"]: (_request, response) =>
        (response.html += "</div>")
    };
  }
  getCssClassesFromTags(response: IArgdownResponse, tags: string[]): string {
    let classes = "";
    if (!tags || tags.length === 0 || !response.tags) {
      return classes;
    }
    classes = tags
      .sort((a, b) => {
        const aTagData = response.tags![a];
        const bTagData = response.tags![b];
        return (aTagData.priority || 0) - (bTagData.priority || 0);
      })
      .map(t => {
        const tagData = response.tags![t];
        if (tagData) {
          return tagData.cssClass;
        }
        return undefined;
      })
      .filter(cssClass => cssClass !== undefined)
      .join(" ");
    return classes;
  }
}
