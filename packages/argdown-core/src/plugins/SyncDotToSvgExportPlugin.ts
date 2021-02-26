import vizRenderStringSync from "@aduh95/viz.js/sync";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { DefaultSettings, isObject, mergeDefaults } from "../utils";
import defaultsDeep from "lodash.defaultsdeep";
import { IArgdownRequest } from "..";
import { checkResponseFields } from "../ArgdownPluginError";
import { GraphvizEngine, IVizJsSettings } from "./VizJsSettings";
import { RenderOptions } from "@aduh95/viz.js";

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
    const files = request.images?.files;
    const settings: RenderOptions = {
      engine,
      nop,
      format: "svg"
    };
    if (files) {
      settings.images = Object.values(files).map(({ path, width, height }) => ({
        path,
        width: width || 100,
        height: height || 100
      }));
    }
    response.svg = vizRenderStringSync(response.dot!, settings);
    if (removeProlog) {
      response.svg = response.svg!.replace(
        /<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/,
        ""
      );
    }
    if (
      request.images &&
      request.images.convertToDataUrls &&
      request.images.files
    ) {
      for (let image of Object.values(request.images.files)) {
        if (image.dataUrl) {
          const stringToReplace = new RegExp(image.path, "g");
          response.svg = response.svg?.replace(stringToReplace, image.dataUrl);
        }
      }
    }
    return response;
  };
}
