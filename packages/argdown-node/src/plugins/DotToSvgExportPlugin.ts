// import Viz from "@aduh95/viz.js";
// const dot2svg = require("@aduh95/viz.js/async");
import vizRenderStringAsync from "@aduh95/viz.js/async";
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

// const worker = getWorker();
// const viz = new Viz({ worker });
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
    response.svg = await vizRenderStringAsync(response.dot!, {
      engine,
      nop,
      format: "svg"
    });
    // .finally(() => viz.terminateWorker());
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
