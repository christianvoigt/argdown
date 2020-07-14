import "@argdown/web-components/dist/argdown-map.css";
import "@argdown/web-components";
import remark from "remark";
import { remarkArgdownPlugin } from "../src/argdown-remark-plugin";
// @ts-ignore
import html from "remark-html";

// const defaultSettings = {
//     withoutMaximize: true,
//     withoutZoom: true,
//     views: { source: false, map: true }
//   };
const defaultSettings = {};
const rm = remark()
  .use(remarkArgdownPlugin, {
    argdownConfig: () => {
      return defaultSettings;
    }
  })
  .use(html as any);

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
const updateOutput = async () => {
  const input = document.querySelector("textarea").value;
  const output = document.querySelector("#output");
  rm.process(input, (e, f) => {
    if (e) {
      console.log(e);
    } else {
      output.innerHTML = String(f);
    }
  });
};
document.querySelector("textarea").innerHTML = initialInput;
updateOutput();
document.querySelector("#submit").addEventListener("click", () => {
  updateOutput();
});
