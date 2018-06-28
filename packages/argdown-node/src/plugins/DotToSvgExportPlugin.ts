import * as Viz from "viz.js";
import * as _ from "lodash";
import { IRequestHandler, ArgdownPluginError, IArgdownPlugin, IArgdownRequest } from "@argdown/core";

export interface IDotToSvgSettings {
  removeProlog?: boolean;
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
export class DotToSvgExportPlugin implements IArgdownPlugin {
  name = "DotToSvgExportPlugin";
  defaults: IDotToSvgSettings;
  constructor(config?: IDotToSvgSettings) {
    this.defaults = _.defaultsDeep({}, config, { removeProlog: true });
  }
  prepare: IRequestHandler = (request: IArgdownRequest) => {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
  };
  getSettings = (request: IArgdownRequest): IDotToSvgSettings => {
    request.dotToSvg = request.dotToSvg || {};
    return request.dotToSvg;
  };
  run: IRequestHandler = (_request, response) => {
    if (!response.dot) {
      throw new ArgdownPluginError(this.name, "Missing dot field in response.");
    }
    response.svg = Viz(response.dot);
    response.svg = response.svg!.replace(/<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/, "");
    // const settings = this.getSettings(request);
    // if (settings.removeProlog) {
    // }
    return response;
  };
}
