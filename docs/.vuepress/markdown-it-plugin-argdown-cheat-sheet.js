var argdown = require("../../packages/argdown-core/dist/argdown.js").argdown;
var SaysWhoPlugin = require("../../packages/argdown-core/dist/plugins/SaysWhoPlugin.js")
  .SaysWhoPlugin;
argdown.addPlugin(new SaysWhoPlugin(), "add-proponents");
argdown.defaultProcesses["says-who-map"] = [
  "parse-input",
  "build-model",
  "build-map",
  "transform-closed-groups",
  "colorize",
  "add-proponents",
  "export-dot",
  "export-svg",
  "highlight-source",
  "export-web-component"
];

module.exports = md => {
  function removeFrontMatter(str) {
    return str.replace(/[\s]*===+[\s\S]*===+[\s]*/, "");
  }
  var oldFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    var token = tokens[idx];
    // var info = token.info ? unescapeAll(token.info).trim() : "";
    var info = token.info ? token.info.trim() : "";
    var langName = "";
    if (info) {
      langName = info.split(/\s+/g)[0];
    }
    if (langName === "argdown-cheatsheet") {
      token.info = token.info.replace("argdown-cheatsheet", "argdown-source");
    }

    if (langName === "argdown-cheatsheet") {
      var request = {
        input: token.content,
        process: ["parse-input", "build-model"],
        logExceptions: true,
        throwExceptions: true
      };
      var result = argdown.run(request);
      var explanation = "";
      if (result.frontMatter && result.frontMatter.explanation) {
        explanation = result.frontMatter.explanation;
      }
      var mapTitle = "";
      if (result.frontMatter && result.frontMatter.title) {
        mapTitle = result.frontMatter.title;
      }
      if (result.frontMatter && result.frontMatter.hide) {
        token.content = removeFrontMatter(token.content);
      }
      return `<ArgdownCheatSheet><template slot="source">${oldFence(
        tokens,
        idx,
        options,
        env,
        slf
      )}</template><template slot="title">${mapTitle}</template><template slot="explanation">${explanation}</template></ArgdownCheatSheet>`;
    } else if (langName === "argdown-sayswho") {
      const request = {
        input: token.content,
        process: "says-who-map",
        webComponent: {
          addGlobalStyles: false,
          addWebComponentPolyfill: false,
          addWebComponentScript: false,
          initialView: "map"
        }
      };
      const response = argdown.run(request);
      return response.webComponent;
    } else {
      return oldFence(tokens, idx, options, env, slf);
    }
  };
};
