"use strict";
import { IArgdownLogger } from "./IArgdownLogger";

export interface IArgdownRequest {
  /**
   * The Argdown input that should be parsed.
   */
  input?: string;
  /**
   * If an array is used: the processors that should be executed in order by the [[ArgdownApplication]] during the current run.
   *
   * If a string is used: the name of the process to be found in [[IArgdownRequest.processes]]. ArgdownApplication will then try to run the processors defined in that process.
   */
  process?: string[] | string;
  /**
   * A dictionary of processes that can be run by using `run({process: "processName", input: ..., processes: ...})`.
   *
   * Keys are the process names, values are list of processors to be executed.
   */
  processes?: { [name: string]: string[] };
  /**
   * Set to "verbose" to get a lot of infos.
   */
  logLevel?: string;
  /**
   * Should exceptions thrown by plugins be logged?
   */
  logExceptions?: boolean;
  logger?: IArgdownLogger;
}

export interface IArgdownResponse {
  /**
   * Errors thrown by plugins.
   *
   * Provided by any plugin throwing an exception.
   */
  exceptions?: Error[];
}

export { tokenize } from "./lexer";
export * from "./RuleNames";
export * from "./TokenNames";
export * from "./parser";
export * from "./ArgdownTreeWalker";
export * from "./ArgdownApplication";
export * from "./Logger";
export * from "./plugins/ModelPlugin";
export * from "./plugins/ParserPlugin";
export * from "./plugins/DataPlugin";
export * from "./plugins/HtmlExportPlugin";
export * from "./plugins/TagPlugin";
export * from "./plugins/MapPlugin";
export * from "./plugins/JSONExportPlugin";
export * from "./plugins/DotExportPlugin";
export * from "./IArgdownPlugin";
export * from "./IArgdownLogger";
export * from "./ArgdownPluginError";
export * from "./model/model";
export * from "./utils";
