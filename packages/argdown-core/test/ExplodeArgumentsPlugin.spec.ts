import { expect } from "chai";
import {it} from "mocha";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  ExplodeArgumentsPlugin,
  IArgdownRequest,
  DataPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  MapPlugin
} from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const modelPlugin = new ModelPlugin();
const explodePlugin = new ExplodeArgumentsPlugin();
app.addPlugin(parserPlugin, "parse-input");
app.addPlugin(new DataPlugin(), "build-model");
app.addPlugin(modelPlugin, "build-model");
app.addPlugin(explodePlugin, "build-model");

const preselectionPlugin = new PreselectionPlugin();
app.addPlugin(preselectionPlugin, "build-map");
const statementSelectionPlugin = new StatementSelectionPlugin();
app.addPlugin(statementSelectionPlugin, "build-map");
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
app.addPlugin(argumentSelectionPlugin, "build-map");
const mapPlugin = new MapPlugin();
app.addPlugin(mapPlugin, "build-map");


describe("ExplodeArguments", function() {
  it("can explode an argument into its inferential steps", function() {
    const input = `
<a1>

(1) s1
(2) s2
----
(3) s3
(4) s4    
----
(5) s5
    +> [s1]

<a1>
    + <a2>
    - <a3>
    -> <a4>
`;
    let request:IArgdownRequest = {
      process: ["parse-input", "build-model"],
      input,
      model: {
          explodeArguments: true
      }
    };
    let result = app.run(request);
    // console.log(result.html);
    expect(result.arguments).to.exist;
    expect(Object.keys(result.arguments!).length).to.equal(5);
    console.log(JSON.stringify(Object.keys(result.arguments!)));
    expect(result.arguments!["a1 - 1"]).to.exist;
    expect(result.arguments!["a1 - 2"]).to.exist;
    const step1 = result.arguments!["a1 - 1"];
    expect(step1.pcs.length).to.equal(3);
    const step2 = result.arguments!["a1 - 2"];
    expect(step2.pcs.length).to.equal(3);
    expect(result.relations!.length).to.equal(4);
  });
  it("can explode an argument into its inferential steps based on 'uses' lists", function() {
    const input = `
<a1>

(1) s1
(2) s2
----
(3) s3
(4) s4    
(5) s5    
-- 
{uses: [3, 4]} 
--
(6) s6
(7) s7    
----
(8) s8 {uses: [1, 3, 6, 7]}
`;
    let request:IArgdownRequest = {
      process: ["parse-input", "build-model"],
      input,
      model: {
          explodeArguments: true
      }
    };
    let result = app.run(request);
    // console.log(result.html);
    expect(result.arguments).to.exist;
    expect(Object.keys(result.arguments!).length).to.equal(3);
    console.log(JSON.stringify(Object.keys(result.arguments!)));
    expect(result.arguments!["a1 - 1"]).to.exist;
    expect(result.arguments!["a1 - 2"]).to.exist;
    expect(result.arguments!["a1 - 3"]).to.exist;
    const step1 = result.arguments!["a1 - 1"];
    expect(step1.pcs.length).to.equal(3);
    const step2 = result.arguments!["a1 - 2"];
    //console.log(JSON.stringify((result.arguments!["a1 - 2"]!.pcs[3] as IConclusion).inference!.data!));
    expect(step2.pcs.length).to.equal(3);
    const step3 = result.arguments!["a1 - 3"];
    expect(step3.pcs.length).to.equal(5);
  });
  it("can explode an argument into its inferential steps and add support relations between argument nodes", function() {
    const input = `
<a1>

(1) s1
(2) s2
----
(3) s3
(4) s4    
(5) s5    
----
(6) s6
`;
    let request:IArgdownRequest = {
      process: ["parse-input", "build-model", "build-map"],
      input,
      model: {
          explodeArguments: true
      }
    };
    let result = app.run(request);
    console.log(result.map!.nodes.map(n=>n.title).join(", "));
    expect(result.map).to.exist;
    expect(result.map!.nodes!.length).to.equal(2);
    expect(result.map!.edges!.length).to.equal(1);
  });
});
