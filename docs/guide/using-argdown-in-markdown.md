---
title: Using Argdown in Markdown
meta:
  - name: description
    content: How to use Argdown code fences in Markdown
---

# Using Argdown in Markdown

Argdown is not aiming to replace [Markdown](https://commonmark.org/) in your workflow. Argdown is a domain-specific language for argument analysis and reconstruction, not a general markup language for arbitrary content. Many features of Markdown (e.g. tables, images or inline html) will probably never be implemented in Argdown.

This documentation is a good example of how you can combine Markdown and Argdown: The explanatory text is written in Markdown with many Argdown examples in [code fences](/guide/using-argdown-in-markdown.html#argdown-code-fences-in-markdown). During the build process all these examples are automatically exported as Argdown web components with a zoomable map and a syntax-highlighted source view.

If you want to write a paper about your argument reconstruction, we recommend to do the same: Write the meta-commentary of your paper in Markdown to make use of its powerful features and add Argdown code wherever you want to present your reconstruction.

In VSCode (with the [Argdown VSCode extension](/guide/installing-the-vscode-extension.html) installed) you can directly see the resulting argument maps in VSCode's Markdown preview window while writing.

If you want to save your Argdown-Markdown file as a html, you have to [install the Argdown commandline tool](/guide/installing-the-commandline-tool.html) and use the `argdown markdown [input glob] [output folder]` command.

In VSCode you can [define an Argdown task](/guide/running-custom-processes.html#defining-an-argdown-task-in-vs-code) that runs this command for you.

## Argdown code fences in Markdown

You can insert as many Argdown "code snippets" as you want into your Markdown document. To do so, use [fenced code blocks](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) and add the language identifier `argdown` or `argdown-map` behind the backticks at the beginning of your fenced code block:

- Using `argdown` will create the web-component with the "source view" as the initial view.
- Using `argdown-map` will create the web-component with the "map view" as the initial view.

To further configure the web-component you can use its configuration options directly in the frontmatter section of your fenced code block:

````markdown
### Argdown-Markdown example content

Some Markdown text

An image:

![alt text](/argdown-arrow.png "Argdown arrow")

```argdown-map

===
title: my reconstruction
webComponent:
    figureCaption: This will be used as the figure caption instead of the title
===

[s]: a statement
    <- <a>: an argument

<a>

(1) first premise
(2) second premise
-----
(3) conclusion
```

Here comes a Markdown table:

| cell-header 1 | cell-header 2 |
| ------------- | ------------- |
| cell1         | cell2         |

And some inline html:

<button onClick="alert('Yay!');">whatever</button>
````

Let's see how this will look, if you export it to html. The following section is simply the example Markdown from above, exported to html:

### Argdown-Markdown example content

Some Markdown text

An image:

![Argdown arrow](/argdown-arrow.png "Argdown arrow")

```argdown-map

===
title: my reconstruction
webComponent:
    figureCaption: This will be used as the figure caption instead of the title
===

[s]: a statement
    <- <a>: an argument

<a>

(1) first premise
(2) second premise
-----
(3) conclusion
```

Here comes a Markdown table:

| cell-header 1 | cell-header 2 |
| ------------- | ------------- |
| cell1         | cell2         |

And some inline html:

<button onClick="alert('Yay!');">whatever</button>

## How to integrate Argdown-Markdown into existing applications

Advanced users that want to integrate the Argdown-Markdown export into existing applications or want to have direct access to the markdown parser have four options:

- [remark](https://github.com/remarkjs/remark) with `@argdown/remark-plugin`
- [Gatsby](https://www.gatsbyjs.org/) with `@argdown/gatsby-remark-plugin`
- [markdown-it](https://github.com/markdown-it/markdown-it) with `@argdown/markdown-it-plugin`
- [marked](https://github.com/markedjs/marked) with `@argdown/marked-plugin`

Any application that uses one of these parsers and gives you the option to configure it, can be extended with Argdown support. For example,`the static site generators [Gatsby](https://www.gatsbyjs.org/), [Eleventy](https://www.11ty.dev/) or [Vuepress](https://vuepress.vuejs.org/) can be configured to support the Argdown web component.

### How to add Argdown support to Remark

Install `remark`, `remark-html` and `@argdown/remark-plugin` in your package:

```sh
npm install remark remark-html @argdown/remark-plugin
```

Configure remark:

```javascript
import remark from "remark";
import remarkArgdownPlugin from "@argdown/remark-plugin";
import html from "remark-html";

const defaultSettings = {};
const rm = remark()
  .use(remarkArgdownPlugin, {
    argdownConfig: (cwd) => {
      return defaultSettings;
    }
  })
  .use(html as any);

const markdownInput = `
# Argdown in Markdown

\`\`\`argdown
[s]
    <- <a>
\`\`\`
`;

const argdownConfig = { webComponent: { withoutHeader: true }; // example configuration
rm.process(markdownInput, (error, file)=>{
    if(!error){
        console.log(htmlOutput);
    }else{
        console.log(error);
    }
});
```

### How to add Argdown support to Gatsby

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

### How to add Argdown support to Markdown-It

Install `markdown-it` and `@argdown/markdown-it-plugin` in your package:

```sh
npm install markdown-it @argdown/markdown-it-plugin
```

Configure the markdown-it instance:

```javascript
import MarkdownIt from "markdown-it";
import createArgdownPlugin from "@argdown/markdown-it-plugin";

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

### How to add Argdown support to Marked

Install `marked` and `@argdown/marked-plugin` in your package:

```sh
npm install marked @argdown/marked-plugin
```

Configure the marked instance:

```javascript
import marked from "marked";
import { addArgdownSupportToMarked } from "../src/argdown-marked-plugin";

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
