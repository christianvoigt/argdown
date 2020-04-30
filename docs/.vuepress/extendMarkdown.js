var argdown = require("../../packages/argdown-core/dist/argdown.js").argdown;
var cheatSheetPlugin = require("./markdown-it-plugin-argdown-cheat-sheet");
var createArgdownPlugin = require("../../packages/argdown-markdown-it-plugin/dist/argdown-markdown-it-plugin.js")
  .default;
var container = require("markdown-it-container");
function createContainer(klass, defaultTitle) {
  return [
    container,
    klass,
    {
      render(tokens, idx) {
        const token = tokens[idx];
        const info = token.info
          .trim()
          .slice(klass.length)
          .trim();
        let title = "";
        if (info || defaultTitle) {
          title = `<p class="custom-block-title">${info || defaultTitle}</p>`;
        }
        if (token.nesting === 1) {
          return `<div class="${klass} custom-block">${title}\n`;
        } else {
          return `</div>\n`;
        }
      }
    }
  ];
}
module.exports = md => {
  md.use(...createContainer("buttonlist"));
  md.use(...createContainer("definition"));
  md.use(
    createArgdownPlugin({
      webComponent: {
        addWebComponentScript: false,
        addGlobalStyles: false,
        addWebComponentPolyfill: false
      }
    })
  );
  md.use(cheatSheetPlugin); // order matters! transforms argdown-cheatsheet into argdown-source, which is processed by markdown-it ArgdownPlugin
};
