# @argdown/remark-plugin

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

This package is part of the [Argdown project](https://argdown.org) and adds Argdown support to the remark parser.

For a more detailed documentation, read the guide on [how to use Argdown in Markdown](https://argdown.org/guide/use-argdown-in-markdown.html).

Here are the basics from it:

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
