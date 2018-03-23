import * as _ from "lodash";

class PluginWithSettings {
    reset(settings, changeDefaults = false) {
        this.settings = _.defaultsDeep({}, settings || {}, this.defaultSettings || {});
        if (changeDefaults) {
            this.defaultSettings = this.settings;
        }
    }
    constructor(defaultSettings, instanceDefaultSettings) {
        this.defaultSettings = defaultSettings;
        this.reset(instanceDefaultSettings, true);
    }
}
module.exports = {
    PluginWithSettings: PluginWithSettings
};
