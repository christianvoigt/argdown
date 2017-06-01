'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();
var preprocessor = new _index.ArgdownPreprocessor();
var tagConfiguration = new _index.TagConfiguration();
app.addPlugin(preprocessor, 'preprocessor');
app.addPlugin(tagConfiguration, 'preprocessor');

describe("TagConfiguration", function () {
  it("can sort tags and create class names for tags", function () {
    var source = '[Statement 1]: #tag1\n      + [Statement 2]: #tag2 #tag3\n        - [Statement 3]: #tag3';
    app.parse(source);
    var result = app.run(['preprocessor']);
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