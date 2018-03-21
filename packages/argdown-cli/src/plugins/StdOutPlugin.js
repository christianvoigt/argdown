import * as _ from "lodash";

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
        let content = !this.settings.isRequestData
            ? response[this.settings.dataKey]
            : request[this.settings.dataKey];
        process.stdout.write(content);
    }
}

module.exports = {
    StdOutPlugin: StdOutPlugin
};
