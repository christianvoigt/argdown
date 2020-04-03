let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
import * as _ from "lodash";
import { IArgdownRequest, IRequestHandler } from "@argdown/core";
import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";

export interface ICopyDefaultCssSettings {
  outputDir?: string;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    /**
     * Settings of the [[CopyDefaultCssPlugin]]
     */
    copyDefaultCss?: ICopyDefaultCssSettings;
  }
}
export class CopyDefaultCssPlugin implements IAsyncArgdownPlugin {
  name = "CopyDefaultCssPlugin";
  defaults?: ICopyDefaultCssSettings;
  constructor(config?: ICopyDefaultCssSettings) {
    this.defaults = _.defaultsDeep({}, config, {
      outputDir: "./html"
    });
  }
  getSettings = (request: IArgdownRequest): ICopyDefaultCssSettings => {
    if (!request.copyDefaultCss) {
      request.copyDefaultCss = {};
    }
    return request.copyDefaultCss;
  };
  prepare: IRequestHandler = request => {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
    if (request.html && request.html.outputDir) {
      settings.outputDir = request.html.outputDir;
    } else if (request.saveAs && request.saveAs.outputDir) {
      settings.outputDir = request.saveAs.outputDir;
    }
  };
  runAsync: IAsyncRequestHandler = async (request, _response, logger) => {
    const settings = this.getSettings(request);
    let rootPath = request.rootPath || process.cwd();
    let outputDir = request.outputPath
      ? path.dirname(request.outputPath)
      : settings.outputDir;
    let absoluteOutputDir = path.resolve(rootPath, outputDir);
    await mkdirp(absoluteOutputDir);
    let pathToDefaultCssFile = require.resolve(
      "@argdown/core/dist/src/plugins/argdown.css"
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
        (err: Error) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  };
}
