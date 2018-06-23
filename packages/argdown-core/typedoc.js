module.exports = {
  out: "../../docs/.vuepress/dist/argdown-core",

  readme: "none",
  includes: "./src/",
  exclude: ["**/lexer.ts", "**/parser.ts"],

  mode: "file",
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
  target: "ES6"
};
