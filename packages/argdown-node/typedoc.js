module.exports = {
  out: "../../docs/.vuepress/dist/argdown-node",

  readme: "none",
  includes: "./src/",
  exclude: ["**/lexer.ts", "**/parser.ts"],

  mode: "file",
  module: "commonjs",
  excludeExternals: false,
  excludeNotExported: true,
  excludePrivate: true,

  target: "ES6"
};
