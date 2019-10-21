import { ActiveLineMarker } from "./activeLineMarker";
import { onceDocumentLoaded } from "./events";
import { createPosterForVsCode } from "./messaging";
import {
  getEditorLineNumberForPageOffset,
  scrollToRevealSourceLine
} from "./scroll-sync";
import { getSettings } from "./settings";
import throttle = require("lodash.throttle");
import { initMenu } from "./menu";
import { ArgdownPreviewStore } from "./state";

declare var acquireVsCodeApi: any;

var scrollDisabled = true;
const marker = new ActiveLineMarker();
const settings = getSettings();

const vscode = acquireVsCodeApi();
vscode.postMessage({});
const store = new ArgdownPreviewStore(vscode);

const messagePoster = createPosterForVsCode(vscode);
initMenu(messagePoster);

window.cspAlerter.setPoster(messagePoster);
window.styleLoadingMonitor.setPoster(messagePoster);

onceDocumentLoaded(() => {
  if (settings.scrollPreviewWithEditor) {
    setTimeout(() => {
      const initialLine = +store.getState().html.line;
      if (!isNaN(initialLine)) {
        scrollDisabled = true;
        scrollToRevealSourceLine(initialLine);
      }
    }, 0);
  }
});

const updateLine = (line: number) => {
  store.transformState(s => {
    s.html.line = line;
    return s;
  });
};
const onUpdateView = (() => {
  const doScroll = throttle((line: number) => {
    scrollDisabled = true;
    scrollToRevealSourceLine(line);
  }, 50);

  return (line: number) => {
    if (!isNaN(line)) {
      updateLine(line);
      doScroll(line);
    }
  };
})();

window.addEventListener(
  "resize",
  () => {
    scrollDisabled = true;
  },
  true
);

window.addEventListener(
  "message",
  event => {
    if (event.data.source !== settings.source) {
      return;
    }

    switch (event.data.type) {
      case "onDidChangeTextEditorSelection":
        marker.onDidChangeTextEditorSelection(event.data.line);
        break;

      case "updateView":
        onUpdateView(event.data.line);
        break;
    }
  },
  false
);

document.addEventListener("dblclick", event => {
  if (!settings.doubleClickToSwitchToEditor) {
    return;
  }

  // Ignore clicks on links
  for (
    let node = event.target as HTMLElement;
    node;
    node = node.parentNode as HTMLElement
  ) {
    if (node.tagName === "A") {
      return;
    }
  }

  const offset = event.pageY;
  const line = getEditorLineNumberForPageOffset(
    offset,
    store.getState().html.lineCount || 0
  );
  if (typeof line === "number" && !isNaN(line)) {
    messagePoster.postMessage("didClick", { line: Math.floor(line) });
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
          if (command === "argdown.exportDocumentToHtml") {
            messagePoster.postCommand(command, [settings.source]);
          } else if (command === "argdown.exportDocumentToDot") {
            messagePoster.postCommand(command, [settings.source]);
          } else if (command === "argdown.exportDocumentToJson") {
            messagePoster.postCommand(command, [settings.source]);
          } else if (command === "argdown.exportDocumentToGraphML") {
            messagePoster.postCommand(command, [settings.source]);
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
      }
      node = node.parentNode;
    }
  },
  true
);

if (settings.scrollEditorWithPreview) {
  window.addEventListener(
    "scroll",
    throttle(() => {
      if (scrollDisabled) {
        scrollDisabled = false;
      } else {
        const line = getEditorLineNumberForPageOffset(
          window.scrollY,
          store.getState().html.lineCount || 0
        );
        if (typeof line === "number" && !isNaN(line)) {
          messagePoster.postMessage("revealLine", { line });
        }
      }
    }, 50)
  );
}
