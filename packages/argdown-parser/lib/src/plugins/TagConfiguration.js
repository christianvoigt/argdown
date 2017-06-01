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
          //default colorScheme taken from ColorBrewer: https://bl.ocks.org/mbostock/5577023
          colorScheme: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]
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
      var previousConfig = data.config.tags != null;
      data.config.tags = data.config.tags || [];
      if (data.config && data.config.tagColorScheme) {
        this.config = { colorScheme: data.config.tagColorScheme };
      }
      var index = 0;
      var tagList = data.tags;
      if (previousConfig) {
        tagList = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data.config.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var tagData = _step.value;

            tagList.push(tagData.tag);
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
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = tagList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tag = _step2.value;

          var _tagData = _.find(data.config.tags, { tag: tag });
          if (!_tagData) {
            _tagData = { tag: tag };
            data.config.tags.push(_tagData);
          }
          if (!_tagData.color && index < this.settings.colorScheme.length) {
            _tagData.color = this.settings.colorScheme[index];
          }
          index++;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
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