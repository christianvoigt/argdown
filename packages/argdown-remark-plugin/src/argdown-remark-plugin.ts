import {
  IArgdownRequest,
  WebComponentExportPlugin,
  IWebComponentExportSettings
} from "@argdown/core";
import { argdown } from "@argdown/core/dist/argdown";
import defaultsDeep from "lodash.defaultsdeep";
import visit from "unist-util-visit";
import { Code } from "mdast";
import { Parent } from "unist";
import { Transformer } from "unified";
import u from "unist-builder";

const generateWebComponent = (
  code: string,
  initialView: string,
  config: IArgdownRequest
) => {
  const request: IArgdownRequest = defaultsDeep(
    {
      input: code,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "export-dot",
        "export-svg",
        "highlight-source",
        "export-web-component"
      ],
      webComponent: {
        addGlobalStyles: false,
        addWebComponentPolyfill: false,
        addWebComponentScript: false,
        initialView: initialView || "map"
      }
    },
    config
  );
  const response = argdown.run(request);
  return response.webComponent;
};
export interface RemarkArgdownOptions {
  argdownConfig?: IArgdownRequest | ((cwd: string) => IArgdownRequest);
}
export const remarkArgdownPlugin = (
  options: RemarkArgdownOptions = {}
): Transformer => {
  return async function transformer(tree, file) {
    const config =
      typeof options.argdownConfig === "function"
        ? options.argdownConfig(file.cwd)
        : options.argdownConfig || {};
    const webComponentPlugin = argdown.getPlugin(
      WebComponentExportPlugin.name,
      "export-web-component"
    ) as WebComponentExportPlugin;
    const webComponentDefaults = webComponentPlugin.defaults;
    let pluginSettings: IWebComponentExportSettings = defaultsDeep(
      {},
      config.webComponent || {},
      webComponentDefaults
    );
    if (
      (tree as Parent).children &&
      (pluginSettings.addGlobalStyles ||
        pluginSettings.addWebComponentScript ||
        pluginSettings.addWebComponentPolyfill)
    ) {
      let includeHtml = "";
      if (pluginSettings.addGlobalStyles) {
        includeHtml += `<link rel="stylesheet" type="text/css" href="${pluginSettings.globalStylesUrl}">`;
      }
      if (pluginSettings.addWebComponentScript) {
        includeHtml += `<script src="${pluginSettings.webComponentScriptUrl}"></script>`;
      }
      if (pluginSettings.addWebComponentPolyfill) {
        includeHtml += `<script src="${pluginSettings.webComponentPolyfillUrl}" type="module"></script>`;
      }
      (tree as Parent).children.splice(0, 0, u("html", includeHtml));
    }

    const visitor = (node: Code, index: number, parent: Parent): void => {
      const chunks = (node.lang || ``).match(/^(\S+)(\s+(.+))?/);

      if (!chunks || !chunks.length) {
        return;
      }

      const lang = chunks[1];
      //const attrString = chunks[3];
      if (lang == "argdown" || lang == "argdown-map") {
        const initialView = lang == "argdown-map" ? "map" : "source";
        const htmlOutput = generateWebComponent(
          node.value,
          initialView,
          config
        );
        parent.children.splice(index, 1, u("html", { value: htmlOutput }));
      }
    };
    visit<Code>(tree, "code", visitor as visit.Visitor<Code>);
  };
};
export default remarkArgdownPlugin;
