import * as _ from "lodash";
import { IArgdownPlugin, IArgdownRequest, IRequestHandler } from "@argdown/core";
export interface IStdoutSettings {
  dataKey?: string;
  isRequestData?: boolean;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    stdout?: IStdoutSettings;
  }
}
export class StdOutPlugin implements IArgdownPlugin {
  name = "StdOutPlugin";
  defaults: IStdoutSettings;
  constructor(config?: IStdoutSettings) {
    this.defaults = _.defaultsDeep({}, config, {});
  }
  prepare: IRequestHandler = request => {
    _.defaultsDeep(this.getSettings(request), this.defaults);
  };
  // there can be several instances of this plugin in the same ArgdownApplication
  // Because of this, we can not add the instance default settings to the request object as in other plugins
  // Instead we have to add it each time the getSettings method is called to avoid keeping request specific state
  getSettings(request: IArgdownRequest): IStdoutSettings {
    request.stdout = request.stdout || {};
    return request.stdout;
  }
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);
    if (settings.dataKey) {
      let content = !settings.isRequestData ? (<any>response)[settings.dataKey] : (<any>request)[settings.dataKey];
      if (content !== undefined) {
        process.stdout.write(content);
      }
    }
  };
}

module.exports = {
  StdOutPlugin: StdOutPlugin
};
