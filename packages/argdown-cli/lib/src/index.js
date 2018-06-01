"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.DotToSvgExportPlugin = exports.LogParserErrorsPlugin = exports.SvgToPdfExportPlugin = exports.SaveAsFilePlugin = exports.CopyDefaultCssPlugin = exports.app = exports.AsyncArgdownApplication = undefined;

var _AsyncArgdownApplication = require("./AsyncArgdownApplication.js");

var _argdownParser = require("argdown-parser");

var _argdownMapMaker = require("argdown-map-maker");

var _SaveAsFilePlugin = require("./plugins/SaveAsFilePlugin.js");

var _DotToSvgExportPlugin = require("./plugins/DotToSvgExportPlugin.js");

var _SvgToPdfExportPlugin = require("./plugins/SvgToPdfExportPlugin.js");

var _CopyDefaultCssPlugin = require("./plugins/CopyDefaultCssPlugin.js");

var _LogParserErrorsPlugin = require("./plugins/LogParserErrorsPlugin.js");

var _StdOutPlugin = require("./plugins/StdOutPlugin.js");

var _IncludePlugin = require("./plugins/IncludePlugin.js");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const readFile = (0, _util.promisify)(_fs2.default.readFile);

let glob = require("glob");
let path = require("path");
let chokidar = require("chokidar");
let requireUncached = require("require-uncached");

const app = new _AsyncArgdownApplication.AsyncArgdownApplication();
const includePlugin = new _IncludePlugin.IncludePlugin();
const parserPlugin = new _argdownParser.ParserPlugin();
const logParserErrorsPlugin = new _LogParserErrorsPlugin.LogParserErrorsPlugin();
const modelPlugin = new _argdownParser.ModelPlugin();
const htmlExport = new _argdownParser.HtmlExport();
const tagPlugin = new _argdownParser.TagPlugin();
const mapMaker = new _argdownMapMaker.MapMaker();
const dotExport = new _argdownMapMaker.DotExport();
const jsonExport = new _argdownParser.JSONExport();
const saveAsHtml = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: "./html",
  dataKey: "html",
  extension: ".html"
});
const copyDefaultCss = new _CopyDefaultCssPlugin.CopyDefaultCssPlugin();
const dotToSvgExport = new _DotToSvgExportPlugin.DotToSvgExportPlugin();
const saveSvgAsSvg = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: "./svg",
  dataKey: "svg",
  extension: ".svg"
});
const saveSvgAsPdf = new _SvgToPdfExportPlugin.SvgToPdfExportPlugin();

const saveAsDot = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: "./dot",
  dataKey: "dot",
  extension: ".dot"
});
const saveAsJSON = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: "./json",
  dataKey: "json",
  extension: ".json"
});
const saveAsArgdown = new _SaveAsFilePlugin.SaveAsFilePlugin({
  outputDir: "./compiled",
  dataKey: "input",
  extension: ".argdown",
  isRequestData: true
});
const stdoutDot = new _StdOutPlugin.StdOutPlugin({ dataKey: "dot" });
const stdoutSvg = new _StdOutPlugin.StdOutPlugin({ dataKey: "svg" });
const stdoutJSON = new _StdOutPlugin.StdOutPlugin({ dataKey: "json" });
const stdoutHtml = new _StdOutPlugin.StdOutPlugin({ dataKey: "html" });
const stdoutArgdown = new _StdOutPlugin.StdOutPlugin({
  dataKey: "input",
  isRequestData: true
});

app.addPlugin(includePlugin, "preprocessor");
app.addPlugin(parserPlugin, "parse-input");
app.addPlugin(logParserErrorsPlugin, "log-parser-errors");
app.addPlugin(modelPlugin, "build-model");
app.addPlugin(tagPlugin, "build-model");

app.addPlugin(stdoutArgdown, "stdout-argdown");
app.addPlugin(saveAsArgdown, "save-as-argdown");

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
app.addPlugin(dotToSvgExport, "export-svg");
app.addPlugin(saveSvgAsSvg, "save-svg-as-svg");
app.addPlugin(stdoutSvg, "stdout-svg");
app.addPlugin(saveSvgAsPdf, "save-svg-as-pdf");

