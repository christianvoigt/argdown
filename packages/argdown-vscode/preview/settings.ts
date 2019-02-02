const defaultsDeep = require("lodash.defaultsdeep");
export interface IPreviewSettings {
  source: string;
  line: number;
  lineCount: number;
  scrollPreviewWithEditor?: boolean;
  scrollEditorWithPreview: boolean;
  disableSecurityWarnings: boolean;
  doubleClickToSwitchToEditor: boolean;
  scale?: number;
  x?: number;
  y?: number;
  didInitiate?: boolean;
  syncPreviewSelectionWithEditor?: boolean;
  transitionDuration: number;
  dagre: {
    rankDir: string;
    rankSep: number;
    nodeSep: number;
  };
}

let cachedSettings: IPreviewSettings | undefined = undefined;
let defaults = {
  dagre: {
    rankDir: "BT",
    rankSep: 50,
    nodeSep: 70
  },
  transitionDuration: 350,
  syncPreviewSelectionWithEditor: true
};

export function getSettings(): IPreviewSettings {
  if (cachedSettings) {
    return cachedSettings;
  }

  const element = document.getElementById("vscode-argdown-preview-data");
  if (element) {
    const data = element.getAttribute("data-settings");
    if (data) {
      cachedSettings = defaultsDeep(JSON.parse(data), defaults);
      return cachedSettings!;
    }
  }

  throw new Error("Could not load settings");
}
