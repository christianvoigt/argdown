'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SaveAsFilePlugin = exports.CopyDefaultCssPlugin = exports.app = undefined;

var _argdownParser = require('argdown-parser');

var _argdownMapMaker = require('argdown-map-maker');

var _SaveAsFilePlugin = require('./plugins/SaveAsFilePlugin.js');

var _CopyDefaultCssPlugin = require('./plugins/CopyDefaultCssPlugin.js');

var _LogParserErrorsPlugin = require('./plugins/LogParserErrorsPlugin.js');

var _StdOutPlugin = require('./plugins/StdOutPlugin.js');

var _IncludePlugin = require('./plugins/IncludePlugin.js');

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var glob = require('glob');
var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var requireUncached = require("require-uncached");

var app = new _argdownParser.ArgdownApplication();
var includePlugin = new _IncludePlugin.IncludePlugin();
var parserPlugin = new _argdownParser.ParserPlugin();
var logParserErrorsPlugin = new _LogParserErrorsPlugin.LogParserErrorsPlugin();
var modelPlugin = new _argdownParser.ModelPlugin();
var htmlExport = new _argdownParser.HtmlExport();
var tagPlugin = new _argdownParser.TagPlugin();
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
var saveAsArgdown = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: './compiled',
  dataKey: 'input',
  extension: '.argdown'
});
var stdoutDot = new _StdOutPlugin.StdOutPlugin({ dataKey: 'dot' });
var stdoutArgML = new _StdOutPlugin.StdOutPlugin({ dataKey: 'argml' });
var stdoutJSON = new _StdOutPlugin.StdOutPlugin({ dataKey: 'json' });
var stdoutHtml = new _StdOutPlugin.StdOutPlugin({ dataKey: 'html' });
var stdoutArgdown = new _StdOutPlugin.StdOutPlugin({ dataKey: 'input' });

app.addPlugin(includePlugin, 'preprocessor');
app.addPlugin(parserPlugin, 'parse-input');
app.addPlugin(logParserErrorsPlugin, "log-parser-errors");
app.addPlugin(modelPlugin, "build-model");
app.addPlugin(tagPlugin, "build-model");

app.addPlugin(stdoutArgdown, 'stdout-argdown');
app.addPlugin(saveAsArgdown, 'save-as-argdown');

app.addPlugin(htmlExport, "export-html");
app.addPlugin(copyDefaultCss, "copy-default-css");
app.addPlugin(saveAsHtml, "save-as-html");
app.addPlugin(stdoutHtml, "stdout-html");

app.addPlugin(mapMaker, "export-json");
app.addPlugin(jsonExport, "export-json");
app.addPlugin(saveAsJSON, "save-as-json");
app.addPlugin(stdoutJSON, "stdout-json");

app.addPlugin(mapMaker, "export-dot");
app.addPlugin(dotExport, "export-dot");
app.addPlugin(saveAsDot, "save-as-dot");
app.addPlugin(stdoutDot, "stdout-dot");

app.addPlugin(mapMaker, "export-argml");
app.addPlugin(argmlExport, "export-argml");
app.addPlugin(saveAsArgML, "save-as-argml");
app.addPlugin(stdoutArgML, "stdout-argml");

app.load = function (config) {
  var inputGlob = config.input || './*.argdown';
  var ignoreFiles = config.ignore || ['**/_*', // Exclude files starting with '_'.
  '**/_*/**' // Exclude entire directories starting with '_'.
  ];
  var options = {};
  if (ignoreFiles) {
    options.ignore = ignoreFiles;
  }
  if (!config.rootPath) {
    config.rootPath = process.cwd();
  }

  var $ = this;
  var absoluteInputGlob = path.resolve(config.rootPath, inputGlob);
  if (config.watch) {
    var watcher = chokidar.watch(absoluteInputGlob, options);
    var watcherConfig = _.cloneDeep(config);
    watcherConfig.watch = false;

    watcher.on('add', function (path) {
      app.logger.log("verbose", 'File ' + path + ' has been added.');
      watcherConfig.input = path;
      $.load(watcherConfig);
    }).on('change', function (path) {
      app.logger.log("verbose", 'File ' + path + ' has been changed.');
      watcherConfig.input = path;
      $.load(watcherConfig);
    }).on('unlink', function (path) {
      app.logger.log("verbose", 'File ' + path + ' has been removed.');
    });
  } else {
    glob(absoluteInputGlob, options, function (er, files) {
      if (er) {
        app.logger.log("error", er);
        return;
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            app.logger.log("verbose", "Processing file: " + file);
            try {
              var input = fs.readFileSync(file, 'utf8');
              config.saveAs = config.saveAs || {};
              config.saveAs.sourceFile = file;
              $.run({ input: input, inputFile: file, config: config });
            } catch (e) {
              app.logger.log("error", e);
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
  var absoluteFilePath = path.resolve(process.cwd(), filePath);
  try {
    return requireUncached(absoluteFilePath);
  } catch (e) {
    e.message = 'Cannot read file: ' + absoluteFilePath + '\nError: ' + e.message;
    throw e;
  }
};

app.loadConfig = function (filePath) {
  filePath = filePath || './argdown.config.js';
  var config = {};
  try {
    var jsModuleExports = this.loadJSFile(filePath);
    if (jsModuleExports.config) {
      config = jsModuleExports.config;
    } else {
      // let's try the default export
      config = jsModuleExports;
    }
  } catch (e) {
    app.logger.log("verbose", "No config found: " + e);
  }
  return config;
};

exports.app = app;
exports.CopyDefaultCssPlugin = _CopyDefaultCssPlugin.CopyDefaultCssPlugin;
exports.SaveAsFilePlugin = _SaveAsFilePlugin.SaveAsFilePlugin;
//# sourceMappingURL=index.js.map