'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();
var parserPlugin = new _index.ParserPlugin();
app.addPlugin(parserPlugin, 'parse-input');
var modelPlugin = new _index.ModelPlugin();
var tagPlugin = new _index.TagPlugin();
app.addPlugin(modelPlugin, 'build-model');
app.addPlugin(tagPlugin, 'build-model');

describe("TagPlugin", function () {
  it("can sort tags and create class names for tags", function () {
    var source = '[Statement 1]: #tag1\n      + [Statement 2]: #tag2 #tag3\n        - [Statement 3]: #tag3';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.tagsDictionary).to.exist;
    (0, _chai.expect)(Object.keys(result.tagsDictionary).length).to.be.equal(3);
    (0, _chai.expect)(result.tagsDictionary["tag1"].cssClass).to.be.equal("tag-tag1 tag0");
    (0, _chai.expect)(result.tagsDictionary["tag1"].index).to.be.equal(0);
    (0, _chai.expect)(result.tagsDictionary["tag2"].cssClass).to.be.equal("tag-tag2 tag1");
    (0, _chai.expect)(result.tagsDictionary["tag2"].index).to.be.equal(1);
    (0, _chai.expect)(result.tagsDictionary["tag3"].cssClass).to.be.equal("tag-tag3 tag2");
    (0, _chai.expect)(result.tagsDictionary["tag3"].index).to.be.equal(2);
    (0, _chai.expect)(result.statements["Statement 1"].sortedTags).to.exist;
    (0, _chai.expect)(result.statements["Statement 1"].sortedTags.length).to.equal(1);
    (0, _chai.expect)(result.statements["Statement 2"].sortedTags.length).to.equal(2);
  });
});
//# sourceMappingURL=tags-configuration.spec.js.map