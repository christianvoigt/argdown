import * as Viz from "viz.js";
import { Module, render } from "viz.js/full.render";
import * as _ from "lodash";
import {
  IRequestHandler,
  checkResponseFields,
  IArgdownRequest
} from "@argdown/core";
import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";

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
declare module "@argdown/core" {
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
const viz = new Viz({ Module, render });
export class DotToSvgExportPlugin implements IAsyncArgdownPlugin {
  name = "DotToSvgExportPlugin";
  defaults: IVizJsSettings;
  constructor(config?: IVizJsSettings) {
    this.defaults = _.defaultsDeep({}, config, {
      removeProlog: true,
      engine: GraphvizEngine.DOT
    });
  }
  prepare: IRequestHandler = (request: IArgdownRequest) => {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
  };
  getSettings = (request: IArgdownRequest): IVizJsSettings => {
    request.vizJs = request.vizJs || {};
    return request.vizJs;
  };
  runAsync: IAsyncRequestHandler = async (request, response) => {
    checkResponseFields(this, response, ["dot"]);

    let { engine, nop, removeProlog } = this.getSettings(request);
    response.svg = await viz.renderString(response.dot, { engine, nop });
    if (removeProlog) {
      response.svg = this.removeProlog(response.svg!);
    }
  };
  run: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, ["dot"]);

    let { engine, nop, removeProlog } = this.getSettings(request);
    response.svg = viz.renderString(response.dot, { engine, nop });
    if (removeProlog) {
      response.svg = this.removeProlog(response.svg!);
    }
  };
  removeProlog = (svg: string): string => {
    return svg.replace(
      /<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/,
      ""
    );
  };
}
