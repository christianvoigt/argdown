import { IAstNode, IRelation, RelationMember } from "./model/model";
import { isTokenNode, isRuleNode } from "./model/model";
import { IToken } from "chevrotain";
import pixelWidth from "string-pixel-width";
import cloneDeep from "lodash.clonedeep";

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

export const escapeHtml = (str?: string): string | undefined => {
  if (str && !stringIsEmpty(str) && HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
};

const COLOR = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
export const validateColorString = (str: string): boolean => {
  return COLOR.test(str);
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
      str += token.tokenType.name + " " + token.image + "\n";
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
    str += token.tokenType.name + " " + token.image + "\n";
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
    str += value.tokenType!.name;
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

export const isNumber = (x: any): x is number => {
  return x !== null && typeof x === "number";
};

export const isString = (x: any): x is string => {
  return x !== null && typeof x === "string";
};

/**
 * Be careful: This check excludes arrays, even though they are objects in JavaScript.
 */
export const isObject = (x: any): x is object => {
  return !!x && typeof x === "object" && !Array.isArray(x);
};

export const isFunction = (x: any): x is Function => {
  return x !== null && typeof x === "function";
};

export const stringIsEmpty = (x: any): boolean => {
  return !isString(x) || x == "";
};
export const arrayIsEmpty = (x: any): boolean => {
  return !Array.isArray(x) || x.length == 0;
};
export const objectIsEmpty = (x: any): boolean => {
  return !isObject(x) || Object.keys(x).length == 0;
};

/**
 * Splits a string at least every x characters. If useSpaces is true,
 *
 * Returns an array of substrings.
 *
 **/
export function splitByCharactersInLine(
  s: string,
  n: number,
  useSpaces: boolean,
  a?: string[]
): string[] {
  if (!s || n <= 0) return [];

  a = a || [];
  if (s.length <= n) {
    a.push(s);
    return a;
  }
  var line = s.substring(0, n);
  if (!useSpaces) {
    // insert newlines anywhere
    a.push(line);
    return splitByCharactersInLine(s.substring(n), n, useSpaces, a);
  } else {
    // attempt to insert newlines after whitespace
    var lastSpaceRgx = /\s(?!.*\s)/;
    var idx = line.search(lastSpaceRgx);
    var nextIdx = n;
    if (idx > 0) {
      line = line.substring(0, idx);
      nextIdx = idx;
    }
    a.push(line);
    return splitByCharactersInLine(s.substring(nextIdx), n, useSpaces, a);
  }
}
/**
 * Splits a string every x pixels,
 * using string-pixel-width for measuring the width of the current line.
 *
 * Returns an array of substrings with width <= maxWidth.
 *
 * Only fonts measured by the string-pixel-width library are supported.
 **/
export const splitByLineWidth = (
  str: string,
  options: {
    maxWidth?: number;
    fontSize?: number;
    bold?: boolean;
    font?: string;
  }
): string[] => {
  if (!str) {
    return [];
  }
  const arr: string[] = [];
  const words = str.split(" ");
  let currentLineWidth = 0;
  let currentLine = "";
  let { font = "arial", fontSize = 10, bold = false, maxWidth = 0 } = options;
  const spaceWidth = pixelWidth(" ", {
    font: font,
    size: fontSize,
    bold: bold
  });
  for (let word of words) {
    const wordWidth = pixelWidth(word, {
      font: font,
      size: fontSize,
      bold: bold
    });
    if (currentLineWidth + wordWidth > maxWidth) {
      currentLineWidth = wordWidth + spaceWidth;
      arr.push(currentLine);
      currentLine = word + " ";
    } else {
      currentLineWidth += wordWidth + spaceWidth;
      currentLine += word + " ";
    }
  }
  arr.push(currentLine);
  return arr;
};
/**
 * Adds line breaks to a string every x pixels,
 * using string-pixel-width for measuring the width.
 *
 * Returns an object containing the new string and the number of lines.
 *
 * Only fonts measured by the string-pixel-width library are supported.
 **/
export const addLineBreaks = (
  str: string,
  measurePixelWidth: boolean,
  options: {
    maxWidth?: number;
    charactersInLine?: number;
    fontSize?: number;
    font?: string;
    bold?: boolean;
    lineBreak?: string;
    escapeAsHtmlEntities?: boolean;
  }
): { text: string; lines: number } => {
  if (!str) {
    return { text: "", lines: 0 };
  }
  const arr = measurePixelWidth
    ? splitByLineWidth(str, options)
    : splitByCharactersInLine(str, options.charactersInLine || 0, true);
  const lineBreak = options.lineBreak || "\n";
  if (options.escapeAsHtmlEntities) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = escapeAsHtmlEntities(arr[i]);
    }
  }
  return { lines: arr.length, text: arr.join(lineBreak) };
};
/**
 * Replaces all non-alphanumeric characters with their unicode html entity
 **/
