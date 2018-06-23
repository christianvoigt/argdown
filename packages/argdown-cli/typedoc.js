module.exports = {
  out: "../../docs/argdown-cli",

  readme: "none",
  includes: "./src/",
  exclude: ["**/lexer.ts", "**/parser.ts"],

  mode: "file",
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
  target: "ES6"
};
