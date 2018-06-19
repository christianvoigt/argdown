import { expect } from "chai";
import { ArgdownApplication, ParserPlugin, ModelPlugin, MetaDataPlugin } from "../src/index";
import fs from "fs";
import { IMetaDataResponse } from "../src/plugins/MetaDataPlugin";

let app = new ArgdownApplication();

describe("MetaDataPlugin", function() {
  const parserPlugin = new ParserPlugin();
  const modelPlugin = new ModelPlugin();
  const metaDataPlugin = new MetaDataPlugin();
  app.addPlugin(parserPlugin, "parse-input");
  app.addPlugin(metaDataPlugin, "build-model");
  app.addPlugin(modelPlugin, "build-model");

  it("can parse metadata", function() {
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
    expect(result.ast!.metaData.author).to.equal("Christian Voigt");
    expect(result.ast!.metaData.title).to.equal("My first front matter");
    expect((<IMetaDataResponse>result).frontMatter!.author).to.equal("Christian Voigt");
    expect((<IMetaDataResponse>result).frontMatter!.title).to.equal("My first front matter");
    expect((<IMetaDataResponse>result).frontMatter!.list.length).to.equal(4);
    expect(result.sections![0].metaData.hello).to.equal("world");
    expect(result.statements!["A"].members[0].metaData.guten).to.equal("tag");
    expect(result.statements!["A"].metaData.guten).to.equal("tag");
    expect(result.statements!["A"].metaData.prop1.length).to.equal(3);
    expect(result.statements!["A"].metaData.prop1[2]).to.equal(3);
    expect(result.statements!["A"].metaData.prop2["c"]).to.equal(3);
    expect(result.arguments!["B"].metaData.myObject.name).to.equal("Klaus");
    expect(result.arguments!["B"].metaData.myObject.list[1]).to.equal(2);
    expect(result.arguments!["B"].metaData.myObject.list.length).to.equal(3);
    expect(result.arguments!["B"].metaData.auf).to.equal("wiedersehen");
  });
});
