// module.exports = {
//   title: "Argdown",
//   description: "A simple argumentation syntax inspired by Markdown",
//   base: "argdown",
//   markdown: {
//     lineNumbers: true
//   }
// };
var argdown = require("../../packages/argdown-node/dist/src/index.js").argdown;

require("../../packages/argdown-prism/index.js");
var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source, "gi");
function unescapeAll(str) {
  if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) {
    return str;
  }

  return str.replace(UNESCAPE_ALL_RE, function(match, escaped, entity) {
    if (escaped) {
      return escaped;
    }
    return replaceEntityPattern(match, entity);
  });
}
function removeFrontMatter(str) {
  return str.replace(/[\s]*===+[\s\S]*===+[\s]*/, "");
}
module.exports = {
  title: "Argdown",
  description: "A simple syntax for complex argumentation",
  //   base: "argdown",
  markdown: {
    config: md => {
      var oldFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        var token = tokens[idx];
        var info = token.info ? unescapeAll(token.info).trim() : "";
        var langName = "";
        if (info) {
          langName = info.split(/\s+/g)[0];
        }
        if (langName === "argdown-map") {
          token.info = token.info.replace("argdown-map", "argdown");
        } else if (langName === "argdown-source") {
          token.info = token.info.replace("argdown-source", "argdown");
        } else if (langName === "argdown-cheatsheet") {
          token.info = token.info.replace("argdown-cheatsheet", "argdown");
        }
        if (langName === "argdown" || langName === "argdown-map") {
          var request = {
            input: token.content,
            process: ["parse-input", "build-model", "build-map", "export-dot", "export-svg"],
            dotToSvg: { removeProlog: true }
          };
          var result = argdown.run(request);
          var initialView = "source";
          if (langName === "argdown-map") {
            initialView = "map";
          }
          var mapTitle = "";
          if (result.frontMatter && result.frontMatter.title) {
            mapTitle = result.frontMatter.title;
          }
          if (result.frontMatter && result.frontMatter.hide) {
            token.content = removeFrontMatter(token.content);
          }
          return `<ArgdownSnippet initial-view="${initialView}" title="${mapTitle}"><template slot="map">${
            result.svg
          }</template><template slot="source">${oldFence(tokens, idx, options, env, slf)}</template></ArgdownSnippet>`;
        } else if (langName === "argdown-cheatsheet") {
          var request = {
            input: token.content,
            process: ["parse-input", "build-model"]
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
        } else {
          return oldFence(tokens, idx, options, env, slf);
        }
      };
    }
  },
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "Syntax", link: "/syntax/" },
      { text: "Configuration", link: "/configuration/" },
      { text: "API", link: "/api/" },
      { text: "Github", link: "https://github.com/christianvoigt/argdown" }
    ]
  }
};
