// import pandoc from "pandoc-filter-promisified";

// const { RawBlock } = pandoc;

async function action(
  elt: any
  //   pandocOutputFormat: string,
  //   meta: pandoc.Meta
) {
  //   console.log(JSON.stringify(elt, null, 4));
  //   if (elt.t === `CodeBlock`) {
  //     // console.warn(JSON.stringify(elt, null, 4));
  //     const [headers, content] = elt.c;
  //     const [, [language]] = headers;
  //     console.warn(language);
  //     console.warn(content);
  //     if (language === "argdown-map") {
  //       // return CodeBlock(newHeaders, newContent);
  //     } else if (language === "argdown") {
  //       // return CodeBlock(newHeaders, newContent);
  //     }
  //   }
  console.warn(JSON.stringify(elt, null, 4));
}

module.exports = action;
