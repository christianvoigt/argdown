let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
import * as _ from "lodash";
import {
  IArgdownRequest,
  IArgdownResponse,
  IArgdownLogger,
  ArgdownPluginError
} from "@argdown/core";
import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";

export interface IFileNameProvider {
  (
    settings: ISaveAsSettings,
    request: IArgdownRequest,
    response: IArgdownResponse
  ): string;
}
export interface ISaveAsSettings {
  dataKey?: string;
  extension?: string;
  outputDir?: string;
  isRequestData?: boolean;
  fileName?: string | IFileNameProvider;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    saveAs?: ISaveAsSettings;
  }
}
export class SaveAsFilePlugin implements IAsyncArgdownPlugin {
  name = "SaveAsFilePlugin";
  defaults: ISaveAsSettings;
  constructor(config: ISaveAsSettings) {
    this.defaults = _.defaultsDeep({}, config, {
      dataKey: "test",
      extension: ".txt",
      outputDir: "./output"
    });
  }
  // there can be several instances of this plugin in the same ArgdownApplication
  // Because of this, we can not add the instance default settings to the request object as in other plugins
  // Instead we have to add it each time the getSettings method is called to avoid keeping request specific state
  getSettings(request: IArgdownRequest): ISaveAsSettings {
    let settings = request.saveAs || {};
    settings = _.defaultsDeep({}, settings, this.defaults);
    return settings;
  }
  runAsync: IAsyncRequestHandler = async (request, response, logger) => {
    const settings = this.getSettings(request);
    if (!settings.dataKey) {
      throw new ArgdownPluginError(this.name, "No data key.");
    }
    let fileContent: string | undefined = !settings.isRequestData
      ? (<any>response)[settings.dataKey!]
      : (<any>request)[settings.dataKey!];
    if (fileContent === undefined) {
      throw new ArgdownPluginError(this.name, "No content to save.");
    }
    if (!_.isString(fileContent)) {
      throw new ArgdownPluginError(this.name, "Content is not a string.");
    }
    if (_.isEmpty(fileContent)) {
      throw new ArgdownPluginError(this.name, "Data field is empty string.");
    }
    const dataSettings =
      !settings.isRequestData && settings.dataKey
        ? (<any>request)[settings.dataKey]
        : null;
    let fileName = "default";
    let outputDir = settings.outputDir;
    if (request.outputPath) {
      fileName = this.getFileName(request.outputPath);
      outputDir = path.dirname(request.outputPath);
    } else if (dataSettings && dataSettings.outputDir) {
      fileName = this.getFileName(dataSettings.outputDir);
      outputDir = path.dirname(dataSettings.outputDir);
    } else if (_.isFunction(settings.fileName)) {
      fileName = settings.fileName.call(settings, request, response);
    } else if (_.isString(settings.fileName)) {
      fileName = settings.fileName;
    } else if (request.inputPath) {
      fileName = this.getFileName(request.inputPath);
    }
    if (dataSettings && dataSettings.outputDir) {
      outputDir = dataSettings.outputDir;
    }
    if (outputDir && settings.extension) {
      await this.saveAsFile(
        fileContent,
        outputDir,
        fileName,
        settings.extension,
        logger
      );
    }
  };
  getFileName(file: string): string {
    let extension = path.extname(file);
    return path.basename(file, extension);
  }
  async saveAsFile(
    data: string,
    outputDir: string,
    fileName: string,
    extension: string,
    logger: IArgdownLogger
  ) {
    let absoluteOutputDir = path.resolve(process.cwd(), outputDir);
    await new Promise((resolve, reject) => {
      mkdirp(absoluteOutputDir, function(err: Error) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
    await new Promise((resolve, reject) => {
      fs.writeFile(
        absoluteOutputDir + "/" + fileName + extension,
        data,
        function(err: Error) {
          if (err) {
            reject(err);
          }
          logger.log(
            "verbose",
            "Saved " + absoluteOutputDir + "/" + fileName + extension
          );
          resolve();
        }
      );
    });
  }
}
