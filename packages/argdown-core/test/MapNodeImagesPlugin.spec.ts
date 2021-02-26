import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  MapPlugin,
  StatementSelectionMode,
  IArgdownRequest,
  DataPlugin,
  PreselectionPlugin,
  ArgumentSelectionPlugin,
  StatementSelectionPlugin,
  MapNodeImagesPlugin
} from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const dataPlugin = new DataPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
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
app.addPlugin(new MapNodeImagesPlugin(), "add-images");

describe("MapNodeImagesPlugin", function() {
  it("can add images to nodes from metadata", function() {
    let source = `
    ===
    images:
        files: 
            short-id: {path: "test3.jpg"}
    ===

    <Argument 1> {images: ["test1.png"]}
      + [Statement 1]: Hello World! {images: ["test2.svg", "short-id"]}
    `;
    const request:IArgdownRequest = {
      process: ["parse-input", "build-model", "build-map", "add-images"],
      input: source
    };
    let result = app.run(request);

    expect(result.map!.nodes!.length).to.equal(2);
    expect(result.map!.nodes[0]!.images![0]).to.equal("test2.svg");
    expect(result.map!.nodes[0]!.images![1]).to.equal("short-id");
    expect(result.map!.nodes[1]!.images![0]).to.equal("test1.png");
    expect(request.images!.files).to.exist;
    expect(request.images!.files!["test1.png"]).to.exist;
    expect(request.images!.files!["test2.svg"]).to.exist;
    expect(request.images!.files!["short-id"]).to.exist;
    expect(request.images!.files!["test3.jpg"]).to.not.exist;
    expect(request.images!.files!["test1.png"].path).to.equal("test1.png");
    expect(request.images!.files!["test2.svg"].path).to.equal("test2.svg");
    expect(request.images!.files!["short-id"].path).to.equal("test3.jpg");
  });
  it("can add images to nodes from tags", function() {
    let source = `
    ===
    images:
        files:
            tag1: {path: "test1.png"}
            tag2: {path: "test2.svg"}
            tag3: {path: "test3.jpg"}
    ===

    <Argument 1> #tag1
      + [Statement 1]: Hello World! #tag2 #tag3
    `;
    const request:IArgdownRequest = {
      process: ["parse-input", "build-model", "build-map", "add-images"],
      input: source
    };
    let result = app.run(request);

    expect(result.map!.nodes!.length).to.equal(2);
    expect(result.map!.nodes[0]!.images![0]).to.equal("tag2");
    expect(result.map!.nodes[0]!.images![1]).to.equal("tag3");
    expect(result.map!.nodes[1]!.images![0]).to.equal("tag1");
    expect(request.images!.files).to.exist;
  });
});
