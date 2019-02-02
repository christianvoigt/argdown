import * as d3 from "d3";
import { onceDocumentLoaded } from "./events";
import { createPosterForVsCode } from "./messaging";
import { getSettings, IPreviewSettings } from "./settings";
import throttle = require("lodash.throttle");
import { initMenu } from "./menu";
import { getPngAsString } from "./export";
import { openScaleDialog } from "./scaleDialog";
import { convertCoordsL2L } from "./utils";

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();
vscode.postMessage({});

const messagePoster = createPosterForVsCode(vscode);
initMenu(messagePoster);

window.cspAlerter.setPoster(messagePoster);
window.styleLoadingMonitor.setPoster(messagePoster);

const settings = getSettings();
interface IVizjsViewState {
  settings: IPreviewSettings;
  scale: number;
  x: number;
  y: number;
  svg?: d3.Selection<SVGSVGElement, null, HTMLElement, any>;
  svgGraph?: d3.Selection<SVGGraphicsElement, null, HTMLElement, any>;
  selectedNode?: SVGGraphicsElement;
  selectedNodeStrokeWidth?: string;
  selectedNodeStroke?: string;
  zoom?: d3.ZoomBehavior<SVGSVGElement, null>;
  graphSize: {
    width: number;
    height: number;
  };
}
const state: IVizjsViewState = {
  settings: settings,
  scale: settings.hasOwnProperty("scale") ? settings.scale! : 0.75,
  x: settings.hasOwnProperty("x") ? settings.x! : 0,
  y: settings.hasOwnProperty("y") ? settings.y! : 0,
  graphSize: {
    width: 0,
    height: 0
  }
};

const sendDidChangeZoom = throttle((state: IVizjsViewState) => {
  messagePoster.postMessage("didChangeZoom", {
    scale: state.scale,
    x: state.x,
    y: state.y
  });
}, 50);

const loadSvg = (
  vizjsSvg: string = "",
  state: IVizjsViewState,
  isUpdate: boolean = false
) => {
  const svgContainer = d3.select<HTMLElement, null>("#svg-container")!;
  if (vizjsSvg) {
    svgContainer.select("*").remove();
    svgContainer.html(vizjsSvg);
  }
  state.svg = svgContainer.select<SVGSVGElement>("svg");
  state.svgGraph = state.svg.select<SVGGraphicsElement>("g");
  state.svg.attr("class", "map-svg");
  state.svg.attr("width", "100%");
  state.svg.attr("height", "100%");
  state.svg.attr("viewBox", null);
  state.zoom = d3.zoom<SVGSVGElement, null>().on("zoom", function() {
    // eslint-disable-next-line
    state.svgGraph!.attr("transform", d3.event.transform);
    state.scale = d3.event.transform.k;
    state.x = d3.event.transform.x;
    state.y = d3.event.transform.y;
    sendDidChangeZoom(state);
  });
  // remove double click listener
  state.svg.call(state.zoom).on("dblclick.zoom", null);
  const groupNode: SVGGraphicsElement = state.svgGraph!.node() as SVGGraphicsElement;
  const bBox = groupNode.getBBox();
  state.graphSize.width = bBox.width;
  state.graphSize.height = bBox.height;
  if (!isUpdate && !settings.didInitiate) {
    showAllAndCenterMap(state);
  } else {
    setZoom(state.x, state.y, state.scale, 0, state);
  }
  state.svgGraph.attr("height", state.graphSize.height * state.scale + 40);
};
const getNodeWithArgdownId = (id: string): SVGGraphicsElement | undefined => {
  const nodes = state
    .svgGraph!.selectAll<SVGGraphicsElement, null>("g.node")
    .nodes();
  return nodes.find(n => getArgdownId(n) === id);
};
const getArgdownId = (node: SVGGraphicsElement): string => {
  const title = d3
    .select(node)
    .select<SVGTitleElement>("title")
    .node();
  if (title) {
    console.log("id: " + title.textContent);
    return title.textContent || "";
  }
  return "";
};
const showAllAndCenterMap = (state: IVizjsViewState) => {
  if (!state.svg) {
    return;
  }
  let positionInfo = state.svg.node()!.getBoundingClientRect();
  const xScale = positionInfo.width / state.graphSize.width;
  const yScale = positionInfo.height / state.graphSize.height;
  const scale = Math.min(xScale, yScale);
  const x = (positionInfo.width - state.graphSize.width * scale) / 2;
  const scaledHeight = state.graphSize.height * scale;
  const y = scaledHeight + (positionInfo.height - scaledHeight) / 2;
  setZoom(x, y, scale, 0, state);
};
/**
 *
 * Because we cannot override inline styles, we have to save original inline stroke and strokeWidth attributes and put them back in on deselection.
 */
const deselectSelectedNode = (): void => {
  if (state.selectedNode) {
    state.selectedNode.classList.remove("selected");
    const path = state.selectedNode.getElementsByTagName("path")[0];
    path.setAttribute("stroke-width", state.selectedNodeStrokeWidth || "");
    //path.setAttribute("stroke", state.selectedNodeStroke || "");
  }
};
const selectNode = (id: string): void => {
  deselectSelectedNode();
  state.selectedNode = getNodeWithArgdownId(id);
  if (state.selectedNode) {
    const path = state.selectedNode.getElementsByTagName("path")[0];
    state.selectedNode.classList.add("selected");
    //state.selectedNodeStroke = path.getAttribute("stroke") || "";
    state.selectedNodeStrokeWidth = path.getAttribute("stroke-width") || "";
    //path.setAttribute("stroke", "#40e0d0");
    path.setAttribute("stroke-width", "8");
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
const setZoom = (
  x: number,
  y: number,
  scale: number,
  duration: number,
  state: IVizjsViewState
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

onceDocumentLoaded(() => {
  loadSvg("", state);
});

window.addEventListener(
  "message",
  event => {
    if (event.data.source !== settings.source) {
      return;
    }

    switch (event.data.type) {
      case "didChangeTextDocument":
        loadSvg(event.data.svg, state, true);
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
    let node = event.target as Element;
    node;
    node = node.parentNode as Element
  ) {
    if (node.tagName && node.tagName === "g" && node.classList) {
      if (node.classList.contains("node")) {
        const g = <SVGGraphicsElement>node;
        const id = getArgdownId(g);
        selectNode(id);
        messagePoster.postMessage("didSelectMapNode", { id });
        return;
      } else if (node.classList.contains("cluster")) {
        const heading = d3
          .select(node)
          .selectAll<SVGTextElement, null>("text")
          .nodes()!
          .reduce(
            (acc: string, val: SVGTextElement) => acc + val.textContent,
            ""
          );
        messagePoster.postMessage("didSelectCluster", { heading });
        return;
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
          if (command === "argdown.exportDocumentToVizjsSvg") {
            messagePoster.postCommand(command, [settings.source]);
          } else if (command === "argdown.exportDocumentToVizjsPdf") {
            messagePoster.postCommand(command, [settings.source]);
          } else if (command === "argdown.exportContentToVizjsPng") {
            openScaleDialog(scale => {
              var svgContainer = document.getElementById("svg-container")!;
              var svgEl: SVGSVGElement = svgContainer.getElementsByTagName(
                "svg"
              )[0];
              getPngAsString(svgEl, scale, "", pngString => {
                messagePoster.postCommand(command, [
                  settings.source,
                  pngString
                ]);
              });
            });
          }
          event.preventDefault();
          event.stopPropagation();
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
