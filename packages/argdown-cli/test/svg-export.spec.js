import { expect } from "chai";
import { ArgdownApplication, ParserPlugin, ModelPlugin } from "argdown-parser";
import { MapMaker, DotExport } from "argdown-map-maker";
import { DotToSvgExportPlugin } from "../src/index.js";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin, "build-model");
const mapMaker = new MapMaker();
const dotExport = new DotExport();
const svgExport = new DotToSvgExportPlugin();
app.addPlugin(mapMaker, "export");
app.addPlugin(dotExport, "export");
app.addPlugin(svgExport, "export");

describe("Svg export", function() {
    this.timeout(20000);
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

        let response = app.run({ process: ["parse-input", "build-model", "export"], input: source });
        expect(response.svg).to.exist;
    });
});
