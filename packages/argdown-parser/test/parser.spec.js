//import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import argdownParser from '../src/index.js';


describe("Parser", function() {
  it("can parse", function(){
    let source = fs.readFileSync("./test/parser.argdown", 'utf8');
    const result = argdownParser.parse(source);
    expect(result.lexErrors).to.be.empty;
    expect(result.parseErrors).to.be.empty;
  });
});
