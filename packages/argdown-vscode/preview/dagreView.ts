import { onceDocumentLoaded } from "./events";
import { createPosterForVsCode } from "./messaging";
import { IPreviewSettings, getSettings } from "./settings";
import throttle = require("lodash.throttle");
import { initMenu } from "./menu";
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";
import { getSvgForExport, getPngAsString } from "./export";
import { openScaleDialog } from "./scaleDialog";
import { convertCoordsL2L } from "./utils";
import {
  ArgdownTypes,
  IMapNode,
  isGroupMapNode,
  IArgdownResponse,
  ITagData
} from "@argdown/core";
declare function require(path: string): string;
const dagreCss = require("!raw-loader!./dagre.css");

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();
vscode.postMessage({});

const messagePoster = createPosterForVsCode(vscode);
initMenu(messagePoster);

window.cspAlerter.setPoster(messagePoster);
window.styleLoadingMonitor.setPoster(messagePoster);

interface IDagreViewState {
  scale: number;
  x: number;
  y: number;
  zoom?: d3.ZoomBehavior<SVGSVGElement, null>;
  svg?: d3.Selection<SVGSVGElement, null, HTMLElement, any>;
  svgGraph?: d3.Selection<SVGGraphicsElement, null, HTMLElement, any>;
  graphSize: { width: number; height: number };
  settings: IPreviewSettings;
  dagreCssHtml: string;
  selectedNode?: SVGGraphicsElement;
}

const settings = getSettings();
const state: IDagreViewState = {
  scale: settings.hasOwnProperty("scale") ? settings.scale! : 0.75,
  x: settings.hasOwnProperty("x") ? settings.x! : 0,
  y: settings.hasOwnProperty("y") ? settings.y! : 0,
  graphSize: { width: 0, height: 0 },
  settings: settings,
  dagreCssHtml: '<style type="text/css">' + dagreCss + "</style>"
};
const getSvgEl = () => {
  return <SVGSVGElement>(<any>document.getElementById("dagre-svg")!);
};
const deselectSelectedNode = () => {
  if (state.selectedNode) {
    state.selectedNode.classList.remove("selected");
  }
};
const selectNode = (id: string): void => {
  deselectSelectedNode();
  state.selectedNode = d3.select<SVGGraphicsElement, null>(`#${id}`).node()!;
  if (state.selectedNode) {
    state.selectedNode.classList.add("selected");
    let positionInfo = state.svg!.node()!.getBoundingClientRect();
    const point = convertCoordsL2L(
      state.svg!.node()!,
      state.selectedNode!,
      state.svgGraph!.node()!
    );
    let x = -point.x * state.scale + positionInfo.width / 2;
    let y = -point.y * state.scale + positionInfo.height / 2;

    setZoom(x, y, state.scale, settings.transitionDuration, state);
  }
};

const showAllAndCenterMap = (state: IDagreViewState) => {
  if (!state.svg) {
    return;
  }
  let positionInfo = state.svg.node()!.getBoundingClientRect();
  const xScale = positionInfo.width / state.graphSize.width;
  const yScale = positionInfo.height / state.graphSize.height;
  const scale = Math.min(xScale, yScale);
  const x = (positionInfo.width - state.graphSize.width * scale) / 2;
  const y = (positionInfo.height - state.graphSize.height * scale) / 2;
  setZoom(x, y, scale, 0, state);
};
const setZoom = (
  x: number,
  y: number,
  scale: number,
  duration: number,
  state: IDagreViewState
) => {
  if (!state.svg || !state.zoom) {
    return;
  }
  state.svg
    .transition()
    .duration(duration)
    .call(
      state.zoom.transform,
      // eslint-disable-next-line
      d3.zoomIdentity.translate(x, y).scale(scale)
    );
};

const sendDidChangeZoom = throttle((state: IDagreViewState) => {
  messagePoster.postMessage("didChangeZoom", {
    scale: state.scale,
    x: state.x,
    y: state.y
  });
}, 50);

const addNode = (
  node: IMapNode,
  g: dagreD3.graphlib.Graph,
  tagsDictionary:
    | {
        [tagName: string]: ITagData;
      }
    | undefined,
  currentGroup: any = null
) => {
  const nodeProperties: dagreD3.Label = {
    labelType: "html",
    class: node.type + "",
    id: node.id,
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    label: "",
    clusterLabelPos: "center"
  };
  nodeProperties.label = '<div class="node-label">';
  if (node.labelTitle) {
    nodeProperties.label += "<h3>" + node.labelTitle + "</h3>";
  }
  // eslint-disable-next-line
  if (
    node.labelText &&
    (node.type === ArgdownTypes.STATEMENT_MAP_NODE ||
      node.type === ArgdownTypes.ARGUMENT_MAP_NODE)
  ) {
    nodeProperties.label += "<p>" + node.labelText + "</p>";
  }
  if (node.tags && tagsDictionary) {
    for (let tag of node.tags) {
      nodeProperties.class += " ";
      // eslint-disable-next-line
      nodeProperties.class += tagsDictionary[tag].cssClass;
    }
  }
  nodeProperties.label += "</div>";

  if (isGroupMapNode(node)) {
    nodeProperties.clusterLabelPos = "top";
    nodeProperties.class += " level-" + node.level;
  }
  g.setNode(node.id, nodeProperties);
  if (currentGroup) {
    g.setParent(node.id, currentGroup.id);
  }
  if (isGroupMapNode(node)) {
    for (let child of node.children!) {
      addNode(child, g, tagsDictionary, node);
    }
  }
};

