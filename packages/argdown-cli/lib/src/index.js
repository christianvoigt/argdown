'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SaveAsFilePlugin = exports.CopyDefaultCssPlugin = exports.app = undefined;

var _argdownParser = require('argdown-parser');

var _argdownMapMaker = require('argdown-map-maker');

var _SaveAsFilePlugin = require('./plugins/SaveAsFilePlugin.js');

var _CopyDefaultCssPlugin = require('./plugins/CopyDefaultCssPlugin.js');

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var glob = require('glob');
var fs = require('fs');
var chokidar = require('chokidar');
var requireUncached = require("require-uncached");

var app = new _argdownParser.ArgdownApplication();
var preprocessor = new _argdownParser.ArgdownPreprocessor();
var htmlExport = new _argdownParser.HtmlExport();
var tagConfiguration = new _argdownParser.TagConfiguration();
var mapMaker = new _argdownMapMaker.MapMaker();
var dotExport = new _argdownMapMaker.DotExport();
var argmlExport = new _argdownMapMaker.ArgMLExport();
var jsonExport = new _argdownParser.JSONExport();
var saveAsHtml = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: './html',
  dataKey: 'html',
  extension: '.html'
});
var copyDefaultCss = new _CopyDefaultCssPlugin.CopyDefaultCssPlugin();

var saveAsDot = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: './dot',
  dataKey: 'dot',
  extension: '.dot'
});
var saveAsArgML = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: './graphml',
  dataKey: 'argml',
  extension: '.graphml'
});
var saveAsJSON = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: './json',
  dataKey: 'json',
  extension: '.json'
});
app.addPlugin(preprocessor, "preprocessor");
app.addPlugin(tagConfiguration, "preprocessor");

app.addPlugin(htmlExport, "export-html");
app.addPlugin(copyDefaultCss, "copy-default-css");
app.addPlugin(saveAsHtml, "save-as-html");

app.addPlugin(mapMaker, "export-json");
app.addPlugin(jsonExport, "export-json");
app.addPlugin(saveAsJSON, "save-as-json");

app.addPlugin(mapMaker, "export-dot");
app.addPlugin(dotExport, "export-dot");
app.addPlugin(saveAsDot, "save-as-dot");

app.addPlugin(mapMaker, "export-argml");
app.addPlugin(argmlExport, "export-argml");
app.addPlugin(saveAsArgML, "save-as-argml");

app.load = function (config) {
  if (!config.input) {
    config.input = "./*.argdown";
  }
  var $ = this;
  if (config.watch) {
    var watcher = chokidar.watch(config.input, {});
    var watcherConfig = _.cloneDeep(config);
    watcherConfig.watch = false;

    watcher.on('add', function (path) {
      if (config.verbose) {
        console.log('File ' + path + ' has been added.');
      }
      watcherConfig.input = path;
      $.load(watcherConfig);
    }).on('change', function (path) {
      if (config.verbose) {
        console.log('File ' + path + ' has been changed.');
      }
      watcherConfig.input = path;
      $.load(watcherConfig);
    }).on('unlink', function (path) {
      if (config.verbose) {
        console.log('File ' + path + ' has been removed.');
      }
    });
  } else {
    glob(config.input, function (er, files) {
      if (er) {
        console.log(er);
        return;
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            if (config.verbose) {
              console.log("Processing file: " + file);
            }
            try {
              var input = fs.readFileSync(file, 'utf8');
              config.saveAs = config.saveAs || {};
              config.saveAs.sourceFile = file;
              $.run({ input: input, config: config });
            } catch (e) {
              console.log(e);
            }
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
    });
  }
};

/**
 * Taken from eslint: https://github.com/eslint/eslint/blob/master/lib/config/config-file.js
 * Loads a JavaScript configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
app.loadJSFile = function loadJSFile(filePath) {
  try {
    return requireUncached(filePath);
  } catch (e) {
    e.message = 'Cannot read file: ' + filePath + '\nError: ' + e.message;
    throw e;
  }
};

app.loadConfig = function (filePath) {
  filePath = filePath || process.cwd() + '/argdown.config.js';
  var config = {};
  try {
    config = this.loadJSFile(filePath);
    console.log(config);
  } catch (e) {
    console.log(e);
  }
  return config;
};

exports.app = app;
exports.CopyDefaultCssPlugin = _CopyDefaultCssPlugin.CopyDefaultCssPlugin;
exports.SaveAsFilePlugin = _SaveAsFilePlugin.SaveAsFilePlugin;
//# sourceMappingURL=index.js.map