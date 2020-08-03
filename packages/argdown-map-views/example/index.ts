import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  DataPlugin,
  MapPlugin,
  GroupPlugin,
  ColorPlugin,
  DotExportPlugin
} from "@argdown/core";
import { VizJsMap, DagreMap } from "../src/index";
import "babel-polyfill";

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
app.addPlugin(new ColorPlugin(), "colorize");
const dotExport = new DotExportPlugin();
app.addPlugin(dotExport, "export-dot");
const exportDot = [
  "parse-input",
  "build-model",
  "create-map",
  "colorize",
  "export-dot"
];
const exportMap = ["parse-input", "build-model", "create-map", "colorize"];

const createDagreMap = (container: HTMLElement) => {
  container.innerHTML = "";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("style", "width: 100%; height: 100%;");
  container.appendChild(svg);
  const dagreMap = new DagreMap(svg);
  const response = app.run({
    input: `
      # G1
      
      <a1>
          - <a2>
      `,
    process: exportMap
  });
  dagreMap.render({ settings: {}, map: response.map! });
};
const createVizJsMap = (container: HTMLElement) => {
  container.innerHTML = "";
  const vizJsMap = new VizJsMap(container, null, {
    workerURL: "http://localhost:1234/render.browser.js"
  });
  const response = app.run({
    input: `
  # G1
  
  <a1>
      - <a2>
  `,
    process: exportDot
  });
  vizJsMap.render({ dot: response.dot! });
};
window.onload = function() {
  const menu = document.createElement("div");
  menu.innerHTML = `<button id="dagre-button">Dagre</button><button id="viz-js-button" >Viz.js</button>`;
  const container = document.createElement("div");
  container.setAttribute(
    "style",
    "position:fixed; top: 80px; left: 0px; right: 0px; bottom: 0px;"
  );
  document.body.appendChild(menu);
  const dagreButton = document.getElementById("dagre-button");
  dagreButton!.addEventListener("click", () => createDagreMap(container));
  const vizJsButton = document.getElementById("viz-js-button");
  vizJsButton!.addEventListener("click", () => createVizJsMap(container));
  document.body.appendChild(container);
};
