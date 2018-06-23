import { ArgdownPluginError } from "./ArgdownPluginError";

"use strict";

import { ArgdownTreeWalker } from "./ArgdownTreeWalker";
import * as _ from "lodash";
import { IArgdownLogger } from "./IArgdownLogger";
import { IArgdownPlugin } from "./IArgdownPlugin";
import { Logger } from "./Logger";
import { IArgdownRequest, IArgdownResponse } from "./index";

/**
 * A processor is a "working step" in a process, containing a group of plugins
 */
export interface IArgdownProcessor {
  plugins: IArgdownPlugin[];
  /**
   * The tree walker will only be added if any plugins of this processor define tokenListeners or ruleListeners.
   */
  walker: ArgdownTreeWalker | null;
}

/**
 * An ArgdownApplication chains together a collection of plugins, passing a request and response object between them.
 * Each plugin uses configuration settings from the provided request object to produce or transform data saved in the provided response object.
 * Without any plugins the ArgdownApplication will do nothing. Even the parsing and lexing of Argdown input is accomplished by the [[ParserPlugin]].
 *
 * Plugins are grouped into processors that will be executed after one another each time the [[run]] method is called.
 * Which processors are executed in a run is determined by the request.process list.
 *
 * For each processor ArgdownApplication will try to execute plugin methods in the following order:
 *
 *  - any [[IArgdownPlugin.prepare]] methods: these methods can be used to add plugin default settings to the request
 *    and to check that all required data is present in the response object.
 *  - any event listeners defined in [[IArgdownPlugin.tokenListeners]] and [[IArgdownPlugin.ruleListeners]]. If any plugin in a processor
 *    defines such listeners, an ArgdownTreeWalker will be added to this processor which will visit all nodes in the abstract syntax tree (response.ast).
 *  - any [[IArgdownPlugin.run]] methods: these methods should be used to transform response data not contained within response.ast.
 *
 * All plugin methods called by ArgdownApplication receive a request, response and logger object as parameters.
 * In each of the three rounds the plugins are called in the order they were added to the processor.
 *
 * Most runs will first have to call the ParserPlugin, DataPlugin, ModelPlugin and TagPlugin to add
 * the basic Argdown data to the response object. This includes:
 *
 *  - the AST
 *  - metaData contained in the front matter
 *  - statements and arguments dictionaries
 *  - the relations list
 *  - tag list and tagDictionary
 *  - the sections tree
 *  - metaData of arguments, statements and headings
 *
 * Plugins are expected at the beginning of their prepare method to check for any missing required data in the response object.
 * If required properties are missing, the plugin should throw an [[ArgdownPluginError]].
 * Throwing an error in any of the plugin methods called by ArgdownApplication
 * will cancel the run of the current processor and skip to the next processor.
 * All errors  will be caught, collected and optionally logged by the ArgdownApplication.
 *
 * Plugins should not keep any local mutable state. Instead they should use the request object for configuration
 * and the response object for returning produced or transformed data. The only obvious exceptions are I/O plugins,
 * for example export plugins that save the exported data as new files.
 *
 * The `@argdown/cli` package provides a subclass called `AsyncArgdownApplication` which adds a `AsyncArgdownApplication.runAsync` method to this class.
 * This can be used to support Promises and async/await in I/O operations.
 * The app.runAsync method works exactly like the app.run method
 * except that it tries to call `await plugin.runAsyc(...);` before calling any `plugin.run(...);` methods.
 *
 * @example
 * ```typescript
 *
 * import {ArgdownApplication, IArgdownRequest, IHtmlResponse, ParserPlugin, ModelPlugin, TagPlugin, HtmlExportPlugin} from "@argdown/core";
 *
 * const app = new ArgdownApplication();
 *
 * const parserPlugin = new ParserPlugin();
 * app.addPlugin(parserPlugin, "parse-input");
 *
 * const modelPlugin = new ModelPlugin();
 * app.addPlugin(modelPlugin, "build-model");
 *
 * const tagPlugin = new TagPlugin();
 * app.addPlugin(tagPlugin, "build-model");
 *
 * const htmlExportPlugin = new HtmlExportPlugin();
 * app.addPlugin(htmlExportPlugin, "export-html");
 *
 * const input = `
 * # My first Argdown document
 *
 * [S1]: a statement
 *    - [A1]: an argument
 * `;
 * const request:IArgdownRequest = {
 *  input,
 *  process: ["parse-input", "build-model", "export-html"],
 *  logLevel: "verbose"
 * }
 * const response:IHtmlResponse = app.run(request);
 * console.log(response.html);
 * ```
 */
