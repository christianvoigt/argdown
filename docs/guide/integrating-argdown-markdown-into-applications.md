# Integrating Argdown-Markdown into applications

Advanced users that want to integrate the Argdown-Markdown export into existing applications or want to have direct access to the markdown parser have five options:

- [remark](https://github.com/remarkjs/remark) with `@argdown/remark-plugin`
- [Gatsby](https://www.gatsbyjs.org/) with `@argdown/gatsby-remark-plugin`
- [markdown-it](https://github.com/markdown-it/markdown-it) with `@argdown/markdown-it-plugin`
- [eleventy](https://github.com/11ty/eleventy) with `@argdown/markdown-it-plugin`
- [marked](https://github.com/markedjs/marked) with `@argdown/marked-plugin`

Any application that uses one of these parsers and gives you the option to configure it, can be extended with Argdown support. For example,`the static site generators [Gatsby](https://www.gatsbyjs.org/), [Eleventy](https://www.11ty.dev/) or [Vuepress](https://vuepress.vuejs.org/) can be configured to support the Argdown web component.

### How to add Argdown support to Remark

Install `remark`, `remark-html` and `@argdown/remark-plugin` in your package:

```sh
npm install remark remark-html @argdown/remark-plugin
```

Configure remark:

```javascript
const remark = require("remark");
const remarkArgdownPlugin = require("@argdown/remark-plugin").default;
const html = require("remark-html");

const defaultSettings = {};
const rm = remark()
  .use(remarkArgdownPlugin, {
    argdownConfig: (cwd) => {
      return defaultSettings;
    }
  })
  .use(html);

const markdownInput = `
# Argdown in Markdown

\`\`\`argdown
[s]
    <- <a>
\`\`\`
`;

const argdownConfig = { webComponent: { withoutHeader: true }}; // example configuration
rm.process(markdownInput, (error, file)=>{
    if(!error){
        console.log(String(file));
    }else{
        console.log(error);
    }
});
```

Note that this example uses `import` instead of `require`. If you want to use `require` the following should work:

```javascript
const argdownPlugin = require("@argdown/remark-plugin").default;
```

## How to add Argdown support to Gatsby

Adding Argdown support to Gatsby is even easier:

```sh
npm install @argdown/gatsby-remark-plugin
```

[`gatsby-plugin-mdx`](https://www.gatsbyjs.org/docs/mdx/plugins/#remark-plugins)

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: "@argdown/gatsby-remark-plugin",
            options: {
              argdownConfig: {
                webComponent: {
                  withoutHeader: true
                }
              }
            }
          }
        ]
      }
    }
  ]
};
```

[`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark)

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "@argdown/gatsby-remark-plugin",
            options: {
              argdownConfig: {
                webComponent: {
                  withoutHeader: true
                }
              }
            }
          }
        ]
      }
    }
  ]
};
```

## How to add Argdown support to Markdown-It

Install `markdown-it` and `@argdown/markdown-it-plugin` in your package:

```sh
npm install markdown-it @argdown/markdown-it-plugin
```

Configure the markdown-it instance:

```javascript
const MarkdownIt = require("markdown-it");
const createArgdownPlugin = require("@argdown/markdown-it-plugin").default;

const markdownItPlugin = createArgdownPlugin(env => {
    return env.argdownConfig;
});
mdi.use(markdownItPlugin);
const markdownInput = `
# Argdown in Markdown

\`\`\`argdown
[s]
    <- <a>
\`\`\`
`;
const argdownConfig = { webComponent: { withoutHeader: true }; // example configuration
const htmlOutput = mdi.render(markdownInput, {
    argdownConfig // you can change the configuration for every file rendered
});
console.log(htmlOutput);
```

## How to add Argdown support to eleventy

Install `markdown-it` and `@argdown/markdown-it-plugin` in your package:

```sh
npm install markdown-it @argdown/markdown-it-plugin
```

Configure eleventy in `.eleventy.js`:

```js
const mdi = require("markdown-it");
const argdownConfig = {logLevel: "verbose"};
const createArgdownPlugin = require("@argdown/markdown-it-plugin").default;
const markdownItArgdown = createArgdownPlugin(argdownConfig);
const mdiInstance = mdi().use(markdownItArgdown);
module.exports = function(eleventyConfig) {
	eleventyConfig.setTemplateFormats([
		"html",
	  "md",
	  "css" // css is not yet a recognized template extension in Eleventy
	]);
	eleventyConfig.setLibrary("md", mdiInstance);
  };
```

## How to add Argdown support to Marked

Install `marked` and `@argdown/marked-plugin` in your package:

```sh
npm install marked @argdown/marked-plugin
```

Configure the marked instance:

```javascript
const marked = require("marked");
const { addArgdownSupportToMarked } = require("@argdown/marked-plugin");

const markedWithArgdown = addArgdownSupportToMarked(
  marked,
  new marked.Renderer(),
  {}
);
const markdownInput = `
# Argdown in Markdown

\`\`\`argdown
[s]
    <- <a>
\`\`\`
`;
const htmlOutput = markedWithArgdown(markdownInput);
console.log(htmlOutput);
```