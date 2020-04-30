# @argdown/marked-plugin

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

This package is part of the [Argdown project](https://argdown.org) and adds Argdown support to the marked Markdown parser.

For a more detailed documentation, read the guide on [how to use Argdown in Markdown](https://argdown.org/guide/use-argdown-in-markdown.html).

Here are the basics from it:

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
