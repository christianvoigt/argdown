"use strict";

var _viz = require("viz.js");

var _viz2 = _interopRequireDefault(_viz);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        response.svg = (0, _viz2.default)(response.dot, this.getSettings(request));
        return response;
    }
}
module.exports = {
    DotToSvgExportPlugin: DotToSvgExportPlugin
};
//# sourceMappingURL=DotToSvgExportPlugin.js.map