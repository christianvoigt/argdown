import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  DataPlugin,
  ColorPlugin,
  MapPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  PreselectionPlugin,
  IGroupMapNode,
  GroupPlugin,
  ArgdownTypes
} from "../src/index";
import { colorSchemes } from "../src/plugins/colorSchemes";

let app = new ArgdownApplication();
let parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
const dataPlugin = new DataPlugin();
let modelPlugin = new ModelPlugin();
let colorPlugin = new ColorPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
app.addPlugin(new PreselectionPlugin(), "build-map");
app.addPlugin(new StatementSelectionPlugin(), "build-map");
app.addPlugin(new ArgumentSelectionPlugin(), "build-map");
app.addPlugin(new MapPlugin(), "build-map");
app.addPlugin(new GroupPlugin(), "build-map");
app.addPlugin(colorPlugin, "add-color");

describe("ColorPlugin", function() {
  it("can load a preset color scheme", function() {
    let source = `
    ===
    color:
      colorScheme: iwanthue-red-roses
    ===
    [Statement 1]: #tag1
      + [Statement 2]: #tag2 #tag3
        - [Statement 3]: #tag3
        
    [Statement 4]: untagged`;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.statements!["Statement 1"].color).to.equal(
      colorSchemes["iwanthue-red-roses"][1]
    );
    expect(response.statements!["Statement 2"].color).to.equal(
      colorSchemes["iwanthue-red-roses"][2]
    );
    expect(response.statements!["Statement 3"].color).to.equal(
      colorSchemes["iwanthue-red-roses"][3]
    );
    expect(response.statements!["Statement 4"].color).to.equal(
      colorSchemes["iwanthue-red-roses"][0]
    );
  });
  it("can use a custom color scheme", function() {
    let source = `
    ===
    color:
        colorScheme:
            - "#ff4f98"
            - "#ff4f98"
            - "#51ffae"
            - "#f3d942"
    selection:
        excludeDisconnected: false
    ===
    
    <a> #tag-1
    
    <b>: #tag-2 #tag-1
    
    [c] #tag-3
    
    <b>: #tag-3
    `;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.arguments!["a"].color).to.equal("#ff4f98");
    expect(response.arguments!["b"].color).to.equal("#51ffae");
    expect(response.statements!["c"].color).to.equal("#f3d942");
  });
  it("can apply colors from tagColor setting", function() {
    let source = `
    ===
    color:
        colorScheme: colorbrewer-set3
        tagColors:
            tag-1: "#169b89"
            tag-2: 7
            tag-3: 2
    selection:
        excludeDisconnected: false
    ===
    
    <a> #tag-1
    
    <b>: #tag-2 #tag-1
    
    [c] #tag-3
    
    <b>: #tag-3`;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.arguments!["a"].color).to.equal("#169b89");
    expect(response.arguments!["b"].color).to.equal(
      colorSchemes["colorbrewer-set3"][7]
    );
    expect(response.statements!["c"].color).to.equal(
      colorSchemes["colorbrewer-set3"][2]
    );
  });
  it("can apply colors based on tag priority", function() {
    let source = `
    ===
color:
    colorScheme: colorbrewer-set3
    tagColors:
        tag-1: {color: "#169b89", priority: 2}
        tag-2: {color: 3, priority: 1}
        tag-3: 2
selection:
    excludeDisconnected: false
===

<a> #tag-1

<b>: #tag-2 #tag-1

[c] #tag-3 #tag-2

<b>: #tag-3`;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.arguments!["a"].color).to.equal("#169b89");
    expect(response.arguments!["b"].color).to.equal("#169b89");
    expect(response.statements!["c"].color).to.equal(
      colorSchemes["colorbrewer-set3"][3]
    );
  });
  it("can change group color by tag", function() {
    let source = `
    ===
    color:
        colorizeByTag: false,
        colorizeGroupsByTag: true
        tagColors:
            tag-1: "#e6f5c9"
            tag-2: 0
            tag-3: 2
        groupColorScheme:
            - "#fff2ae"
            - "#f4cae4"
            - "#b3e2cd"
    selection:
        excludeDisconnected: false
    group:
        groupDepth: 3
    ===
    
    # H1 #tag-1
    
    <a>: text
    
    ## H2 #tag-2
    
    <b>: text
    
    ### H3 #tag-3
    
    [c]: text`;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.sections![0].color).to.equal("#e6f5c9");
    expect(response.sections![0].children[0].color).to.equal("#fff2ae");
    expect(response.sections![0].children[0].children[0].color).to.equal(
      "#b3e2cd"
    );
  });
  it("can change element color by title", function() {
    let source = `
    ===
    color:
        colorScheme: iwanthue-colorblind-friendly
        statementColors:
            c: 2
        argumentColors:
            a: "#64b964"
            b: 7
        groupColors:
            H1: "#b3e2cd"
            H2: 0
            H3: 1
        groupColorScheme:
            - "#fff2ae"
            - "#f4cae4"
            - "#b3e2cd"
    selection:
        excludeDisconnected: false
    ===
    
    # H1
    
    <a>: #tag-1
    
    ## H2
    
    <b>: #tag-2 #tag-1
    
    ## H3
    
    [c]: #tag-3
    
    <b>: #tag-3
    `;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.sections![0].color).to.equal("#b3e2cd");
    expect(response.sections![0].children[0].color).to.equal("#fff2ae");
    expect(response.sections![0].children[1].color).to.equal("#f4cae4");
    expect(response.arguments!["a"].color).to.equal("#64b964");
    expect(response.arguments!["b"].color).to.equal(
      colorSchemes["iwanthue-colorblind-friendly"][7]
    );
    expect(response.statements!["c"].color).to.equal(
      colorSchemes["iwanthue-colorblind-friendly"][2]
    );
  });
  it("can change element color by data color field", function() {
    let source = `
    ===
    color:
        colorScheme: iwanthue-fluo
        groupColorScheme:
            - "#fff2ae"
            - "#f4cae4"
            - "#b3e2cd"
    selection:
        excludeDisconnected: false
    ===
    
    # H1 {color: 2}
    
    <a>: #tag-1 {color: 6}
    
    ## H2 {color: "#fdcdac"}
    
    <b>: #tag-2 #tag-1 {color: 3}
    
    ## H3
    
    [c]: #tag-3 {color: "#64b964"}
    
    <b>: #tag-3
    `;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.sections![0].color).to.equal("#b3e2cd");
    expect(response.sections![0].children[0].color).to.equal("#fdcdac");
    expect(response.sections![0].children[1].color).to.equal("#f4cae4");
    expect(response.arguments!["a"].color).to.equal(
      colorSchemes["iwanthue-fluo"][6]
    );
    expect(response.arguments!["b"].color).to.equal(
      colorSchemes["iwanthue-fluo"][3]
    );
    expect(response.statements!["c"].color).to.equal("#64b964");
  });
  it("can ignore data color field", function() {
    let source = `
    ===
    color:
        colorScheme: iwanthue-yellow-lime
        groupColorScheme:
            - "#fff2ae"
            - "#f4cae4"
            - "#b3e2cd"
        groupColors:
            H1: 0
            H2: 1
            H3: 2
        ignoreColorData: true
    selection:
        excludeDisconnected: false
    ===
    
    # H1 {color: 2}
    
    <a>: #tag-1 {color: 6}
    
    ## H2 {color: "#fdcdac"}
    
    <b>: #tag-2 #tag-1 {color: 3}
    
    ## H3
    
    [c]: #tag-3 {color: "#64b964"}
    
    <b>: #tag-3
    `;
    const request = {
      process: ["parse-input", "build-model", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.sections![0].color).to.equal("#fff2ae");
    expect(response.sections![0].children[0].color).to.equal("#f4cae4");
    expect(response.sections![0].children[1].color).to.equal("#b3e2cd");
    expect(response.arguments!["a"].color).to.equal(
      colorSchemes["iwanthue-yellow-lime"][1]
    );
    expect(response.arguments!["b"].color).to.equal(
      colorSchemes["iwanthue-yellow-lime"][2]
    );
    expect(response.statements!["c"].color).to.equal(
      colorSchemes["iwanthue-yellow-lime"][3]
    );
  });
  it("can colorize map", function() {
    let input = `    
===
color:
    relationColors:
        support: "#100000"
        attack: "#200000"
        entails: "#300000"
        contrary: "#400000"
        contradictory: "#500000"
        undercut: "#600000"
===

# g1 {color: "#000001"}

<a1>: asdad {color: "#000002"}
    - <a2>: adasd {color: "#000003"}

## g2 {color: "#000004"}

<a2>
    + [s1]: asdds {color: "#000005"}
    <_ [s2]: asdd {color: "#000006"}

    `;
    const request = {
      process: ["parse-input", "build-model", "build-map", "add-color"],
      input,
      logLevel: "verbose"
    };
    const response = app.run(request);
    //console.log(toJSON(response.map!.nodes));
    expect(response.map!.nodes![0].color).to.equal("#000001");
    expect(response.arguments!["a1"].color).to.equal("#000002");
    expect(
      (<IGroupMapNode>response.map!.nodes![0]).children![0].color
    ).to.equal("#000002");
    expect(
      (<IGroupMapNode>response.map!.nodes![0]).children![1].color
    ).to.equal("#000003");
    expect(
      (<IGroupMapNode>response.map!.nodes![0]).children![2].color
    ).to.equal("#000004");
    expect(
      (<IGroupMapNode>(<IGroupMapNode>response.map!.nodes![0]).children![2])
        .children![0].color
    ).to.equal("#000005");
    expect(
      (<IGroupMapNode>(<IGroupMapNode>response.map!.nodes![0]).children![2])
        .children![1].color
    ).to.equal("#000006");
    expect(response.map!.edges![0].color).to.equal("#200000");
    expect(response.map!.edges![1].color).to.equal("#100000");
    expect(response.map!.edges![2].color).to.equal("#600000");
  });
  it("can use a custom color scheme for groups", function() {
    let source = `
    ===
    color:
        colorScheme: colorbrewer-set2
        groupColorScheme:
            - "#fff2ae"
            - "#f4cae4"
            - "#b3e2cd"
    selection:
        excludeDisconnected: false
    group:
        groupDepth: 3
    ===
    
    # H1
    
    <a>: #tag-1
    
    ## H2
    
    <b>: #tag-2 #tag-1
    
    ### H3
    
    [c]: #tag-3
    
    <b>: #tag-3
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map", "add-color"],
      input: source
    };
    const response = app.run(request);
    expect(response.map!.nodes![0].color).to.equal("#fff2ae");
    const group2 = <IGroupMapNode>(
      (<IGroupMapNode>response.map!.nodes![0]).children![1]
    );
    expect(group2.type).to.equal(ArgdownTypes.GROUP_MAP_NODE);
    expect(group2.color).to.equal("#f4cae4");
    const group3 = <IGroupMapNode>group2.children![1];
    expect(group3.type).to.equal(ArgdownTypes.GROUP_MAP_NODE);
    expect(group3.color).to.equal("#b3e2cd");
  });
});
