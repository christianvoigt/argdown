let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
import defaultsDeep from "lodash.defaultsdeep";

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
    this.defaults = defaultsDeep({}, config, {
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
    defaultsDeep(settings, this.defaults);
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
      "@argdown/core/dist/plugins/argdown.css"
    );
    logger.log(
      "verbose",
      "Copying default argdown.css to folder: " + absoluteOutputDir
    );
    const { COPYFILE_EXCL } = fs.constants;
    try{
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
    }catch(error){
      if (error.code !== 'EEXIST') {
        throw error;
      }else{
        logger.log(
          "verbose",
          "Did not copy default argdown.css, because file already exists: " + absoluteOutputDir
        );    
      }
    }
  };
}
