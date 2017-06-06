"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StdOutPlugin = function () {
  _createClass(StdOutPlugin, [{
    key: "config",
    set: function set(config) {
      var previousSettings = this.settings;
      if (!previousSettings) {
        previousSettings = {
          dataKey: "test"
        };
      }
      this.settings = _.defaultsDeep({}, config, previousSettings);
    }
  }]);

  function StdOutPlugin(config) {
    _classCallCheck(this, StdOutPlugin);

    this.name = "StdOutPlugin";
    this.config = config;
  }

  _createClass(StdOutPlugin, [{
    key: "run",
    value: function run(data) {
      if (data.config) {
        if (data.config.stdOut) {
          this.config = data.config.stdOut;
        }
      }

      var content = data[this.settings.dataKey];
      process.stdout.write(content);
    }
  }]);

  return StdOutPlugin;
}();

module.exports = {
  StdOutPlugin: StdOutPlugin
};
//# sourceMappingURL=StdOutPlugin.js.map