const escapeOverrides: { [key: number]: string } = {
  0x00: "\uFFFD",
  0x80: "\u20AC",
  0x82: "\u201A",
  0x83: "\u0192",
  0x84: "\u201E",
  0x85: "\u2026",
  0x86: "\u2020",
  0x87: "\u2021",
  0x88: "\u02C6",
  0x89: "\u2030",
  0x8a: "\u0160",
  0x8b: "\u2039",
  0x8c: "\u0152",
  0x8e: "\u017D",
  0x91: "\u2018",
  0x92: "\u2019",
  0x93: "\u201C",
  0x94: "\u201D",
  0x95: "\u2022",
  0x96: "\u2013",
  0x97: "\u2014",
  0x98: "\u02DC",
  0x99: "\u2122",
  0x9a: "\u0161",
  0x9b: "\u203A",
  0x9c: "\u0153",
  0x9e: "\u017E",
  0x9f: "\u0178"
};
// see https://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript/23831239
export const escapeAsHtmlEntities = (s: string): string => {
  return s.replace(/([\u0000-\uD799]|[\uD800-\uDBFF][\uDC00-\uFFFF])/g, c => {
    const c1 = c.charCodeAt(0);
    let c1s = escapeOverrides[c1];
    // ascii character, use override or escape
    if (c1 <= 0xff) return c1s ? c1s : escape(c).replace(/%(..)/g, "&#x$1;");
    // utf8/16 character
    else if (c.length == 1) return "&#" + c1 + ";";
    // surrogate pair
    else if (c.length == 2 && c1 >= 0xd800 && c1 <= 0xdbff)
      return (
        "&#" +
        ((c1 - 0xd800) * 0x400 + c.charCodeAt(1) - 0xdc00 + 0x10000) +
        ";"
      );
    // no clue ..
    else return "";
  });
};
/**
 * Merge plugin default settings with incoming config settings.
 *
 * Any default setting can be set to an object with a 'merge' custom function.
 * In that case this function is responsible for merging the incoming setting with default settings.
 * The custom merge function will get the incoming setting as first parameter and should
 * return the merged setting.
 *
 * @param settings the incoming config settings
 * @param defaults the default settings object, possible containing objects with custom merge functions
 */
export const mergeDefaults = (
  settings: any,
  defaults: { [key: string]: any }
) => {
  for (let key of Object.keys(defaults)) {
    const incomingValue = settings[key];
    const defaultValue = defaults[key];
    const defaultValueIsObject = isObject(defaultValue);
    if (defaultValueIsObject && isFunction((<any>defaultValue).merge)) {
      settings[key] = (<any>defaultValue).merge(incomingValue);
    } else if (incomingValue == null) {
      if (isFunction(defaultValue)) {
        settings[key] = defaultValue;
      } else if (defaultValueIsObject) {
        settings[key] = mergeDefaults({}, defaultValue);
      } else {
        settings[key] = cloneDeep(defaultValue);
      }
    } else if (isObject(incomingValue) && defaultValueIsObject) {
      settings[key] = mergeDefaults(incomingValue, defaultValue);
    }
  }
  return settings;
};
type DefaultSettingValue<T> =
  | DefaultSettings<T>
  | T
  | { merge: (incoming: any) => DefaultSettingValue<T> };
export type DefaultSettings<T> = { [K in keyof T]: DefaultSettingValue<T[K]> };
/**
 * Sanitization methods for config settings.
 * These can be used for simple type checking and overwriting config settings.
 *
 * Plugins should use these methods together with mergeDefaults.
 */
export const ensure = {
  object: <T>(defaultValue: T) => {
    return {
      merge: (incoming: any) => {
        if (!incoming || !isObject(incoming)) {
          return mergeDefaults({}, defaultValue) as T;
        } else {
          return mergeDefaults(incoming, defaultValue) as T;
        }
      }
    };
  },
  string: (defaultValue: string) => {
    return {
      merge: (incoming: any) => {
        if (typeof incoming !== "string") {
          return defaultValue;
        } else {
          return incoming;
        }
      }
    };
  },
  number: (defaultValue: number) => {
    return {
      merge: (incoming: any) => {
        if (typeof incoming !== "number") {
          return defaultValue;
        } else {
          return incoming;
        }
      }
    };
  },
  boolean: (defaultValue: boolean) => {
    return {
      merge: (incoming: any) => {
        if (typeof incoming !== "boolean") {
          return defaultValue;
        } else {
          return incoming;
        }
      }
    };
  },
  array: (defaultValue: any[]) => {
    return {
      merge: (incoming: any) => {
        if (!incoming || !Array.isArray(incoming)) {
          return defaultValue;
        } else {
          return incoming;
        }
      }
    };
  }
};
/**
 * Given a relation member, returns the other relation member
 *
 * @param r the relation
 * @param e the first relation member
 * @returns the second relation member
 */
export const other = (r: IRelation, e: RelationMember): RelationMember => {
  return r.from === e ? r.to! : r.from!;
};
