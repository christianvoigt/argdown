import { IAstNode } from "./model/model";
import { isTokenNode, isRuleNode } from "./model/model";
import { IToken } from "chevrotain";

const mdurl = require("mdurl");
const punycode = require("punycode");

// taken from: https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js

const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS: { [char: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};

const replaceUnsafeChar = (ch: string): string => {
  return HTML_REPLACEMENTS[ch];
};

export const escapeHtml = (str: string): string => {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
};

// taken from https://github.com/markdown-it/markdown-it/blob/master/lib/index.js

////////////////////////////////////////////////////////////////////////////////
//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//

const BAD_PROTO_WITHOUT_FILE_RE = /^(vbscript|javascript|data):/;
const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

export const validateLink = (url: string, allowFile: boolean): boolean => {
  // url should be normalized at this point, and existing entities are decoded
  var str = url.trim().toLowerCase();
  var proto_re = allowFile ? BAD_PROTO_WITHOUT_FILE_RE : BAD_PROTO_RE;

  return proto_re.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
};

////////////////////////////////////////////////////////////////////////////////

const RECODE_HOSTNAME_FOR = ["http:", "https:", "mailto:"];

export const normalizeLink = (url: string): string => {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname);
      } catch (er) {
        /**/
      }
    }
  }

  return mdurl.encode(mdurl.format(parsed));
};

export const normalizeLinkText = (url: string): string => {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname);
      } catch (er) {
        /**/
      }
    }
  }

  return mdurl.decode(mdurl.format(parsed));
};

////////////////////////////////////////////////////////////////////////////////////
// ARGDOWN Utils

export const stringToHtmlId = (str: string): string => {
  let id = str;
  id = id.toLowerCase();
  id = id.replace(/ä/g, "ae");
  id = id.replace(/ö/g, "oe");
  id = id.replace(/ü/g, "ue");
  id = id.replace(/ß/g, "ss");
  id = id.replace(/\s/g, "-");
  id = id.replace(/[^a-z0-9\-]/g, "");
  return id;
};
export const stringToClassName = (str: string): string => stringToHtmlId(str);

/// Returns a html id of the form "type-title".
/// If htmlIdsSet is not null, creates an id that is not already a member of the set.
/// Example: If "statement-s1" is already a member of the set, it will return "statement-s1-occurrence-2".
/// Note that you still have to add the new id to the set yourself if you want to avoid duplicates.
export const getHtmlId = (
  type: string,
  title: string,
  htmlIdsSet?: { [id: string]: boolean }
): string => {
  let id = type + "-" + title;
  id = stringToHtmlId(id);
  if (htmlIdsSet) {
    let originalId = id;
    let i = 1;
    while (htmlIdsSet[id]) {
      i++;
      id = originalId + "-occurrence-" + i;
    }
  }
  return id;
};
export const reduceToMap = <K, V extends object>(
  a: V[],
  idProvider: (curr: V) => K
): Map<K, V> => {
  return a.reduce((acc, curr): Map<K, V> => {
    acc.set(idProvider(curr), curr);
    return acc;
  }, new Map<K, V>());
};
export const tokensToString = (tokens: IToken[]): string => {
  let str = "";
  for (let token of tokens) {
    if (token.tokenType) {
      str += token.tokenType.tokenName + " " + token.image + "\n";
    }
  }
  return str;
};
export const tokenLocationsToString = (tokens: IToken[]): string => {
  let str = "";
  for (let token of tokens) {
    if (!token.tokenType) {
      continue;
    }
    str += token.tokenType.tokenName + " " + token.image + "\n";
    str +=
      "startOffset: " +
      token.startOffset +
      " endOffset: " +
      token.endOffset +
      " startLine: " +
      token.startLine +
      " endLine: " +
      token.endLine +
      " startColumn: " +
      token.startColumn +
      " endColumn: " +
      token.endColumn +
      "\n\n";
  }
  return str;
};
export const astToString = (ast: IAstNode): string => {
  return logAstRecursively(ast, "", "");
};
export const astToJsonString = (ast: IAstNode[]): string => {
  return JSON.stringify(ast, null, 2);
};
const logAstRecursively = (
  value: IAstNode,
  pre: string,
  str: string
): string => {
  if (value === undefined) {
    str += "undefined";
    return str;
  } else if (isTokenNode(value)) {
    str += value.tokenType!.tokenName;
    return str;
  } else if (isRuleNode(value)) {
    str += value.name;
    if (value.children && value.children.length > 0) {
      let nextPre = pre + " |";
      for (let child of value.children) {
        str += "\n" + nextPre + "__";
        str = logAstRecursively(child, nextPre, str);
      }
      str += "\n" + pre;
    }
  }
  return str;
};
