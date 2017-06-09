import { expect } from 'chai';
import {ArgdownApplication, ParserPlugin, ModelPlugin, TagPlugin} from '../src/index.js';

let app = new ArgdownApplication();
let parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, 'parse-input');
let modelPlugin = new ModelPlugin();
let tagPlugin = new TagPlugin();
app.addPlugin(modelPlugin,'build-model');
app.addPlugin(tagPlugin, 'build-model');

describe("TagPlugin", function() {
  it("can sort tags and create class names for tags", function(){
    let source = `[Statement 1]: #tag1
      + [Statement 2]: #tag2 #tag3
        - [Statement 3]: #tag3`;
    let result = app.run(['parse-input','build-model'], {input:source});
    expect(result.tagsDictionary).to.exist;
    expect(Object.keys(result.tagsDictionary).length).to.be.equal(3);
    expect(result.tagsDictionary["tag1"].cssClass).to.be.equal("tag-tag1 tag0");
    expect(result.tagsDictionary["tag1"].index).to.be.equal(0);
    expect(result.tagsDictionary["tag2"].cssClass).to.be.equal("tag-tag2 tag1");
    expect(result.tagsDictionary["tag2"].index).to.be.equal(1);
    expect(result.tagsDictionary["tag3"].cssClass).to.be.equal("tag-tag3 tag2");
    expect(result.tagsDictionary["tag3"].index).to.be.equal(2);
    expect(result.statements["Statement 1"].sortedTags).to.exist;
    expect(result.statements["Statement 1"].sortedTags.length).to.equal(1);
    expect(result.statements["Statement 2"].sortedTags.length).to.equal(2);
  });
});
