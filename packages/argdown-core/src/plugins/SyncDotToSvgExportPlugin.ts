import vizRenderStringSync from "@aduh95/viz.js/sync";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { DefaultSettings, isObject, mergeDefaults } from "../utils";
import defaultsDeep from "lodash.defaultsdeep";
import { IArgdownRequest } from "..";
import { checkResponseFields } from "../ArgdownPluginError";
import { GraphvizEngine, IVizJsSettings } from "./VizJsSettings";

const defaultSettings: DefaultSettings<IVizJsSettings> = {
  removeProlog: true,
  engine: GraphvizEngine.DOT
};
/**
 * For most use cases, use the asynchronous version of this plugin in @argdown/node.
 * This version is only kept in this repository because we need to use it synchronously in Markdown parser plugins (like the Markdown-It plugin).
 */
export class SyncDotToSvgExportPlugin implements IArgdownPlugin {
  name = "SyncDotToSvgExportPlugin";
  defaults: IVizJsSettings;
  constructor(config?: IVizJsSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest) {
    if (isObject(request.vizJs)) {
      return request.vizJs;
    } else {
      request.vizJs = {};
      return request.vizJs;
    }
  }
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    const requiredResponseFields: string[] = ["dot"];
    checkResponseFields(this, response, requiredResponseFields);
    let { engine, nop, removeProlog } = this.getSettings(request);
    response.svg = (vizRenderStringSync as any)(response.dot, {
      engine,
      nop,
      format: "svg"
    });
    if (removeProlog) {
      response.svg = response.svg!.replace(
        /<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/,
        ""
      );
    }
    return response;
  };
}
