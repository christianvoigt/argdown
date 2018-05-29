"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SvgToPdfExportPlugin = undefined;

var _svgToPdfkit = require("svg-to-pdfkit");

var _svgToPdfkit2 = _interopRequireDefault(_svgToPdfkit);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We have to use a local file and let babel ignore it, until pdfkit is ported to ES6
var PDFDocument = require("../pdfkit.js");
var fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
class SvgToPdfExportPlugin {
  constructor(config) {
    this.name = "SvgToPdfExportPlugin";
    this.defaults = _.defaultsDeep({}, config, {
      outputDir: "./pdf",
      format: "svg"
    });
  }
  getSettings(request) {
    if (request.svgToPdf) {
      return request.svgToPdf;
    } else if (request.SvgToPdfExportPlugin) {
      return request.SvgToPdfExportPlugin;
    } else {
      request.svgToPdf = {};
      return request.svgToPdf;
    }
  }
  prepare(request) {
    _.defaults(this.getSettings(request), this.defaults);
  }
  async runAsync(request, response) {
    if (!response.svg) {
      return response;
    }
    const settings = this.getSettings(request);
    let fileName = "default";
    let outputDir = settings.outputDir;
    if (request.outputPath) {
      filename = this.getFileName(request.outputPath);
      outputDir = path.dirname(request.outputPath);
    } else if (request.pdf && request.pdf.outputPath) {
      filename = this.getFileName(request.pdf.outputPath);
      outputDir = path.dirname(request.pdf.outputPath);
    } else if (_.isFunction(settings.fileName)) {
      fileName = settings.fileName.call(this, request, response);
    } else if (_.isString(settings.fileName)) {
      fileName = settings.fileName;
    } else if (request.inputPath) {
      fileName = this.getFileName(request.inputPath);
    }
    const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
    const filePath = absoluteOutputDir + "/" + fileName + ".pdf";
    await new Promise((resolve, reject) => {
      mkdirp(absoluteOutputDir, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
    var doc = new PDFDocument(settings);
    (0, _svgToPdfkit2.default)(doc, response.svg, 0, 0, settings);
    await this.savePdfToFile(doc, filePath);
    return response;
  }
  // https://github.com/devongovett/pdfkit/issues/265
  async savePdfToFile(pdf, fileName) {
    return new Promise(resolve => {
      // To determine when the PDF has finished being written successfully
      // we need to confirm the following 2 conditions:
      //
      //   1. The write stream has been closed
      //   2. PDFDocument.end() was called syncronously without an error being thrown

      let pendingStepCount = 2;

      const stepFinished = () => {
        if (--pendingStepCount == 0) {
          resolve();
        }
      };

      const writeStream = fs.createWriteStream(fileName);
      writeStream.on("close", stepFinished);
      pdf.pipe(writeStream);

      pdf.end();

      stepFinished();
    });
  }
  getFileName(file) {
    let extension = path.extname(file);
    return path.basename(file, extension);
  }
}
exports.SvgToPdfExportPlugin = SvgToPdfExportPlugin;
//# sourceMappingURL=SvgToPdfExportPlugin.js.map