import { expect } from "chai";
import MarkdownIt from "markdown-it";
import createArgdownPlugin from "../src/argdown-markdown-it-plugin";

describe("Markdown It! Argdown Plugin", function() {
  const mdi = new MarkdownIt();
  mdi.use(createArgdownPlugin());
  this.timeout(5000);
  it("can replace code fences with argument maps", function() {
    const result = mdi.render(`
# Markdown header

Some *Markdown* text before the Argdown code fences.

\`\`\`argdown-map
[s1]: text
    <- <a1>: text
\`\`\`

Some **Markdown** text after the Argdown code fences. And now another Argdown section: 

\`\`\`argdown-map
[s1]: text
    <- <a1>

<a1>

(1) asdds
(2) asdadasd
-----
(3) sadasd
\`\`\`
`);
    console.log(result);
    expect(result).to.contain(`<argdown-map `);
  });
});
