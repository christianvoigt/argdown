import * as d3 from "d3";
import { onceDocumentLoaded } from "./events";
import { createPosterForVsCode } from "./messaging";
import { getSettings } from "./settings";
import throttle = require("lodash.throttle");
import { initMenu } from "./menu";
import { getPngAsString } from "./export";
import { openScaleDialog } from "./scaleDialog";
import { VizJsMap } from "@argdown/map-views";
import { OnZoomChangedHandler } from "@argdown/map-views/dist/ZoomManager";
import { ArgdownPreviewStore } from "./state";
import { OnSelectionChangedHandler } from "@argdown/map-views/dist/CanSelectNode";

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();
vscode.postMessage({});

const store = new ArgdownPreviewStore(vscode);

const messagePoster = createPosterForVsCode(vscode);
initMenu(messagePoster);

window.cspAlerter.setPoster(messagePoster);
window.styleLoadingMonitor.setPoster(messagePoster);

const previewSettings = getSettings();

const onZoomChanged: OnZoomChangedHandler = throttle(data => {
  store.transformState(s => {
    s.vizJs.scale = data.scale;
    s.vizJs.position = data.position;
    return s;
  });
}, 50);
const onSelectionChanged: OnSelectionChangedHandler = id => {
  store.transformState(s => {
    s.selectedNode = id;
    return s;
  });
};

const svgContainer = d3.select<HTMLElement, null>("#svg-container")!;
declare global {
  interface Window {
    Viz: { render?: any; Module?: any };
  }
}
// create a global fake Viz so that full.render.js will register its objects
window.Viz = {};
let vizJsMap: VizJsMap | null = null;

const updateMap = () => {
  const {
    selectedNode,
    vizJs: { dot, settings, position, scale }
  } = store.getState();
  if (dot) {
    vizJsMap!.render({
      dot,
      settings,
      selectedNode,
      position,
      scale
    });
  }
};
onceDocumentLoaded(() => {
  if (!window || !window.Viz || !window.Viz.render || !window.Viz.Module) {
    return;
  }
  vizJsMap = new VizJsMap(
    svgContainer.node()!,
    { render: window.Viz.render, Module: window.Viz.Module },
    onZoomChanged,
    onSelectionChanged
  );
  updateMap();
});

window.addEventListener(
  "message",
  event => {
    if (event.data.source !== previewSettings.source) {
      return;
    }

    switch (event.data.type) {
      case "didChangeTextDocument":
        const dot = event.data.dot;
        const settings = JSON.parse(event.data.settings);
        store.transformState(s => {
          s.vizJs.dot = dot;
          s.vizJs.settings = settings;
          return s;
        });
        updateMap();
        break;
      case "didSelectMapNode":
        if (previewSettings.syncPreviewSelectionWithEditor) {
          const id = event.data.id;
          vizJsMap!.selectNode(id);
        }
        break;
    }
  },
  false
);

document.addEventListener("dblclick", event => {
  if (!previewSettings.doubleClickToSwitchToEditor) {
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
        const id = vizJsMap!.getArgdownId(g);
        vizJsMap!.selectNode(id);
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
            messagePoster.postCommand(command, [previewSettings.source]);
          } else if (command === "argdown.copyWebComponentToClipboard") {
            messagePoster.postCommand(command, [previewSettings.source]);
          } else if (command === "argdown.exportDocumentToVizjsPdf") {
            messagePoster.postCommand(command, [previewSettings.source]);
          } else if (command === "argdown.exportContentToVizjsPng") {
            openScaleDialog(scale => {
              var svgContainer = document.getElementById("svg-container")!;
              var svgEl: SVGSVGElement = svgContainer.getElementsByTagName(
                "svg"
              )[0];
              getPngAsString(svgEl, scale, "", pngString => {
                messagePoster.postCommand(command, [
                  previewSettings.source,
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
        vizJsMap!.deselectNode();
        break;
      }
      node = node.parentNode;
    }
  },
  true
);
