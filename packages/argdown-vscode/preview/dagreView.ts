import { onceDocumentLoaded } from "./events";
import { createPosterForVsCode } from "./messaging";
import { getSettings } from "./settings";
import throttle = require("lodash.throttle");
import { initMenu } from "./menu";
import { select } from "d3-selection";
import { getSvgForExport, getPngAsString } from "./export";
import { openScaleDialog } from "./scaleDialog";
import { OnZoomChangedHandler } from "@argdown/map-views/dist/ZoomManager";
import { DagreMap } from "@argdown/map-views";
import { OnSelectionChangedHandler } from "@argdown/map-views/dist/CanSelectNode";
import { ArgdownPreviewStore } from "./state";
declare function require(path: string): string;
const dagreCss = require("!raw-loader!./dagre.css");

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();
vscode.postMessage({});

const store = new ArgdownPreviewStore(vscode);

const messagePoster = createPosterForVsCode(vscode);
initMenu(messagePoster);

window.cspAlerter.setPoster(messagePoster);
window.styleLoadingMonitor.setPoster(messagePoster);

const previewSettings = getSettings();
const dagreCssHtml = '<style type="text/css">' + dagreCss + "</style>";

const getSvgEl = () => {
  return <SVGSVGElement>(<any>document.getElementById("dagre-svg")!);
};
const onZoomChanged: OnZoomChangedHandler = throttle(data => {
  store.transformState(s => {
    s.dagre.position = data.position;
    s.dagre.scale = data.scale;
    return s;
  });
}, 50);
const onSelectionChanged: OnSelectionChangedHandler = id => {
  store.transformState(s => {
    s.selectedNode = id;
    return s;
  });
};
let dagreMap: DagreMap | null = null;
const updateMap = () => {
  const {
    selectedNode,
    dagre: { map, settings, position, scale }
  } = store.getState();
  if (map) {
    dagreMap!.render({
      map,
      settings,
      selectedNode,
      scale,
      position
    });
  }
};

onceDocumentLoaded(() => {
  dagreMap = new DagreMap(getSvgEl(), onZoomChanged, onSelectionChanged);
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
        const map = JSON.parse(event.data.map);
        const settings = JSON.parse(event.data.settings);
        store.transformState(s => {
          s.dagre.map = map;
          s.dagre.settings = settings;
          return s;
        });
        updateMap();
        break;
      case "didSelectMapNode":
        if (previewSettings.syncPreviewSelectionWithEditor) {
          const id = event.data.id;
          store.transformState(s => {
            s.selectedNode = id;
            return s;
          });
          dagreMap!.selectNode(id);
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
    let node = event.target as HTMLElement;
    node;
    node = node.parentNode as HTMLElement
  ) {
    if (node.tagName && node.tagName === "g" && node.classList) {
      if (node.classList.contains("node")) {
        const id = node.id;
        dagreMap!.selectNode(id);
        messagePoster.postMessage("didSelectMapNode", { id });
      } else if (node.classList.contains("cluster")) {
        const heading = select(node)
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
            var svgString = getSvgForExport(getSvgEl(), dagreCssHtml);
            messagePoster.postCommand(command, [
              previewSettings.source,
              svgString
            ]);
          } else if (command === "argdown.exportContentToDagrePng") {
            openScaleDialog(scale => {
              getPngAsString(getSvgEl(), scale, dagreCssHtml, pngString => {
                messagePoster.postCommand(command, [
                  previewSettings.source,
                  pngString
                ]);
              });
            });
          } else if (command === "argdown.exportContentToDagrePdf") {
            var svgString = getSvgForExport(getSvgEl(), dagreCssHtml);
            messagePoster.postCommand(command, [
              previewSettings.source,
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
          node.href.startsWith(previewSettings.cspSource)
        ) {
          const regex = new RegExp(
            `^(file:\/\/|${previewSettings.cspSource})`,
            "i"
          );
          const [path, fragment] = node.href.replace(regex, "").split("#");
          messagePoster.postCommand("_markdown.openDocumentLink", [
            { path, fragment }
          ]);
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        break;
      } else if (node.tagName && node.tagName.toLowerCase() === "svg") {
        dagreMap!.deselectNode();
        break;
      }
      node = node.parentNode;
    }
  },
  true
);
