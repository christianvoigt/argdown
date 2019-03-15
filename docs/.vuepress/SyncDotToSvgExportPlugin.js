const Viz = require("viz.js");
const _ = require("lodash");
const argdownCore = require("../../packages/argdown-core");
const {
  IRequestHandler,
  ArgdownPluginError,
  IArgdownPlugin,
  IArgdownRequest
} = argdownCore;

// old synchronous version of export plugin that uses outdated version of Viz.Js
// The current version of Viz.Js no longer supports synchronous use.
// This will hopefully change in the future so that we can use the normal version of this plugin again.
class SyncDotToSvgExportPlugin {
  constructor(config) {
    this.name = "SyncDotToSvgExportPlugin";
    this.defaults = _.defaultsDeep({}, config, { removeProlog: true });
  }
  prepare(request) {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
  }
  getSettings(request) {
    request.dotToSvg = request.dotToSvg || {};
    return request.dotToSvg;
  }
  run(_request, response) {
    if (!response.dot) {
      throw new ArgdownPluginError(this.name, "Missing dot field in response.");
    }
    response.svg = Viz(response.dot);
    response.svg = response.svg.replace(
      /<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/,
      ""
    );
    // const settings = this.getSettings(request);
    // if (settings.removeProlog) {
    // }
    return response;
  }
}
module.exports = SyncDotToSvgExportPlugin;
