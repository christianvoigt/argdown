const defaultsDeep = require("lodash.defaultsdeep");
export interface IPreviewSettings {
  source: string;
  disableSecurityWarnings: boolean;
  doubleClickToSwitchToEditor: boolean;
  scrollPreviewWithEditor?: boolean;
  scrollEditorWithPreview: boolean;
  syncPreviewSelectionWithEditor?: boolean;
  transitionDuration: number;
}

let cachedSettings: IPreviewSettings | undefined = undefined;
let defaults = {
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
