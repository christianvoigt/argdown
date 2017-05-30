"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TagConfiguration = function () {
  _createClass(TagConfiguration, [{
    key: "config",
    set: function set(config) {
      var previousSettings = this.settings;
      if (!previousSettings) {
        previousSettings = {
          //default colorScheme taken from ColorBrewer Paired: https://bl.ocks.org/mbostock/5577023
          colorScheme: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"]
        };
      }
      this.settings = _.defaultsDeep({}, config, previousSettings);
    }
  }]);

  function TagConfiguration(config) {
    _classCallCheck(this, TagConfiguration);

    this.name = "TagConfiguration";
    this.config = config;
  }

  _createClass(TagConfiguration, [{
    key: "run",
    value: function run(data) {
      if (!data.tags) {
        return;
      }
      data.config = data.config || {};
      data.config.tags = data.config.tags || {};
      this.config = data.config.tagColor;
      var index = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tag = _step.value;

          var tagData = data.config.tags[tag] || {};
          data.config.tags[tag] = tagData;
          if (!tagData.color && index < this.settings.colorScheme.length) {
            tagData.color = this.settings.colorScheme[index];
          }
          tagData.index = index;
          index++;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);

  return TagConfiguration;
}();

module.exports = {
  TagConfiguration: TagConfiguration
};
//# sourceMappingURL=TagConfiguration.js.map