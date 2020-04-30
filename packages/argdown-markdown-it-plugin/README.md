# @argdown/markdown-it-plugin

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

This package is part of the [Argdown project](https://argdown.org) and adds Argdown support to the markdown-it Markdown parser.

For a more detailed documentation, read the guide on [how to use Argdown in Markdown](https://argdown.org/guide/use-argdown-in-markdown.html).

Here are the basics from it:

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
