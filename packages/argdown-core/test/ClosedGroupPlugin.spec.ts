import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  MapPlugin,
  IGroupMapNode,
  StatementSelectionMode,
  DataPlugin,
  PreselectionPlugin,
  ArgumentSelectionPlugin,
  StatementSelectionPlugin,
  RegroupPlugin,
  GroupPlugin,
  ClosedGroupPlugin
} from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const dataPlugin = new DataPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
app.addPlugin(new RegroupPlugin(), "build-model");

const preselectionPlugin = new PreselectionPlugin();
app.addPlugin(preselectionPlugin, "build-map");
const statementSelectionPlugin = new StatementSelectionPlugin({
  statementSelectionMode: StatementSelectionMode.ALL
});
app.addPlugin(statementSelectionPlugin, "build-map");
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
app.addPlugin(argumentSelectionPlugin, "build-map");
const mapPlugin = new MapPlugin();
app.addPlugin(mapPlugin, "build-map");
const groupPlugin = new GroupPlugin();
app.addPlugin(groupPlugin, "build-map");
app.addPlugin(new ClosedGroupPlugin(), "transform-closed-groups");

describe("ClosedGroupPlugin", function() {
  it("can transform closed groups", function() {
    let source = `
# Section 1 {isClosed: true}
  
    [A]: text
        + <B>: text
  
# Section 2 {isGroup: false}
  
    <B>
        - <C>: text

    [A]
        + <D>: text

    [E]: text
        - <B>
  
  `;
    let result = app.run({
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups"
      ],
      input: source
    });
    expect(result.map!.nodes.length).to.equal(4);
    expect(result.map!.nodes[0].title).to.equal("Section 1");
    expect((<IGroupMapNode>result.map!.nodes[0]).children!.length).to.equal(0);
    expect(result.map!.nodes[1].title).to.equal("E");
    expect(result.map!.nodes[2].title).to.equal("C");
    expect(result.map!.nodes[3].title).to.equal("D");
    expect(result.map!.edges.length).to.equal(3);
    expect(result.map!.edges[0].to).to.equal(result.map!.nodes[0]);
    expect(result.map!.edges[1].to).to.equal(result.map!.nodes[0]);
    expect(result.map!.edges[2].from).to.equal(result.map!.nodes[0]);
  });
  it("can transform closed groups defined in regroup config option", function() {
    let source = `
===
group:
    regroup: [
        {
            title: "Section 1",
            statements: ["A"],
            arguments: ["B"],
            isClosed: true
        }
    ]
===
  
    [A]: text
        + <B>: text
  
    <B>
        - <C>: text

    [A]
        + <D>: text

    [E]: text
        - <B>
  
  `;
    let result = app.run({
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups"
      ],
      input: source
    });
    expect(result.map!.nodes.length).to.equal(4);
    expect(result.map!.nodes[0].title).to.equal("Section 1");
    expect((<IGroupMapNode>result.map!.nodes[0]).children!.length).to.equal(0);
    expect(result.map!.nodes[1].title).to.equal("E");
    expect(result.map!.nodes[2].title).to.equal("C");
    expect(result.map!.nodes[3].title).to.equal("D");
    expect(result.map!.edges.length).to.equal(3);
    expect(result.map!.edges[0].to).to.equal(result.map!.nodes[0]);
    expect(result.map!.edges[1].to).to.equal(result.map!.nodes[0]);
    expect(result.map!.edges[2].from).to.equal(result.map!.nodes[0]);
  });
});
