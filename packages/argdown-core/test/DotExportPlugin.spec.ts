import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  MapPlugin,
  DataPlugin,
  DotExportPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  GroupPlugin
} from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
app.addPlugin(new DataPlugin(), "build-model");
const modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin, "build-model");
const preselectionPlugin = new PreselectionPlugin();
app.addPlugin(preselectionPlugin, "create-map");
const statementSelectionPlugin = new StatementSelectionPlugin();
app.addPlugin(statementSelectionPlugin, "create-map");
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
app.addPlugin(argumentSelectionPlugin, "create-map");
const mapPlugin = new MapPlugin();
app.addPlugin(mapPlugin, "create-map");
const groupPlugin = new GroupPlugin();
app.addPlugin(groupPlugin, "create-map");
const dotExport = new DotExportPlugin();
app.addPlugin(dotExport, "export-dot");

describe("DotExport", function() {
  it("sanity test", function() {
    let source = `
    # Section 1
    
    <Argument with a very very long title 1>
      + [Statement with a very very long title 1]: Hello World!
          +<Argument 2>: Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
            -[Äüö'quotes']: Some text
                -<A very convincing argument>:Too complicated to explain
                  +>[And yet another statement]: Some more text
                    +<Another Argument>: Some more text
    
    ## Section 2
    
    <Argument with a very very long title 1>: text
      - [And yet another statement]
      
    ### Section 3
    
    [And yet another statement]
      + <Argument>
        - text
    `;

    let result = app.run({
      process: ["parse-input", "build-model", "create-map", "export-dot"],
      input: source,
      logLevel: "error"
    });
    //console.log(result.dot);
    expect(result.dot).to.exist;
  });
  it("can create samerank sections", function() {
    let source = `===
    dot:
      sameRank:
        - {statements:[s1, s2], arguments: [a1, a2]}
    ===

      [s1]: test
       - [s2]: test
        + <a1>
        + <a2>
        + <a3> {rank: r2}
        + <a4> {rank: r2}
       + [s3]: test {rank: r2}
       + [s4]: test {rank: r2}

    `;

    let result = app.run({
      process: ["parse-input", "build-model", "create-map", "export-dot"],
      input: source,
      logLevel: "debug"
    });
    console.log(result.dot);
    const rankSections = `{ rank = same;
n4;
n5;
n0;
n1;
};
{ rank = same;
n6;
n7;
n2;
n3;
};`;
    expect(result.dot!.includes(rankSections)).to.be.true;
  });
});
