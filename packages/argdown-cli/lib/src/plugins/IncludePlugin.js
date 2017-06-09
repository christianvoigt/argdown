'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');

var IncludePlugin = function () {
  _createClass(IncludePlugin, [{
    key: 'config',
    set: function set(config) {
      var previousSettings = this.settings;
      if (!previousSettings) {
        previousSettings = {
          regEx: /@include\(([^\)]+)\)/g
        };
      }
      this.settings = _.defaultsDeep({}, config, previousSettings);
    }
  }]);

  function IncludePlugin(config) {
    _classCallCheck(this, IncludePlugin);

    this.name = "IncludePlugin";
    this.config = config;
  }

  _createClass(IncludePlugin, [{
    key: 'run',
    value: function run(data) {
      if (data.config && data.config.include) {
        this.config = data.config.include;
      }
      if (!data.input || !data.inputFile) {
        return data;
      }
      data.input = this.replaceIncludes(data.inputFile, data.input, this.settings.regEx, []);
      return data;
    }
  }, {
    key: 'replaceIncludes',
    value: function replaceIncludes(currentFilePath, str, regEx, filesAlreadyIncluded) {
      var match = null;
      var directoryPath = path.dirname(currentFilePath);
      regEx.lastIndex = 0;
      while (match = regEx.exec(str)) {
        var absoluteFilePath = path.resolve(directoryPath, match[1]);
        var strToInclude = '';
        if (_.includes(filesAlreadyIncluded, absoluteFilePath)) {
          strToInclude = '<!-- Include failed: File \'' + absoluteFilePath + '\' already included. To avoid infinite loops, each file can only be included once. -->';
        } else {
          filesAlreadyIncluded.push(absoluteFilePath);
          strToInclude = fs.readFileSync(absoluteFilePath, 'utf8');
          if (strToInclude == null) {
            strToInclude = '<!-- Include failed: File \'' + absoluteFilePath + '\' not found. -->\n';
          } else {
            strToInclude = this.replaceIncludes(absoluteFilePath, strToInclude, regEx, filesAlreadyIncluded);
          }
        }
        str = str.substr(0, match.index) + strToInclude + str.substr(match.index + match[0].length);
        regEx.lastIndex = match.index + strToInclude.length;
      }
      return str;
    }
  }]);

  return IncludePlugin;
}();

module.exports = {
  IncludePlugin: IncludePlugin
};
//# sourceMappingURL=IncludePlugin.js.map