const generateSvg = (
  argdownData: IArgdownResponse,
  state: IDagreViewState,
  isUpdate: boolean = false
): void => {
  const map = argdownData.map!;
  const tagsDictionary = argdownData.tagsDictionary;
  // Create the input graph
  const g: dagreD3.graphlib.Graph = new dagreD3.graphlib.Graph({
    compound: true
  })
    .setGraph({
      rankdir: settings.dagre.rankDir,
      ranksep: settings.dagre.rankSep,
      nodesep: settings.dagre.nodeSep,
      marginx: 20,
      marginy: 20
    })
    .setDefaultEdgeLabel(function() {
      return {};
    });

  for (let node of map.nodes) {
    addNode(node, g, tagsDictionary);
  }

  for (let edge of map.edges) {
    g.setEdge((<any>edge).from, (<any>edge).to!, { class: edge.relationType });
  }

  const nodes = g.nodes();

  for (let v of nodes) {
    const node = g.node(v);
    // Round the corners of the nodes
    node.rx = node.ry = 5;
  }

  // Create the renderer
  const render = new dagreD3.render(); // eslint-disable-line new-cap

  // const layout = dagreD3.layout().rankSep(50).rankDir('BT')

  // Set up an SVG group so that we can translate the final graph.
  state.svg = d3.select<SVGSVGElement, null>("#dagre-svg");
  state.svg.selectAll("*").remove();

  state.svg.append("g");
  state.svgGraph = state.svg.select<SVGGraphicsElement>("g");
  state.svgGraph.attr("class", "dagre");

  state.zoom = d3.zoom<SVGSVGElement, null>().on("zoom", function() {
    // eslint-disable-next-line
    state.svgGraph!.attr("transform", d3.event.transform);
    state.scale = d3.event.transform.k;
    state.x = d3.event.transform.x;
    state.y = d3.event.transform.y;
    sendDidChangeZoom(state);
  });
  state.svg.call(state.zoom).on("dblclick.zoom", null);

  // Run the renderer. This is what draws the final graph.
  render(state.svgGraph as any, g);
  state.graphSize.width = g.graph().width;
  state.graphSize.height = g.graph().height;

  if (!isUpdate && !settings.didInitiate) {
    showAllAndCenterMap(state);
  } else {
    setZoom(state.x, state.y, state.scale, 0, state);
  }
  state.svgGraph.attr("height", state.graphSize.width * state.scale + 40);
};
onceDocumentLoaded(() => {
  const argdownDataEl = document.getElementById("argdown-json-data");
  if (!argdownDataEl) {
    return;
  }
  const argdownData = JSON.parse(argdownDataEl.dataset.argdown!);
  generateSvg(argdownData, state);
});

window.addEventListener(
  "message",
  event => {
    if (event.data.source !== state.settings.source) {
      return;
    }

    switch (event.data.type) {
      case "didChangeTextDocument":
        const argdownData = JSON.parse(event.data.json);
        generateSvg(argdownData, state, true);
        break;
      case "didSelectMapNode":
        if (settings.syncPreviewSelectionWithEditor) {
          const id = event.data.id;
          console.log("didSelectMapNode " + id);
          selectNode(id);
        }
        break;
    }
  },
  false
);

document.addEventListener("dblclick", event => {
  if (!state.settings.doubleClickToSwitchToEditor) {
    return;
  }

  // Ignore clicks on links
  for (
    let node = event.target as HTMLElement;
    node;
    node = node.parentNode as HTMLElement
  ) {
    if (node.tagName && node.tagName === "g" && node.classList) {
      if (node.classList.contains("node")) {
        const id = node.id;
        selectNode(id);
        messagePoster.postMessage("didSelectMapNode", { id });
      } else if (node.classList.contains("cluster")) {
        const heading = d3
          .select(node)
          .select<HTMLHeadingElement>("h3")
          .node()!.textContent;
        messagePoster.postMessage("didSelectCluster", { heading });
      }
    } else if (node.tagName === "A") {
      return;
    }
  }
});

document.addEventListener(
  "click",
  event => {
    if (!event) {
      return;
    }

    let node: any = event.target;
    while (node) {
      if (node.tagName && node.tagName === "A" && node.href) {
        if (node.dataset.command) {
          const command = node.dataset.command;
          if (command === "argdown.exportContentToDagreSvg") {
            var svgString = getSvgForExport(getSvgEl(), state.dagreCssHtml);
            messagePoster.postCommand(command, [
              state.settings.source,
              svgString
            ]);
          } else if (command === "argdown.exportContentToDagrePng") {
            openScaleDialog(scale => {
              getPngAsString(
                getSvgEl(),
                scale,
                state.dagreCssHtml,
                pngString => {
                  messagePoster.postCommand(command, [
                    state.settings.source,
                    pngString
                  ]);
                }
              );
            });
          } else if (command === "argdown.exportContentToDagrePdf") {
            var svgString = getSvgForExport(getSvgEl(), state.dagreCssHtml);
            messagePoster.postCommand(command, [
              state.settings.source,
              svgString
            ]);
          }
          break;
        }
        if (node.getAttribute("href").startsWith("#")) {
          break;
        }
        if (
          node.href.startsWith("file://") ||
          node.href.startsWith("vscode-resource:")
        ) {
          const [path, fragment] = node.href
            .replace(/^(file:\/\/|vscode-resource:)/i, "")
            .split("#");
          messagePoster.postCommand("_markdown.openDocumentLink", [
            { path, fragment }
          ]);
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        break;
      } else if (node.tagName && node.tagName.toLowerCase() === "svg") {
        deselectSelectedNode();
        break;
      }
      node = node.parentNode;
    }
  },
  true
);
