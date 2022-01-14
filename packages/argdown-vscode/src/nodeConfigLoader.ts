import { Utils } from "vscode-uri";
import * as vscode from "vscode";
import { ArgdownConfigLoader } from "./preview/ArgdownEngine";
import importFresh from "import-fresh";
export const nodeConfigLoader: ArgdownConfigLoader = async (
  configFile,
  resource,
  logger
) => {
  if (!configFile) {
    return {};
  }
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);

  let configPath: vscode.Uri;
  if (workspaceFolder) {
    configPath = Utils.resolvePath(workspaceFolder.uri, configFile);
  } else {
    let rootPath = Utils.dirname(resource);
    configPath = Utils.resolvePath(rootPath, configFile);
  }
  const extName = Utils.extname(configPath);
  if (extName === ".json") {
    try {
      const readFile = vscode.workspace.fs.readFile;
      const data = await readFile(configPath);
      const str = Buffer.from(data).toString("utf8");
      return JSON.parse(str);
    } catch (e) {
      if (e instanceof Error) {
        logger.log(
          "verbose",
          "[AsyncArgdownApplication]: No config found: " + e.toString()
        );
      }
    }
  } else if (extName === ".js" && configPath.scheme === "file") {
    // For Js config files we have to use loadJSFile which is synchronous
    try {
      let jsModuleExports = loadJSFile(configPath.fsPath);

      if (jsModuleExports.config) {
        return jsModuleExports.config;
      } else {
        // let's try the default export
        return jsModuleExports;
      }
    } catch (e) {
      if (e instanceof Error) {
        logger.log(
          "verbose",
          "[AsyncArgdownApplication]: No config found: " + e.toString()
        );
      }
    }
  }
  return {};
};
/**
 * Taken from eslint: https://github.com/eslint/eslint/blob/master/lib/config/config-file.js
 * Loads a JavaScript configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
const loadJSFile = (filePath: string) => {
  try {
    return importFresh(filePath) as any;
  } catch (e) {
    if (e instanceof Error) {
      e.message = `Cannot read file: ${filePath}\nError: ${e.message}`;
    }
    throw e;
  }
};
