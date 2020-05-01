import Viz from "viz.js";
import { Module, render } from "viz.js/full.render";
import {
  IRequestHandler,
  checkResponseFields,
  IArgdownRequest,
  IVizJsSettings,
  GraphvizEngine
} from "@argdown/core";
import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";
import defaultsDeep from "lodash.defaultsdeep";

const viz = new Viz({ Module, render });
export class DotToSvgExportPlugin implements IAsyncArgdownPlugin {
  name = "DotToSvgExportPlugin";
  defaults: IVizJsSettings;
  constructor(config?: IVizJsSettings) {
    this.defaults = defaultsDeep({}, config, {
      removeProlog: true,
      engine: GraphvizEngine.DOT
    });
  }
  prepare: IRequestHandler = (request: IArgdownRequest) => {
    const settings = this.getSettings(request);
    defaultsDeep(settings, this.defaults);
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
    response.svg = viz.renderString(response.dot, {
      engine,
      nop,
      format: "svg"
    });
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
