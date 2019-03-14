import { IDagreSettings, IVizJsSettings } from "@argdown/map-views";
import { IMap } from "@argdown/core";
export interface IArgdownPreviewState {
  resource?: string;
  currentView?: string | null;
  locked?: boolean;
  selectedNode?: string | null;
  dagre: {
    position: {
      x?: number;
      y?: number;
    };
    scale?: number;
    map?: IMap;
    settings?: IDagreSettings;
  };
  vizJs: {
    position: {
      x?: number;
      y?: number;
    };
    scale?: number;
    dot?: string;
    settings?: IVizJsSettings;
  };
  html: {
    line: number;
    lineCount?: number;
  };
}
