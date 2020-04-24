import { expect } from "chai";
import marked from "marked";
import { addArgdownSupportToMarked } from "../src/argdown-marked-plugin";

describe("Marked Argdown Plugin", function() {
  const markedWithArgdown = addArgdownSupportToMarked(
    marked,
    new marked.Renderer()
  );
  this.timeout(5000);
  it("can replace code fences with argument maps", function() {
    const result = markedWithArgdown(`
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
    expect(result).to.contain(`<argdown-map initial-view="map">`);
  });
});
