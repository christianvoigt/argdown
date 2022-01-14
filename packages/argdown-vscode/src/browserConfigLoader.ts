import { Utils } from "vscode-uri";
import * as vscode from "vscode";
import { ArgdownConfigLoader } from "./preview/ArgdownEngine";
export const browserConfigLoader: ArgdownConfigLoader = async (
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

  const readFile = vscode.workspace.fs.readFile;
  try {
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
};
