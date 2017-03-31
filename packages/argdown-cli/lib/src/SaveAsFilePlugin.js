'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var SaveAsFilePlugin = function () {
  _createClass(SaveAsFilePlugin, [{
    key: 'config',
    set: function set(config) {
      this.settings = _.defaults(config || {}, {
        dataKey: "test",
        fileName: "default",
        extension: ".txt",
        outputDir: "."
      });
    }
  }]);

  function SaveAsFilePlugin(config) {
    _classCallCheck(this, SaveAsFilePlugin);

    this.name = "SaveAsFilePlugin";
    this.config = config;
  }

  _createClass(SaveAsFilePlugin, [{
    key: 'run',
    value: function run(data) {
      var fileContent = data[this.settings.dataKey];
      if (!_.isEmpty(fileContent) && _.isString(fileContent)) {
        var fileName = "default";
        if (!_.isEmpty(this.settings.sourceFile) && _.isString(this.settings.sourceFile)) {
          fileName = this.getFileName(this.settings.sourceFile);
        } else if (_.isFunction(this.settings.fileName)) {
          fileName = this.settings.fileName.call(this, data);
        } else if (data.sourceFile) {
          fileName = this.getFileName(data.sourceFile);
        } else if (_.isString(this.settings.fileName)) {
          fileName = this.settings.fileName;
        }
        this.saveAsFile(fileContent, this.settings.outputDir, fileName, this.settings.extension);
      }
    }
  }, {
    key: 'getFileName',
    value: function getFileName(file) {
      var extension = path.extname(file);
      return path.basename(file, extension);
    }
  }, {
    key: 'saveAsFile',
    value: function saveAsFile(data, outputDir, fileName, extension) {
      this.mkDir(outputDir);
      //let dirName = path.dirname(output);
      fs.writeFile(outputDir + '/' + fileName + extension, data, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("Exported " + fileName + " to " + outputDir + "/" + fileName + extension);
      });
    }
  }, {
    key: 'mkDir',
    value: function mkDir(outputDir) {
      mkdirp(outputDir, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }]);

  return SaveAsFilePlugin;
}();

module.exports = {
  SaveAsFilePlugin: SaveAsFilePlugin
};
//# sourceMappingURL=SaveAsFilePlugin.js.map