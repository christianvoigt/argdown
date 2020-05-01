"use strict";
import {
  cloneDeep,
  isArray,
  isString,
  isEmpty,
  isFunction,
  defaultsDeep,
  isObject
} from "lodash";
import {
  ArgdownApplication,
  IArgdownRequest,
  IArgdownResponse,
  ArgdownPluginError
} from "@argdown/core";
import { isAsyncPlugin } from "./IAsyncArgdownPlugin";
import path from "path";
import chokidar from "chokidar";
import glob from "glob";
import { promisify } from "util";
import importFresh from "import-fresh";
import { readFile } from "fs";

const readFileAsync = promisify(readFile);

export class AsyncArgdownApplication extends ArgdownApplication {
  async runAsync(
    request: IArgdownRequest,
    response?: IArgdownResponse
  ): Promise<IArgdownResponse> {
    let processorsToRun: string[] = [];
    this.logger.setLevel("error");
    let resp: IArgdownResponse = response || {};
    let req = request;

    if (req) {
      if (req.logLevel) {
        this.logger.setLevel(req.logLevel);
      }
      if (req.process) {
        if (isArray(req.process)) {
          processorsToRun = req.process;
        } else if (
          isString(req.process) &&
          req.processes &&
          req.processes[req.process]
        ) {
          const processObj = req.processes[req.process];
          req = defaultsDeep({}, processObj, req);
          if (isString(req.process)) {
            processorsToRun = this.defaultProcesses[req.process];
          } else if (req.process && req.process.constructor === Array) {
            processorsToRun = <string[]>req.process;
          }
        } else if (isString(req.process)) {
          processorsToRun = this.defaultProcesses[req.process];
        }
      }
    }

    if (isEmpty(processorsToRun)) {
      this.logger.log(
        "error",
        "[AsyncArgdownApplication]: No processors to run."
      );
      return resp;
    }
    const exceptions: Error[] = [];
    resp.exceptions = exceptions;

    for (let processorId of processorsToRun) {
      let cancelProcessor = false;
      let processor = this.processors[processorId];
      if (!processor) {
        this.logger.log(
          "error",
          "[AsyncArgdownApplication]: Processor not found: " + processorId
        );
        continue;
      }
      this.logger.log(
        "verbose",
        "[AsyncArgdownApplication]: Running processor: " + processorId
      );

      for (let plugin of processor.plugins) {
        if (isFunction(plugin.prepare)) {
          this.logger.log(
            "verbose",
            "[AsyncArgdownApplication]: Preparing plugin: " + plugin.name
          );
          try {
            plugin.prepare(req, resp, this.logger);
          } catch (e) {
            if (req.throwExceptions) {
              throw e;
            } else {
              e.processor = processorId;
              exceptions.push(e);
              cancelProcessor = true;
              this.logger.log("warning", `Processor ${processorId} canceled.`);
              break;
            }
          }
        }
      }
      if (cancelProcessor) {
        break;
      }

      if (resp.ast && processor.walker) {
        try {
          processor.walker.walk(req, resp, this.logger);
        } catch (e) {
          if (req.throwExceptions) {
            throw e;
          } else {
            e.processor = processorId;
            exceptions.push(e);
            this.logger.log(
              "warning",
              `[ArgdownApplication]: Processor ${processorId} canceled.`
            );
            break;
          }
        }
      }

      for (let plugin of processor.plugins) {
        this.logger.log(
          "verbose",
          "[AsyncArgdownApplication]: Running plugin: " + plugin.name
        );
        try {
          if (isAsyncPlugin(plugin)) {
            await plugin.runAsync(req, resp, this.logger);
          } else if (isFunction(plugin.run)) {
            plugin.run(req, resp, this.logger);
          }
        } catch (e) {
          if (req.throwExceptions) {
            throw e;
          } else {
            e.processor = processorId;
            this.logger.log("warning", `Processor ${processorId} canceled.`);
            exceptions.push(e);
            break;
          }
        }
      }
    }
    if (req.logExceptions === undefined || req.logExceptions) {
      for (let exception of exceptions) {
        let msg = exception.stack || exception.message;
        if (exception instanceof ArgdownPluginError) {
          msg = `[${exception.processor}/${exception.plugin}]: ${msg}`;
        }
        this.logger.log("error", msg);
      }
    }
    return resp;
  }
  load = async (
    request: IArgdownRequest
  ): Promise<IArgdownResponse[] | undefined> => {
    const processObj =
      request.processes && isString(request.process)
        ? request.processes[request.process]
        : undefined;
    let req = request;
    if (processObj) {
      req = defaultsDeep({}, processObj, req);
    }
    let inputGlob = req.inputPath || "./*.argdown";
    const ignoreFiles = req.ignore || [
      "**/_*", // Exclude files starting with '_'.
      "**/_*/**" // Exclude entire directories starting with '_'.
    ];

    if (
      req.logger &&
      isFunction(req.logger.log) &&
      isFunction(req.logger.setLevel)
    ) {
      if (!this.defaultLogger) {
        this.defaultLogger = this.logger;
      }
      this.logger = req.logger;
    } else if (this.defaultLogger) {
      this.logger = this.defaultLogger;
    }

    if (!req.rootPath) {
      req.rootPath = process.cwd();
    }
    if (req.logLevel) {
      this.logger.setLevel(req.logLevel);
    }
    if (req.plugins) {
      for (let pluginData of req.plugins) {
        if (isObject(pluginData.plugin) && isString(pluginData.processor)) {
          this.addPlugin(pluginData.plugin, pluginData.processor);
        }
      }
    }
    if (req.input && !req.inputPath) {
      await this.runAsync(cloneDeep(request));
      return;
    }

    const $ = this;
    let absoluteInputGlob = path.resolve(req.rootPath, inputGlob);
    const loadOptions: chokidar.WatchOptions = {};
    if (ignoreFiles) {
      // error in WatchOptions type declaration: option is called "ignore", not "ignored":
      (<any>loadOptions).ignore = ignoreFiles;
    }
    if (req.watch) {
      const watcher = chokidar.watch(absoluteInputGlob, loadOptions);
      const watcherRequest = cloneDeep(req);
      watcherRequest.watch = false;

      watcher
        .on("add", path => {
          this.logger.log("verbose", `File ${path} has been added.`);
          watcherRequest.inputPath = path;
          $.load(watcherRequest);
        })
        .on("change", path => {
          this.logger.log("verbose", `File ${path} has been changed.`);
          watcherRequest.inputPath = path;
          $.load(watcherRequest);
        })
        .on("unlink", path => {
          this.logger.log("verbose", `File ${path} has been removed.`);
        });
    } else {
      let files: string[] = await new Promise<string[]>((resolve, reject) => {
        glob(
          absoluteInputGlob,
          loadOptions,
          (er: Error | null, files: string[]) => {
            if (er) {
              reject(er);
            }
            resolve(files);
          }
        );
      });
      const promises = [];
      for (let file of files) {
        const requestForFile = cloneDeep(request);
        requestForFile.inputPath = file;
        promises.push(this.runAsync(requestForFile));
      }
      // Remove plugins added by request
      if (req.plugins) {
        for (let pluginData of req.plugins) {
          this.removePlugin(pluginData.plugin, pluginData.processor);
        }
      }
      return await Promise.all(promises);
    }
    return;
  };
  loadConfig = async (filePath?: string): Promise<IArgdownRequest> => {
    let config: IArgdownRequest = {};
    filePath = filePath || "./argdown.config.json"; // json is default because it can be loaded asynchronously
    filePath = path.resolve(process.cwd(), filePath);
    const extension = path.extname(filePath);
    // We use non-blocking IO for JSON config files
    if (extension === ".json") {
      try {
        const buffer = await readFileAsync(filePath, "utf8");
        config = JSON.parse(buffer);
      } catch (e) {
        this.logger.log(
          "verbose",
          "[AsyncArgdownApplication]: No config found: " + e.toString()
        );
      }
    } else if (extension === ".js") {
      // For Js config files we have to use loadJSFile which is synchronous
      try {
        let jsModuleExports = loadJSFile(filePath);
        if (jsModuleExports.config) {
          config = jsModuleExports.config;
        } else {
          // let's try the default export
          config = jsModuleExports;
        }
      } catch (e) {
        this.logger.log(
          "verbose",
          "[AsyncArgdownApplication]: No config found: " + e.toString()
        );
      }
    }
    return config;
  };
}
/**
 * Taken from eslint: https://github.com/eslint/eslint/blob/master/lib/config/config-file.js
 * Loads a JavaScript configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
const loadJSFile = (filePath: string) => {
  let absoluteFilePath = path.resolve(process.cwd(), filePath);
  try {
    return importFresh(absoluteFilePath);
  } catch (e) {
    e.message = `Cannot read file: ${absoluteFilePath}\nError: ${e.message}`;
    throw e;
  }
};
