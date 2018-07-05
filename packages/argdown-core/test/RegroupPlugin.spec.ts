import { expect } from "chai";
import { ArgdownApplication, ParserPlugin, ModelPlugin, DataPlugin, RegroupPlugin } from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const dataPlugin = new DataPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
const regroupPlugin = new RegroupPlugin();
app.addPlugin(regroupPlugin, "build-model");

describe("GroupPlugin", function() {
  it("can regroup sections", function() {
    let source = `
    ===
    group:
        regroup:  [{
                title: "New group 1",
                statements: ["q"],
                tags: ["tag-1", "tag-2"],
                children: [{
                    title: "New group 2",
                    arguments: ["a", "c"]
                },
                {
                    title: "New group 3",
                    arguments: ["b", "d"]
                }]
            }]
    ===
    
    # H1
    
    [p]: text
    
    [q]: text
        +> <a>
    
    ## H2 {isGroup: false}
    
    [p]
        - <a>: text
        - <b>: text
    
    ## H3 {isGroup: true}
    
    [p]
        + <c>: text
        + <d>: text
    `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.sections!.length).to.equal(1);
    expect(result.sections![0].title).to.equal("New group 1");
    expect(result.sections![0].tags![0]).to.equal("tag-1");
    expect(result.sections![0].tags![1]).to.equal("tag-2");
    expect(result.sections![0].children.length).to.equal(2);
    expect(result.sections![0].children[0].title).to.equal("New group 2");
    expect(result.sections![0].children[1].title).to.equal("New group 3");

    expect(result.statements!["p"].section).to.be.null;
    expect(result.statements!["q"].section).to.equal(result.sections![0]);
    expect(result.arguments!["a"].section).to.equal(result.sections![0].children[0]);
    expect(result.arguments!["b"].section).to.equal(result.sections![0].children[1]);
    expect(result.arguments!["c"].section).to.equal(result.sections![0].children[0]);
    expect(result.arguments!["d"].section).to.equal(result.sections![0].children[1]);
  });
});
