import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  MapPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  GroupPlugin,
  ColorPlugin
} from "../src/index";
import { GraphMLExportPlugin } from "../src/plugins/GraphMLExportPlugin";

const app = new ArgdownApplication();
app.addPlugin(new ParserPlugin(), "parse-input");
app.addPlugin(new ModelPlugin(), "build-model");
app.addPlugin(new PreselectionPlugin(), "create-map");
app.addPlugin(new StatementSelectionPlugin(), "create-map");
app.addPlugin(new ArgumentSelectionPlugin(), "create-map");
app.addPlugin(new MapPlugin(), "create-map");
app.addPlugin(new GroupPlugin(), "create-map");
app.addPlugin(new ColorPlugin(), "add-colors");
app.addPlugin(new GraphMLExportPlugin(), "export-graphml");

describe("GraphMLExport", function() {
  it("sanity test", function() {
    let source = `
    # Section 1
    
    <Argument with a very very long title 1>
      + [Statement with a very very long title 1]: Hello World!
          +<Argument 2>: Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
            -[Äüö'quotes']: Some text
                -<A very convincing argument>:Too complicated to explain
                  +>[And yet another statement]
                    +<Another Argument>: Some more text
    
    ## Section 2
    
    <Argument with a very very long title 1>: text
      - [And yet another statement]: Text
      
    ### Section 3
    
    [And yet another statement]: Text
      + <Argument>: Text
        - text
    `;

    let result = app.run({
      process: [
        "parse-input",
        "build-model",
        "create-map",
        "add-colors",
        "export-graphml"
      ],
      input: source,
      logLevel: "error"
    });
    //console.log(result.graphml);
    expect(result.graphml).to.exist;
  });
});
