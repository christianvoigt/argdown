"use strict";

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class StdOutPlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
                dataKey: "test"
            };
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
    }
    constructor(config) {
        this.name = "StdOutPlugin";
        this.config = config;
    }
    run(request, response) {
        if (request.stdOut) {
            this.config = request.stdOut;
        }
        let content = !this.settings.isRequestData ? response[this.settings.dataKey] : request[this.settings.dataKey];
        process.stdout.write(content);
    }
}

module.exports = {
    StdOutPlugin: StdOutPlugin
};
//# sourceMappingURL=StdOutPlugin.js.map