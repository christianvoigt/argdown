import { expect } from "chai";
import { ArgdownApplication, ParserPlugin, ModelPlugin, DataPlugin } from "../src/index";

let app = new ArgdownApplication();

describe("DataPlugin", function() {
  const parserPlugin = new ParserPlugin();
  const modelPlugin = new ModelPlugin();
  const dataPlugin = new DataPlugin();
  app.addPlugin(parserPlugin, "parse-input");
  app.addPlugin(dataPlugin, "build-model");
  app.addPlugin(modelPlugin, "build-model");

  it("can parse data", function() {
    const source = `
===
author: Christian Voigt
title: My first front matter
list: [1,2,3,4]
testBool: true
===

# Heading 1 {hello: world}

[A]: text {guten: tag}

[A] {
    prop1:
        - 1
        - 2
        - 3
    prop2:
        a: 1
        b: 2
        c: 3
    }

<B>: text {myObject: {name: Klaus, list: [1,2,3]}}

<B> {auf: wiedersehen}
        `;
    const request = { process: ["parse-input", "build-model"], input: source, logLevel: "error", testBool: false };
    const result = app.run(request);
    // console.log(JSON.stringify(request));
    expect(request["testBool"]).to.be.true;
    expect((<any>request).title).to.equal("My first front matter");
    expect(result.parserErrors!.length).to.equal(0);
    expect(result.lexerErrors!.length).to.equal(0);
    expect(result.ast!.data.author).to.equal("Christian Voigt");
    expect(result.ast!.data.title).to.equal("My first front matter");
    expect(result.frontMatter!.author).to.equal("Christian Voigt");
    expect(result.frontMatter!.title).to.equal("My first front matter");
    expect(result.frontMatter!.list.length).to.equal(4);
    expect(result.sections![0].data.hello).to.equal("world");
    expect(result.statements!["A"].members[0].data.guten).to.equal("tag");
    expect(result.statements!["A"].data.guten).to.equal("tag");
    expect(result.statements!["A"].data.prop1.length).to.equal(3);
    expect(result.statements!["A"].data.prop1[2]).to.equal(3);
    expect(result.statements!["A"].data.prop2["c"]).to.equal(3);
    expect(result.arguments!["B"].data.myObject.name).to.equal("Klaus");
    expect(result.arguments!["B"].data.myObject.list[1]).to.equal(2);
    expect(result.arguments!["B"].data.myObject.list.length).to.equal(3);
    expect(result.arguments!["B"].data.auf).to.equal("wiedersehen");
  });
});
