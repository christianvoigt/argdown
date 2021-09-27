import { expect } from "chai";
import { describe, it } from "mocha";
import MarkdownIt from "markdown-it";
import createArgdownPlugin from "../src/argdown-markdown-it-plugin";

describe("Markdown It! Argdown Plugin", function() {
  const mdi = new MarkdownIt();
  mdi.use(createArgdownPlugin());
  this.timeout(5000);
  it("can replace code fences with argument maps", function() {
    const result = mdi.render(`
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
`);
    console.log(result);
    expect(result).to.contain(`<argdown-map `);
  });
});
