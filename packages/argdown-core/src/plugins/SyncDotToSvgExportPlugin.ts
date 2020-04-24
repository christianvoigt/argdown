import vizRenderStringSync from "@aduh95/viz.js/sync";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { DefaultSettings, isObject, mergeDefaults } from "../utils";
import defaultsDeep from "lodash.defaultsdeep";
import { IArgdownRequest } from "..";
import { checkResponseFields } from "../ArgdownPluginError";

export interface ISyncDotToSvgExportSettings {
  removeProlog?: boolean;
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[SyncDotToSvgExportPlugin]]
     */
    svg?: ISyncDotToSvgExportSettings;
  }
  interface IArgdownResponse {
    /**
     * SVG data
     *
     * Provided by the [[SyncDotToSvgExportPlugin]]
     */
    svg?: string;
  }
}
const defaultSettings: DefaultSettings<ISyncDotToSvgExportSettings> = {
  removeProlog: true
};
/**
 * For most use cases, use the asynchronous version of this plugin in @argdown/node.
 * This version is only kept in this repository because we need to use it synchronously in Markdown parser plugins (like the Markdown-It plugin).
 */
export class SyncDotToSvgExportPlugin implements IArgdownPlugin {
  name = "SyncDotToSvgExportPlugin";
  defaults: ISyncDotToSvgExportSettings;
  constructor(config?: ISyncDotToSvgExportSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest) {
    if (isObject(request.svg)) {
      return request.svg;
    } else {
      request.svg = {};
      return request.svg;
    }
  }
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);

    const requiredResponseFields: string[] = ["dot"];
    checkResponseFields(this, response, requiredResponseFields);

    response.svg = (vizRenderStringSync as any)(response.dot, "image/svg+xml");
    if (settings.removeProlog) {
      response.svg = response.svg!.replace(
        /<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/,
        ""
      );
    }
    return response;
  };
}
