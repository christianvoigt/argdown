import { ArgdownEngine } from "./ArgdownEngine";
import * as vscode from "vscode";
import { ArgdownPreviewConfiguration } from "./ArgdownPreviewConfiguration";
import { IViewProvider } from "./IViewProvider";
export const dagreViewProvider: IViewProvider = {
  scripts: ["dagreView.js"],
  generateView: async () => {
    return `<svg id="dagre-svg" ref="svg" width="100%" height="100%">
          <g class="dagre" style="transform: translate(0, 10px)">
          </g>
        </svg>`;
  },
  generateSubMenu: () => {
    return `<nav class="submenu">Export as <a data-command="argdown.exportContentToDagreSvg" title="save as svg" href="#">svg</a> | <a data-command="argdown.exportContentToDagrePng" title="save as png" href="#">png</a>
	</nav>`;
  },
  generateOnDidChangeTextDocumentMessage: async (
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ) => {
    const map = await argdownEngine.exportMapJson(argdownDocument, config);
    const settings =
      config.argdownConfig && (<any>config.argdownConfig).dagre
        ? JSON.stringify((<any>config.argdownConfig).dagre)
        : "{}";
    return { map, settings };
  },
  contributeToInitialState: async (
    s,
    argdownEngine,
    argdownDocument,
    config
  ) => {
    const map = await argdownEngine.getMap(argdownDocument, config);
    const settings =
      config.argdownConfig && (<any>config.argdownConfig).dagre
        ? (<any>config.argdownConfig).dagre
        : {};
    s.dagre.map = map;
    s.dagre.settings = settings;
    return s;
  }
};