export class ArgdownApplication {
  processors: { [name: string]: IArgdownProcessor } = {};
  logger: IArgdownLogger;
  defaultLogger: IArgdownLogger = new Logger();
  /**
   *
   * @param logger optional parameter to provide a logger different from the default one
   */
  constructor(logger?: IArgdownLogger) {
    this.processors = {};
    if (logger && _.isFunction(logger.log) && _.isFunction(logger.setLevel)) {
      this.logger = logger;
    } else {
      this.logger = this.defaultLogger;
      this.logger.setLevel("error");
    }
  }
  /**
   * Adds a plugin to the application.
   * Registers any tokenListeners or ruleListeners with the ArgdownTreeWalker event emitter.
   *
   * @param plugin
   * @param processorId if processorId is undefined, the plugin will be added to the "default" processor
   */
  addPlugin(plugin: IArgdownPlugin, processorId?: string) {
    if (!processorId) {
      processorId = "default";
    }

    let processor = this.processors[processorId];
    if (!processor) {
      processor = { plugins: [], walker: null };
      this.processors[processorId] = processor;
    }

    processor.plugins.push(plugin);
    if (plugin.tokenListeners || plugin.ruleListeners) {
      if (!processor.walker) {
        processor.walker = new ArgdownTreeWalker();
      }
      if (plugin.tokenListeners) {
        for (let key of Object.keys(plugin.tokenListeners)) {
          processor.walker.addListener(key, plugin.tokenListeners[key]);
        }
      }
      if (plugin.ruleListeners) {
        for (let key of Object.keys(plugin.ruleListeners)) {
          processor.walker.addListener(key, plugin.ruleListeners[key]);
        }
      }
    }
  }
  /**
   * Removes a plugin from the application.
   * Removes all tokenListeners and ruleListeners from the ArgdownTreeWalker event emitter.
   * @param plugin
   * @param processorId
   */
  removePlugin(plugin: IArgdownPlugin, processorId: string) {
    if (!processorId) {
      processorId = "default";
    }

    let processor = this.processors[processorId];
    if (!processor) {
      return;
    }

    let index = processor.plugins.indexOf(plugin);
    if (index > -1) {
      if (plugin.tokenListeners && processor.walker) {
        for (let key of Object.keys(plugin.tokenListeners)) {
          processor.walker.removeListener(key, plugin.tokenListeners[key]);
        }
      }
      if (plugin.ruleListeners && processor.walker) {
        for (let key of Object.keys(plugin.ruleListeners)) {
          processor.walker.removeListener(key, plugin.ruleListeners[key]);
        }
      }
      processor.plugins.splice(index, 1);
    }
  }
  /**
   * Get the plugin list of a processor.
   * Careful, this is not a copy!
   *
   * @param processorId
   */
  getPlugins(processorId: string): IArgdownPlugin[] | null {
    if (!processorId) {
      processorId = "default";
    }
    let processor = this.processors[processorId];
    if (processor) return processor.plugins;
    else {
      return null;
    }
  }
  /**
   * Get a plugin that is already part of a processor
   * @param name
   * @param processorId
   */
  getPlugin(name: string, processorId: string): IArgdownPlugin | null {
    let plugins = this.getPlugins(processorId);
    if (plugins) {
      for (let plugin of plugins) {
        if (plugin.name == name) {
          return plugin;
        }
      }
    }
    return null;
  }
  /**
   * Remove a processor and all its plugins from an application.
   * @param processorId
   */
  removeProcessor(processorId: string): void {
    let processor = this.processors[processorId];
    if (!processor) {
      return;
    }
    for (let plugin of processor.plugins) {
      this.removePlugin(plugin, processorId);
    }
    delete this.processors[processorId];
  }
  /**
   * Execute a chain of processors
   * @param request Use request.process to define the list of processors to run. Use request.input to add ArgdownSourceCode to be processed.
   * @param response Can be optionally used to start with a response from a previous run.
   * Use this if you want to avoid to run processors again that have already done their work.
   * @returns the transformed response object after all plugins have added their data.
   */
  run(request: IArgdownRequest, response?: IArgdownResponse): IArgdownResponse {
    let process: string[] = [];
    this.logger.setLevel("error");
    let resp: IArgdownResponse = response || <IArgdownResponse>{};

    if (request) {
      if (request.logLevel) {
        this.logger.setLevel(request.logLevel);
      }
      if (request.process) {
        if (_.isArray(request.process)) {
          process = request.process;
        } else if (_.isString(request.process) && request.processes) {
          process = request.processes[request.process];
        }
      }
    }

    if (_.isEmpty(process)) {
      this.logger.log("error", "[ArgdownApplication]: No processors to run.");
      return resp;
    }
    const exceptions: Error[] = [];
    resp.exceptions = exceptions;

    for (let processorId of process) {
      let cancelProcessor = false;
      let processor = this.processors[processorId];
      if (!processor) {
        this.logger.log("error", "[ArgdownApplication]: Processor not found: " + processorId);
        continue;
      }
      this.logger.log("verbose", "[ArgdownApplication]: Running processor: " + processorId);

      for (let plugin of processor.plugins) {
        if (_.isFunction(plugin.prepare)) {
          this.logger.log("verbose", "[ArgdownApplication]: Preparing plugin: " + plugin.name);
          try {
            plugin.prepare(request, resp, this.logger);
          } catch (e) {
            e.processor = processorId;
            exceptions.push(e);
            cancelProcessor = true;
            this.logger.log("warning", `[ArgdownApplication]: Processor ${processorId} canceled.`);
            break;
          }
        }
      }
      if (cancelProcessor) {
        break;
      }

      if (resp.ast && processor.walker) {
        try {
          processor.walker.walk(request, resp, this.logger);
        } catch (e) {
          e.processor = processorId;
          exceptions.push(e);
          this.logger.log("warning", `[ArgdownApplication]: Processor ${processorId} canceled.`);
          break;
        }
      }

      for (let plugin of processor.plugins) {
        this.logger.log("verbose", "[ArgdownApplication]: Running plugin: " + plugin.name);
        if (_.isFunction(plugin.run)) {
          try {
            plugin.run(request, resp, this.logger);
          } catch (e) {
            e.processor = processorId;
            this.logger.log("warning", `Processor ${processorId} canceled.`);
            exceptions.push(e);
            break;
          }
        }
      }
    }
    if (request.logExceptions === undefined || request.logExceptions) {
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
}
