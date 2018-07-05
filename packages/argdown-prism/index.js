var data = {
  pattern: /\{[\S\s]*?\}[ \t]*(\r?\n|$)(?![ \t]*})/,
  alias: "cdata"
};
Prism.languages.argdown = {
  "escaped-char": /\\./,
  frontmatter: {
    pattern: /^[ \t]*===+(\r?\n)[\S\s]*(\r?\n)[ \t]*===+/,
    alias: "cdata",
    inside: {
      punctuation: /===/
    }
  },
  comment: /(\/\*[\s\S]*?\*\/|<\!--[\s\S]*?-->|(^|\r?\n| )\/\/[\S \t]*)/,
  "argument-statement": {
    pattern: /(^\s*)\(\d+\)(?=[\t ].)/m,
    lookbehind: true,
    alias: "punctuation"
  },
  inference: {
    pattern: /([ \t]*--+(\n|\r\n)[\S\s]+?(\n|\r\n)--+[ \t]*|[ \t]*----+[ \t]*(?=\r?\n))/,
    alias: "function",
    inside: {
      punctuation: /--+/,
      data
    }
  },
  data,
  url: {
    // [example](http://example.com "Optional title")
    // [example] [id]
    pattern: /!?\[[^\]]+\]\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)/,
    inside: {
      variable: {
        pattern: /(!?\[)[^\]]+(?=\]$)/,
        lookbehind: true
      },
      string: {
        pattern: /"(?:\\.|[^"\\])*"(?=\)$)/
      }
    }
  },
  title: {
    // # title 1
    // ###### title 6
    pattern: /(^\s*)#+[ ].+/m,
    lookbehind: true,
    alias: "important",
    inside: {
      punctuation: /^#+|#+$/
    }
  },
  list: {
    // * item
    // + item
    // - item
    // 1. item
    pattern: /(^\s*)(?:\*|\d+\.)(?=[\t ].)/m,
    lookbehind: true,
    alias: "punctuation"
  },
  bold: {
    // **strong**
    // __strong__

    // Allow only one line break
    pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: true,
    inside: {
      punctuation: /^\*\*|^__|\*\*$|__$/
    }
  },
  italic: {
    // *em*
    // _em_

    // Allow only one line break
    pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
    lookbehind: true,
    inside: {
      punctuation: /^[*_]|[*_]$/
    }
  },
  hashtag: {
    pattern: /(#[\w-]+|#\([\S ]+?\))/,
    alias: "cdata"
  },
  support: {
    pattern: /(^\s*)(?:\<?\+|\+\>?)(?=[\t ].)/m,
    lookbehind: true,
    alias: "operator"
  },
  attack: {
    pattern: /(^\s*)(?:\<?\-|\-\>?)(?=[\t ].)/m,
    lookbehind: true,
    alias: "operator"
  },
  undercut: {
    pattern: /(^\s*)(?:\<?\_|\_\>?)(?=[\t ].)/m,
    lookbehind: true,
    alias: "operator"
  },
  contradiction: {
    pattern: /(^\s*)><(?=[\t ].)/m,
    lookbehind: true,
    alias: "operator"
  },
  argument: {
    pattern: /(<[^<>]+>\:?|@<[^<>]+>)/,
    alias: "class-name",
    inside: {
      punctuation: /[<>@:]/
    }
  },
  statement: {
    pattern: /(\[[^\[\]]+\]\:?|@\[[^\[\]]+\])(?!\()/,
    alias: "class-name",
    inside: {
      punctuation: /[\[\]@:]/
    }
  }
};
Prism.languages.argdown["bold"].inside["url"] = Prism.languages.argdown["url"];
Prism.languages.argdown["italic"].inside["url"] = Prism.languages.argdown["url"];
Prism.languages.argdown["bold"].inside["italic"] = Prism.languages.argdown["italic"];
Prism.languages.argdown["italic"].inside["bold"] = Prism.languages.argdown["bold"];
