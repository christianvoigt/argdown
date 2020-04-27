/*
Language: Argdown
Author: Christian Voigt <1pxsolidblack@gmail.com>
Website: https://argdown.org
Category: common, markup
*/

export default function(hljs: any) {
  const FRONTMATTER = {
    begin: "===",
    end: "===",
    className: "meta",
    relevance: 10
  };
  const META = {
    begin: "{",
    end: "}",
    className: "meta",
    relevance: 10
  };
  const HORIZONTAL_RULE = {
    begin: "^[-\\*]{3,}",
    end: "$"
  };
  const SUPPORT = {
    className: "support",
    begin: "^[ \t]*(\\+>|(<)?\\+)(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const ATTACK = {
    className: "attack",
    begin: "^[ \t]*(->|(<)?-)(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const UNDERCUT = {
    className: "undercut",
    begin: "^[ \t]*(_>|(<)?_)(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const CONTRADICTION = {
    className: "contradiction",
    begin: "^[ \t]*(><)(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const ARGUMENT_STATEMENT = {
    className: "argument-statement-nr",
    begin: "^[ \t]*\\(\\d+\\)(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const ARGUMENT_TITLE = {
    className: "argument-title",
    begin: "<",
    end: ">(\\:)?"
  };
  const STATEMENT_TITLE = {
    className: "statement-title",
    begin: "\\[",
    end: "\\](\\:)?"
  };
  const INFERENCE = {
    className: "inference",
    variants: [
      { begin: "^[ \\t]*---", end: "-+[ \\t]*$" },
      { begin: "^[ \\t]*--+[ \\t]*", end: "[ \\t]*--+[ \\t]*$" }
    ]
  };
  const HASHTAG = {
    className: "tag",
    variants: [
      {
        begin: "#\\(",
        end: "\\)"
      },
      {
        begin: "#[^\\s]+"
      }
    ]
  };
  const SPECIAL_CHAR = {
    className: "tag",
    variants: [
      {
        begin: "\\:[^\\s]+\\:"
      },
      {
        begin: "\\.[^\\s]+\\."
      }
    ]
  };
  const ESCAPED_CHAR = {
    className: "meta",
    begin: "\\\\[^\\s]"
  };
  const LIST = {
    className: "bullet",
    begin: "^[ \t]*(\\*|(\\d+\\.))(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const LINK = {
    begin: "\\[.+?\\][\\(\\[].*?[\\)\\]]",
    returnBegin: true,
    contains: [
      {
        className: "string",
        begin: "\\[",
        end: "\\]",
        excludeBegin: true,
        returnEnd: true,
        relevance: 0
      },
      {
        className: "link",
        begin: "\\]\\(",
        end: "\\)",
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: "symbol",
        begin: "\\]\\[",
        end: "\\]",
        excludeBegin: true,
        excludeEnd: true
      }
    ],
    relevance: 10
  };
  const BOLD = {
    className: "strong",
    contains: [] as any[],
    variants: [
      { begin: /_{2}/, end: /_{2}/ },
      { begin: /\*{2}/, end: /\*{2}/ }
    ]
  };
  const ITALIC = {
    className: "emphasis",
    contains: [] as any[],
    variants: [
      { begin: /\*(?!\*)/, end: /\*/ },
      { begin: /_(?!_)/, end: /_/, relevance: 0 }
    ]
  };
  BOLD.contains.push(ITALIC);
  ITALIC.contains.push(BOLD);

  var CONTAINABLE: any[] = [LINK];

  BOLD.contains = BOLD.contains.concat(CONTAINABLE);
  ITALIC.contains = ITALIC.contains.concat(CONTAINABLE);

  CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);

  const HEADER = {
    className: "section",
    variants: [
      {
        begin: "^#{1,6}",
        end: "$",
        contains: CONTAINABLE
      }
    ]
  };

  const BLOCKQUOTE = {
    className: "quote",
    begin: "^>\\s+",
    contains: CONTAINABLE,
    end: "$"
  };

  return {
    name: "Argdown",
    aliases: ["ad", "argd", "agd"],
    contains: [
      ESCAPED_CHAR,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.COMMENT("<!--", "-->"),
      HEADER,
      FRONTMATTER,
      META,
      LINK,
      SPECIAL_CHAR,
      HASHTAG,
      SUPPORT,
      ATTACK,
      UNDERCUT,
      CONTRADICTION,
      ARGUMENT_TITLE,
      STATEMENT_TITLE,
      ARGUMENT_STATEMENT,
      INFERENCE,
      LIST,
      BOLD,
      ITALIC,
      BLOCKQUOTE,
      HORIZONTAL_RULE
    ]
  };
}
