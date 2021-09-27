// Currently not working as ESM module, waiting for Typescript to support conditional exports in package.json
// If that is supported, we can try to support esm and commonjs in exports of @argdown/core
// import { expect } from "chai";
// import { describe } from "mocha";
// import { remark } from "remark";
// import { remarkArgdownPlugin } from "../src/argdown-remark-plugin.js";
// // @ts-ignore
// import html from "remark-html";

// describe("Remark Argdown Plugin", function() {
//   const rm = remark()
//     .use(remarkArgdownPlugin)
//     .use(html as any);
//   this.timeout(5000);
//   it("can replace code fences with argument maps", async function() {
//     const result = await rm.process(`
// # Markdown header

// Some *Markdown* text before the Argdown code fences.

// \`\`\`argdown-map
// [s1]: text
//     <- <a1>: text
// \`\`\`

// Some **Markdown** text after the Argdown code fences. And now another Argdown section:

// \`\`\`argdown-map
// [s1]: text
//     <- <a1>

// <a1>

// (1) asdds
// (2) asdadasd
// -----
// (3) sadasd
// \`\`\`
// `);
//     console.log(String(result));
//     expect(String(result)).to.contain(`<argdown-map`);
//   });
// });
