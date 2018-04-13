import Viz from "viz.js";
import * as _ from "lodash";

class DotToSvgExportPlugin {
    constructor(config) {
        this.name = "DotToSvgExportPlugin";
        this.defaults = _.defaultsDeep({}, config, {
            format: "svg"
        });
        this.config = config;
    }
    getSettings(request) {
        if (request.dotToSvg) {
            return request.dotToSvg;
        } else if (request.DotToSvgExport) {
            return request.DotToSvgExport;
        } else {
            request.dotToSvg = {};
            return request.dotToSvg;
        }
    }
    prepare(request) {
        _.defaultsDeep(this.getSettings(request), this.defaults);
    }
    run(request, response) {
        if (!response.dot) {
            return response;
        }
        response.svg = Viz(response.dot, this.getSettings(request));
        return response;
    }
}
module.exports = {
    DotToSvgExportPlugin: DotToSvgExportPlugin
};
