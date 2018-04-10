"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PluginWithSettings = function () {
    _createClass(PluginWithSettings, [{
        key: "reset",
        value: function reset(settings) {
            var changeDefaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            this.settings = _.defaultsDeep({}, settings || {}, this.defaultSettings || {});
            if (changeDefaults) {
                this.defaultSettings = this.settings;
            }
        }
    }]);

    function PluginWithSettings(defaultSettings, instanceDefaultSettings) {
        _classCallCheck(this, PluginWithSettings);

        this.defaultSettings = defaultSettings;
        this.reset(instanceDefaultSettings, true);
    }

    return PluginWithSettings;
}();

module.exports = {
    PluginWithSettings: PluginWithSettings
};
//# sourceMappingURL=PluginWithSettings.js.map