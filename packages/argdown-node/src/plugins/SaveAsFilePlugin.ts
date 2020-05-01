let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
import defaultsDeep from "lodash.defaultsdeep";
import isString from "lodash.isstring";
import isEmpty from "lodash.isempty";
import isFunction from "lodash.isfunction";
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
    this.defaults = defaultsDeep({}, config, {
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
    settings = defaultsDeep({}, settings, this.defaults);
    return settings;
  }
  runAsync: IAsyncRequestHandler = async (request, response, logger) => {
    const settings = this.getSettings(request);
    if (!settings.dataKey) {
      throw new ArgdownPluginError(
        this.name,
        "missing-dataKey-setting",
        "No data key."
      );
    }
    let fileContent: string | undefined = !settings.isRequestData
      ? (<any>response)[settings.dataKey!]
      : (<any>request)[settings.dataKey!];
    if (fileContent === undefined) {
      throw new ArgdownPluginError(
        this.name,
        "missing-content",
        "No content to save."
      );
    }
    if (!isString(fileContent)) {
      throw new ArgdownPluginError(
        this.name,
        "invalid-content",
        "Content is not a string."
      );
    }
    if (isEmpty(fileContent)) {
      throw new ArgdownPluginError(
        this.name,
        "missing-content",
        "Data field is empty string."
      );
    }
    const dataSettings =
      !settings.isRequestData && settings.dataKey
        ? (<any>request)[settings.dataKey]
        : null;
    let fileName = "default";
    let outputDir = settings.outputDir;
    if (request.outputPath) {
      outputDir = path.dirname(request.outputPath);
    } else if (dataSettings && dataSettings.outputDir) {
      outputDir = path.dirname(dataSettings.outputDir);
    }
    if (request.outputPath) {
      fileName = this.getFileName(request.outputPath);
    } else if (isFunction(settings.fileName)) {
      fileName = settings.fileName.call(this, settings, request, response);
    } else if (isString(settings.fileName)) {
      fileName = settings.fileName;
    } else if (request.inputPath) {
      fileName = this.getFileName(request.inputPath);
    }
    if (request.outputSuffix) {
      fileName = fileName + request.outputSuffix;
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
    await mkdirp(absoluteOutputDir);
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