app.load = async function (config) {
  const request = _.defaults({}, config);
  const inputGlob = request.inputPath || "./*.argdown";
  const ignoreFiles = request.ignore || ["**/_*", // Exclude files starting with '_'.
  "**/_*/**" // Exclude entire directories starting with '_'.
  ];

  if (request.logger && _.isFunction(request.logger.log) && _.isFunction(request.logger.setLevel)) {
    if (!app.defaultLogger) {
      app.defaultLogger = app.logger;
    }
    app.logger = request.logger;
  } else if (app.defaultLogger) {
    app.logger = app.defaultLogger;
  }

  if (!request.rootPath) {
    request.rootPath = process.cwd();
  }
  if (request.logLevel) {
    app.logger.setLevel(request.logLevel);
  }
  if (request.plugins) {
    for (let pluginData of request.plugins) {
      if (_.isObject(pluginData.plugin) && _.isString(pluginData.processor)) {
        app.addPlugin(pluginData.plugin, pluginData.processor);
      }
    }
  }
  if (request.input && !request.inputPath) {
    await app.runAsync(_.clone(request));
    return;
  }

  const $ = this;
  let absoluteInputGlob = path.resolve(request.rootPath, inputGlob);
  const loadOptions = {};
  if (ignoreFiles) {
    loadOptions.ignore = ignoreFiles;
  }
  if (request.watch) {
    const watcher = chokidar.watch(absoluteInputGlob, loadOptions);
    const watcherRequest = _.cloneDeep(request);
    watcherRequest.watch = false;

    watcher.on("add", path => {
      app.logger.log("verbose", `File ${path} has been added.`);
      watcherRequest.inputPath = path;
      $.load(loadOptions);
    }).on("change", path => {
      app.logger.log("verbose", `File ${path} has been changed.`);
      watcherRequest.inputPath = path;
      $.load(loadOptions);
    }).on("unlink", path => {
      app.logger.log("verbose", `File ${path} has been removed.`);
    });
  } else {
    let files = await new Promise((resolve, reject) => {
      glob(absoluteInputGlob, loadOptions, function (er, files) {
        if (er) {
          reject(er);
        }
        resolve(files);
      });
    });
    const promises = [];
    for (let file of files) {
      app.logger.log("verbose", "Reading file: " + file);
      promises.push(readFile(file, "utf8").then(input => {
        app.logger.log("verbose", "Reading file completed, starting processing: " + file);
        const requestForFile = _.clone(request);
        requestForFile.input = input;
        requestForFile.inputPath = file;
        return $.runAsync(requestForFile);
      }));
    }
    return await Promise.all(promises);
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
  let absoluteFilePath = path.resolve(process.cwd(), filePath);
  try {
    return requireUncached(absoluteFilePath);
  } catch (e) {
    e.message = `Cannot read file: ${absoluteFilePath}\nError: ${e.message}`;
    throw e;
  }
};

app.loadConfig = function (filePath) {
  filePath = filePath || "./argdown.config.js";
  let config = {};
  try {
    let jsModuleExports = this.loadJSFile(filePath);
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

exports.AsyncArgdownApplication = _AsyncArgdownApplication.AsyncArgdownApplication;
exports.app = app;
exports.CopyDefaultCssPlugin = _CopyDefaultCssPlugin.CopyDefaultCssPlugin;
exports.SaveAsFilePlugin = _SaveAsFilePlugin.SaveAsFilePlugin;
exports.SvgToPdfExportPlugin = _SvgToPdfExportPlugin.SvgToPdfExportPlugin;
exports.LogParserErrorsPlugin = _LogParserErrorsPlugin.LogParserErrorsPlugin;
exports.DotToSvgExportPlugin = _DotToSvgExportPlugin.DotToSvgExportPlugin;
exports.utils = _argdownParser.utils;
//# sourceMappingURL=index.js.map