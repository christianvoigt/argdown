'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TagConfiguration = function () {
  _createClass(TagConfiguration, [{
    key: 'config',
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
    key: 'run',
    value: function run(data) {
      if (!data.tags) {
        return;
      }
      data.config = data.config || {};
      data.tagsDictionary = {};

      var previousConfig = data.config.tags != null;
      data.config.tags = data.config.tags || [];
      if (data.config && data.config.tagColorScheme) {
        this.config = { colorScheme: data.config.tagColorScheme };
      }
      var selectedTags = data.tags;
      if (previousConfig) {
        selectedTags = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data.config.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var tagData = _step.value;

            selectedTags.push(tagData.tag);
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
        for (var _iterator2 = data.tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tag = _step2.value;

          var tagConfig = _.find(data.config.tags, { tag: tag });
          var _tagData = _.clone(tagConfig);
          if (!_tagData) {
            _tagData = { tag: tag };
          }
          data.tagsDictionary[tag] = _tagData;
          var index = selectedTags.indexOf(tag);
          _tagData.cssClass = _util2.default.getHtmlId('tag-' + tag);
          if (index > -1) {
            if (!_tagData.color && index < this.settings.colorScheme.length) {
              _tagData.color = this.settings.colorScheme[index];
            }
            _tagData.cssClass += ' tag' + index;
            _tagData.index = index;
          }
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.keys(data.statements)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var title = _step3.value;

          var equivalenceClass = data.statements[title];
          if (equivalenceClass.tags) {
            equivalenceClass.sortedTags = this.sortTags(equivalenceClass.tags, data);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(data.arguments)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _title = _step4.value;

          var argument = data.arguments[_title];
          if (argument.tags) {
            argument.sortedTags = this.sortTags(argument.tags, data);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: 'sortTags',
    value: function sortTags(tags, data) {
      var filtered = _.filter(tags, function (tag) {
        return data.tagsDictionary[tag].index != null;
      });
      var sorted = _.sortBy(filtered, function (tag) {
        return data.tagsDictionary[tag].index;
      });
      return sorted;
    }
  }]);

  return TagConfiguration;
}();

module.exports = {
  TagConfiguration: TagConfiguration
};
//# sourceMappingURL=TagConfiguration.js.map