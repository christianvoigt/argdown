import * as vscode from "vscode";
import * as path from "path";
import { ArgdownPreviewConfiguration } from "./ArgdownPreviewConfiguration";
import { findElementAtPositionPlugin } from "./FindElementAtPositionPlugin";
import { argdown } from "@argdown/node";
import {
  IArgdownRequest,
  ISection,
  IEquivalenceClass,
  IArgument,
  IMapNode,
  isGroupMapNode,
  ArgdownTypes,
  IMap,
  stringifyArgdownData
} from "@argdown/core";
import { Logger } from "./Logger";
argdown.addPlugin(findElementAtPositionPlugin, "find-element-at-position");

export class ArgdownEngine {
  public constructor(logger: Logger) {
    let logLevel = "verbose";
    argdown.logger = {
      setLevel(level: string) {
        logLevel = level;
      },
      log(_level: string, message: string) {
        if (logLevel == "verbose") {
          logger.log(message);
        }
      }
    };
  }
  public async exportHtml(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<string> {
    const argdownConfig = config.argdownConfig || {};
    const input = doc.getText();
    const request: IArgdownRequest = {
      ...argdownConfig,
      input: input,
      process: ["parse-input", "build-model", "export-html"],
      html: {
        ...argdownConfig.html,
        headless: true
      },
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    return response.html!;
  }
  public async getMapNodeId(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration,
    line: number,
    character: number
  ): Promise<string> {
    const argdownConfig = config.argdownConfig;
    const input = doc.getText();
    const request: IArgdownRequest = {
      ...argdownConfig,
      input: input,
      findElementAtPosition: {
        line: line + 1,
        character: character + 1
      },
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "colorize",
        "find-element-at-position"
      ],
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    if (response.elementAtPosition) {
      const title = response.elementAtPosition.title;
      let nodeType = ArgdownTypes.ARGUMENT_MAP_NODE;
      if (response.elementAtPosition.type === ArgdownTypes.EQUIVALENCE_CLASS) {
        nodeType = ArgdownTypes.STATEMENT_MAP_NODE;
      }
      const node = this.findNodeInMapNodeTree(
        response.map!.nodes,
        n => n.title === title && n.type === nodeType
      );
      if (!node) {
        return "";
      }
      return node.id || "";
    }
    return "";
  }
  public async getRangeOfHeading(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration,
    headingText: string
  ): Promise<vscode.Range> {
    const argdownConfig = config.argdownConfig;
    const input = doc.getText();
    const request: IArgdownRequest = {
      ...argdownConfig,
      input: input,
      process: ["parse-input", "build-model"],
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    if (!response.sections || response.sections.length == 0) {
      return new vscode.Range(0, 0, 0, 0);
    }
    const section = this.findSection(response.sections, headingText);
    if (section) {
      return new vscode.Range(
        (section.startLine || 1) - 1,
        (section.startColumn || 1) - 1,
        (section.startLine || 1) - 1,
        (section.startColumn || 1) - 1
      );
    }
    return new vscode.Range(0, 0, 0, 0);
  }
  private findSection(
    sections: ISection[],
    headingText: string
  ): ISection | null {
    for (let section of sections) {
      if (section.title === headingText) {
        return section;
      }
      if (section.children) {
        const descSection = this.findSection(section.children, headingText);
        if (descSection) {
          return descSection;
        }
      }
    }
    return null;
  }
  public async getRangeOfMapNode(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration,
    id: string
  ): Promise<vscode.Range> {
    const argdownConfig = config.argdownConfig;
    const input = doc.getText();
    const request: IArgdownRequest = {
      ...argdownConfig,
      input: input,
      process: ["parse-input", "build-model", "build-map", "colorize"],
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    const node = this.findNodeInMapNodeTree(
      response.map!.nodes,
      (n: any) => n.id === id
    );
    if (node && node.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
      const argument = response.arguments![node.title!];
      const desc = IArgument.getCanonicalMember(argument);
      if (desc) {
        return new vscode.Range(
          (desc.startLine || 1) - 1,
          (desc.startColumn || 1) - 1,
          (desc.endLine || 1) - 1,
          desc.endColumn || 1
        );
      }
    } else if (node && node.type === ArgdownTypes.STATEMENT_MAP_NODE) {
      const eqClass = response.statements![node.title!];
      const statement = IEquivalenceClass.getCanonicalMember(eqClass);
      if (statement) {
        return new vscode.Range(
          (statement.startLine || 1) - 1,
          (statement.startColumn || 1) - 1,
          (statement.endLine || 1) - 1,
          statement.endColumn || 1
        );
      }
    }
    return new vscode.Range(0, 0, 0, 0);
  }
  private findNodeInMapNodeTree(
    nodes: IMapNode[],
    handler: (n: IMapNode) => boolean
  ): IMapNode | null {
    for (let node of nodes) {
      if (handler(node)) {
        return node;
      }
      if (isGroupMapNode(node) && node.children) {
        const result = this.findNodeInMapNodeTree(node.children, handler);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }
  public async getMap(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<IMap> {
    const argdownConfig = config.argdownConfig;
    const input = doc.getText();
    const request = {
      ...argdownConfig,
      input: input,
      inputPath: doc.uri.fsPath,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "add-images"
      ],
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    return response.map!;
  }
  public async exportMapJson(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<string> {
    const map = await this.getMap(doc, config);
    return stringifyArgdownData(map);
  }
  public async exportJson(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<string> {
    const argdownConfig = config.argdownConfig;
    const input = doc.getText();
    const request = {
      ...argdownConfig,
      input: input,
      inputPath: doc.uri.fsPath,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "export-json"
      ],
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    return response.json!;
  }
  public async exportDot(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<{ dot: string; request: IArgdownRequest }> {
    const argdownConfig = config.argdownConfig || {};
    const input = doc.getText();
    const request = {
      ...argdownConfig,
      input: input,
      inputPath: doc.uri.fsPath,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "add-images",
        "export-dot"
      ],
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    return { dot: response.dot!, request };
  }
  public async exportGraphML(
    doc: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<string> {
    const argdownConfig = config.argdownConfig || {};
    const input = doc.getText();
    const request = {
      ...argdownConfig,
      input: input,
      inputPath: doc.uri.fsPath,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "colorize",
        "add-images",
        "export-graphml"
      ],
      throwExceptions: false
    };
    const response = await argdown.runAsync(request);
    return response.graphml!;
  }
  public async loadConfig(
    configFile: string | undefined,
    resource: vscode.Uri
  ): Promise<IArgdownRequest> {
    if (!configFile) {
      return {};
    }
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);

    let configPath = configFile;
    if (workspaceFolder) {
      let rootPath = workspaceFolder.uri.fsPath;
      configPath = path.resolve(rootPath, configFile);
    } else if (!path.isAbsolute(configPath)) {
      return {};
    }
    return await argdown.loadConfig(configPath);
  }
}
