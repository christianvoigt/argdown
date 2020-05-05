export enum GraphvizEngine {
  CIRCO = "circo",
  DOT = "dot",
  FDP = "fdp",
  NEATO = "neato",
  OSAGE = "osage",
  TWOPI = "twopi"
}

export interface IVizJsSettings {
  removeProlog?: boolean;
  engine?: GraphvizEngine;
  nop?: number;
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for any plugin using Viz.js, for example the [[DotToSvgExportPlugin]]
     */
    vizJs?: IVizJsSettings;
  }
  export interface IArgdownResponse {
    /**
     * Exported svg
     *
     * Provided by the [[DotToSvgExportPlugin]]
     */
    svg?: string;
  }
}
