import { ArgdownTreeWalker } from "./ArgdownTreeWalker";
import { IArgdownLogger } from "./IArgdownLogger";
import { IArgdownPlugin } from "./IArgdownPlugin";
import { IArgdownRequest } from "./IArgdownRequest";
import { IArgdownResponse } from "./IArgdownResponse";
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
 * Most runs will first have to call the ParserPlugin, MetaDataPlugin, ModelPlugin and TagPlugin to add
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
 * import {ArgdownApplication, IArgdownRequest, IHtmlResponse, ParserPlugin, ModelPlugin, TagPlugin, HtmlExportPlugin} from "@argdown/parser";
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
export declare class ArgdownApplication {
    processors: {
        [name: string]: IArgdownProcessor;
    };
    logger: IArgdownLogger;
    /**
     *
     * @param logger optional parameter to provide a logger different from the default one
     */
    constructor(logger?: IArgdownLogger);
    /**
     * Adds a plugin to the application.
     * Registers any tokenListeners or ruleListeners with the ArgdownTreeWalker event emitter.
     *
     * @param plugin
     * @param processorId if processorId is undefined, the plugin will be added to the "default" processor
     */
    addPlugin(plugin: IArgdownPlugin, processorId?: string): void;
    /**
     * Removes a plugin from the application.
     * Removes all tokenListeners and ruleListeners from the ArgdownTreeWalker event emitter.
     * @param plugin
     * @param processorId
     */
    removePlugin(plugin: IArgdownPlugin, processorId: string): void;
    /**
     * Get the plugin list of a processor.
     * Careful, this is not a copy!
     *
     * @param processorId
     */
    getPlugins(processorId: string): IArgdownPlugin[] | null;
    /**
     * Get a plugin that is already part of a processor
     * @param name
     * @param processorId
     */
    getPlugin(name: string, processorId: string): IArgdownPlugin | null;
    /**
     * Remove a processor and all its plugins from an application.
     * @param processorId
     */
    removeProcessor(processorId: string): void;
    /**
     * Execute a chain of processors
     * @param request Use request.process to define the list of processors to run. Use request.input to add ArgdownSourceCode to be processed.
     * @param response Can be optionally used to start with a response from a previous run.
     * Use this if you want to avoid to run processors again that have already done their work.
     * @returns the transformed response object after all plugins have added their data.
     */
    run(request: IArgdownRequest, response?: IArgdownResponse): IArgdownResponse;
}
