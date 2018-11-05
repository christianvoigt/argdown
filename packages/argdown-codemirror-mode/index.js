var mode = {
  start: [
    { regex: /\\./, token: "escaped-char" },
    { regex: /\{/, token: "data", push: "dataState" },
    { regex: /===/, token: "frontmatter", next: "frontmatter" },
    { regex: /<!--/, token: "comment", next: "htmlComment" },
    { regex: /\/\*/, token: "comment", next: "cMultiLineComment" },
    { regex: /\/\/.*?(?:\n|\r|\r\n|$)/, token: "comment" },
    { regex: /__.*?__+/, token: "bold" }, //naive implementation (no ranges within bold range supported)
    { regex: /\*\*.*?\*\*+/, token: "bold" }, //naive implementation (no ranges within bold range supported)
    { regex: /_.*?_+/, token: "italic" }, //naive implementation (no ranges within italic range supported)
    { regex: /\*.*?\*+/, token: "italic" }, //naive implementation (no ranges within italic range supported)
    { regex: /#(?:\([^\)]+\)|[\w-]+)[ \t]?/, token: "tag" },
    { regex: /[ \t]*\(\d+\)/, sol: true, token: "argument-statement" },
    { regex: /#+[ \t]+.*/, sol: true, token: "heading" },
    { regex: /[ \t]*----+/, sol: true, token: "inference" },
    { regex: /[ \t]*--+/, sol: true, token: "inference", next: "inference" },
    { regex: /\[.+\]\(.+\)/, token: "link" },
    { regex: /@\[.+\]/, token: "statement-mention" },
    { regex: /\[.+\]:/, token: "statement-definition" },
    { regex: /\[.+\]/, token: "statement-reference" },
    { regex: /@<.+>/, token: "argument-mention" },
    { regex: /<.+>:/, token: "argument-definition" },
    { regex: /<.+>/, token: "argument-reference" },
    { regex: /[ \t]+\*/, sol: true, token: "list-item" },
    { regex: /[ \t]+\d+\./, sol: true, token: "list-item" },
    { regex: /[ \t]+></, sol: true, token: "contradiction" },
    { regex: /[ \t]+\+>/, sol: true, token: "incoming-support" },
    { regex: /[ \t]+->/, sol: true, token: "incoming-attack" },
    { regex: /[ \t]+<?\+/, sol: true, token: "outgoing-support" },
    { regex: /[ \t]+<?-/, sol: true, token: "outgoing-attack" },
    { regex: /[ \t]+<_/, sol: true, token: "incoming-undercut" },
    { regex: /[ \t]+_>/, sol: true, token: "outgoing-undercut" }
  ],
  // The multi-line states
  dataState: [
    { regex: /[^\{]*?\}/, token: "data", pop: true },
    { regex: /[^\}]*?\{/, token: "data", push: "dataState" },
    { regex: /.*/, token: "data" }
  ],
  frontmatter: [{ regex: /.*?===/, token: "frontmatter", next: "start" }, { regex: /.*/, token: "frontmatter" }],
  htmlComment: [{ regex: /.*?-->/, token: "comment", next: "start" }, { regex: /.*/, token: "comment" }],
  cMultiLineComment: [{ regex: /.*?\*\//, token: "comment", next: "start" }, { regex: /.*/, token: "comment" }],
  inference: [{ regex: /.*?--+/, token: "inference", next: "start" }, { regex: /.*/, token: "inference" }],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    dontIndentStates: ["comment"]
  }
};
module.exports = mode;
