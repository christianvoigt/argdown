import "../node_modules/@argdown/web-components/dist/argdown-map.css";
import "@argdown/web-components";
import MarkdownIt from "markdown-it";
import createArgdownPlugin from "../src/argdown-markdown-it-plugin";
import { IWebComponentExportSettings, IArgdownRequest } from "@argdown/core";
const mdi = new MarkdownIt();
// const defaultSettings = {
//     withoutMaximize: true,
//     withoutZoom: true,
//     views: { source: false, map: true }
//   };
const defaultSettings: IArgdownRequest = {
  webComponent: { withoutHeader: true }
};
mdi.use(createArgdownPlugin(defaultSettings));
const initialInput = `
# Try out the new Markdown-Argdown Workflow!

Some *Markdown* **Text**

\`\`\`argdown-map
[s1]
   - <a1>
\`\`\`

Some more Markdown Text

\`\`\`argdown-map
===
webComponent:
    initialView: "source"
color:
    colorScheme: iwanthue-red-roses
===

[s1]
   - <a1>
   + <a2>
      - <a3>
\`\`\`

And a link to [Argdown](https://argdown.org).

\`\`\`argdown-map
[s1]
   - <a1>
      + <a4>
   + <a2>
      - <a3>
\`\`\`
`;
const updateOutput = () => {
  const input = document.querySelector("textarea").value;
  const output = document.querySelector("#output");
  output.innerHTML = mdi.render(input);
};
document.querySelector("textarea").innerHTML = initialInput;
updateOutput();
document.querySelector("#submit").addEventListener("click", () => {
  updateOutput();
});
