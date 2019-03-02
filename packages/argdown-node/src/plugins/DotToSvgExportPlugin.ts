import * as Viz from "viz.js";
import { Module, render } from "viz.js/full.render";
import * as _ from "lodash";
import {
  IRequestHandler,
  ArgdownPluginError,
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

export interface IDotToSvgSettings {
  removeProlog?: boolean;
  engine?: GraphvizEngine;
  nop?: number;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    /**
     * Settings for the [[DotToSvgExportPlugin]]
     */
    dotToSvg?: IDotToSvgSettings;
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
  defaults: IDotToSvgSettings;
  constructor(config?: IDotToSvgSettings) {
    this.defaults = _.defaultsDeep({}, config, {
      removeProlog: true,
      engine: GraphvizEngine.DOT
    });
  }
  prepare: IRequestHandler = (request: IArgdownRequest) => {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
  };
  getSettings = (request: IArgdownRequest): IDotToSvgSettings => {
    request.dotToSvg = request.dotToSvg || {};
    return request.dotToSvg;
  };
  runAsync: IAsyncRequestHandler = async (request, response) => {
    if (!response.dot) {
      throw new ArgdownPluginError(this.name, "Missing dot field in response.");
    }
    let { engine, nop, removeProlog } = this.getSettings(request);
    response.svg = await viz.renderString(response.dot, { engine, nop });
    if (removeProlog) {
      response.svg = response.svg!.replace(
        /<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/,
        ""
      );
    }
  };
}
