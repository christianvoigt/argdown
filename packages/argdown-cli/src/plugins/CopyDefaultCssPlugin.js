let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
import * as _ from "lodash";

class CopyDefaultCssPlugin {
  constructor(config) {
    this.name = "CopyDefaultCssPlugin";
    this.defaults = _.defaultsDeep({}, config, {
      outputDir: "./html"
    });
  }
  getSettings(request) {
    if (!request.copyDefaultCss) {
      request.copyDefaultCss = {};
    }
    return request.copyDefaultCss;
  }
  prepare(request) {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
    if (request.html && request.html.outputDir) {
      settings.outputDir = request.html.outputDir;
    } else if (request.saveAs && request.saveAs.outputDir) {
      settings.outputDir = request.saveAs.outputDir;
    }
  }
  async runAsync(request, response, logger) {
    const settings = this.getSettings(request);
    let rootPath = request.rootPath || process.cwd();
    let outputDir = request.outputPath
      ? path.dirname(request.outputPath)
      : settings.outputDir;
    let absoluteOutputDir = path.resolve(rootPath, outputDir);
    await new Promise((resolve, reject) => {
      mkdirp(absoluteOutputDir, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
    let pathToDefaultCssFile = require.resolve(
      "argdown-parser/lib/src/plugins/argdown.css"
    );
    logger.log(
      "verbose",
      "Copying default argdown.css to folder: " + absoluteOutputDir
    );
    const { COPYFILE_EXCL } = fs.constants;
    await new Promise((resolve, reject) => {
      fs.copyFile(
        pathToDefaultCssFile,
        path.resolve(absoluteOutputDir, "argdown.css"),
        COPYFILE_EXCL,
        err => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  }
}
module.exports = {
  CopyDefaultCssPlugin: CopyDefaultCssPlugin
};
