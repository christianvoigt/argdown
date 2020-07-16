#!/usr/bin/env node
"use strict";

import path from "path";
import {
  stdio,
  Para,
  RawBlock,
  Image,
  Str,
  PandocMetaMap
} from "pandoc-filter";
import { argdown, IArgdownRequest } from "@argdown/node";
import { IArgdownResponse } from "@argdown/core";
import defaultsDeep from "lodash.defaultsdeep";
import { mergeDefaults } from "@argdown/core";
import { tryToInstallImageExport } from "./tryToInstallImageExport";

let imageCounter = 1;
let webComponentCount = 0;
let loadedConfig: IArgdownRequest;
let settings: IArgdownFilterSettings;
const getFilterSettings = (meta: PandocMetaMap) => {
  if (!settings) {
    settings = {};
    const argdownMeta = meta["argdown"];
    if (argdownMeta && argdownMeta.t === "MetaMap") {
      for (var entry of Object.entries(argdownMeta.c)) {
        const value = entry[1];
        if (
          value.t === "MetaInlines" &&
          Array.isArray(value.c) &&
          typeof value.c[0].c === "string"
        ) {
          (<any>settings)[entry[0]] = value.c[0].c;
        }
      }
    }
    settings = mergeDefaults(settings, {
      caption: "",
      mode: "inline",
      format: "svg"
    });
  }
  return settings;
};
const getArgdownConfig = async (configPath?: string) => {
  if (!loadedConfig) {
    let pathToConfig;
    if (configPath) {
      pathToConfig = path.resolve(process.cwd(), configPath);
    } else {
      pathToConfig = path.resolve(process.cwd(), "argdown.config.json");
    }
    loadedConfig = await argdown.loadConfig(pathToConfig);
    if (!loadedConfig) {
      loadedConfig = {};
    }
  }
  return loadedConfig;
};
export interface IArgdownFilterSettings {
  caption?: string;
  width?: number;
  height?: number;
  mode?: "inline" | "file" | "web-component";
  format?: "svg" | "png" | "jpg" | "webp";
  config?: string;
  sourceHighlighter?: "web-component";
}
stdio(async (ele, _format, meta) => {
  if (ele.t === `CodeBlock`) {
    const [headers, content] = ele.c;
    const [, [language]] = headers;
    if (language === "argdown-map") {
      const settings: IArgdownFilterSettings = { ...getFilterSettings(meta) };
      headers[2].map(item => {
        (settings as any)[item[0]] = item[1];
      });
      const config = await getArgdownConfig(settings.config);
      const id = headers[0];
      const process = getProcess(settings);
      if (settings.format != "svg") {
        const imageExportInstalled = await tryToInstallImageExport(argdown);
        if (!imageExportInstalled) {
          throw new Error(
            `You are trying to export an Argdown map to ${settings.format}. Please run "npm install -g @argdown/image-export" to install the Ardown image export plugin.`
          );
        }
      }
      switch (settings.mode) {
        case "web-component": {
          const request: IArgdownRequest = defaultsDeep(
            {
              input: content,
              process
            },
            config,
            {
              webComponent: {
                figureCaption: settings.caption,
                addGlobalStyles: webComponentCount == 0,
                addWebComponentPolyfill: webComponentCount == 0,
                addWebComponentScript: webComponentCount == 0
              }
            }
          );
          webComponentCount++;
          const response = await argdown.runAsync(request);
          return RawBlock("html", response.webComponent || "");
        }
        case "inline": {
          const request: IArgdownRequest = defaultsDeep(
            {
              input: content,
              process
            },
            config
          );
          const response = await argdown.runAsync(request);
          settings.caption =
            request.webComponent?.figureCaption || settings.caption;
          let inlineImage = getInlineImage(response, settings.format!)!;
          return getPandocImage(settings, inlineImage, id);
        }
        case "file": {
          let fileName = id;
          if (!fileName || fileName == "") {
            fileName = `map-${imageCounter}`;
            imageCounter++;
          }
          const request: IArgdownRequest = defaultsDeep(
            {
              input: content,
              process,
              saveAs: {
                fileName
              }
            },
            config
          );
          const response = await argdown.runAsync(request);
          settings.caption =
            request.webComponent?.figureCaption || settings.caption;
          return getPandocImage(settings, response.outputPath!, id);
        }
      }
    } else if (language === "argdown") {
      const settings: IArgdownFilterSettings = { ...getFilterSettings(meta) };
      let sourceMode = settings.sourceHighlighter;
      headers[2].map(item => {
        if (item[0] === "mode") {
          (<string>sourceMode) = item[1];
        }
        (settings as any)[item[0]] = item[1];
      });
      if (sourceMode === "web-component") {
        const config = await getArgdownConfig(settings.config);
        const process = getProcess(settings);
        const request: IArgdownRequest = defaultsDeep(
          {
            input: content,
            process
          },
          config,
          {
            webComponent: {
              initialView: "source",
              figureCaption: settings.caption,
              addGlobalStyles: webComponentCount == 0,
              addWebComponentPolyfill: webComponentCount == 0,
              addWebComponentScript: webComponentCount == 0
            }
          }
        );
        webComponentCount++;
        const response = await argdown.runAsync(request);
        return RawBlock("html", response.webComponent || "");
      }
    }
  }
  return;
});
const getInlineImage = (
  response: IArgdownResponse,
  format: "svg" | "png" | "jpg" | "webp"
) => {
  const inlineFormat = format == "svg" ? "svg+xml" : format;
  let result = response[format]!;
  if (typeof result === "string" || result instanceof String) {
    result = Buffer.from(result);
  }
  return `data:image/${inlineFormat};base64,${result.toString("base64")}`;
};
const getProcess = (settings: IArgdownFilterSettings) => {
  const process = [
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "export-dot",
    "export-svg"
  ];
  if (settings.format !== "svg") {
    process.push(`export-${settings.format}`);
  }
  if (settings.mode == "file") {
    process.push(`save-as-${settings.format}`);
  } else if (settings.mode == "web-component") {
    process.push("highlight-source", "export-web-component");
  }
  return process;
};
const getPandocImage = (
  settings: IArgdownFilterSettings,
  imagePath: string,
  id: string
) => {
  const caption = settings.caption || "";
  const attr: [string, string][] = [];
  if (settings.width) {
    attr.push(["width", settings.width.toString()]);
  }
  if (settings.height) {
    attr.push(["height", settings.height.toString()]);
  }
  const fig = `fig:${settings.caption}`;
  return Para([Image([id, [], attr], [Str(caption)], [imagePath, fig])]);
};
