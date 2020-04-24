import {
  IArgdownRequest,
  WebComponentExportPlugin,
  IWebComponentExportSettings
} from "@argdown/core";
import defaultsDeep from "lodash.defaultsdeep";
import { argdown } from "@argdown/core/dist/argdown";

export const addArgdownSupportToMarked = (
  markedFn: (src: string, options?: marked.MarkedOptions | undefined) => string,
  renderer: marked.Renderer,
  config?: ((options: any) => IArgdownRequest) | IArgdownRequest
) => {
  const webComponentPlugin = argdown.getPlugin(
    WebComponentExportPlugin.name,
    "export-web-component"
  ) as WebComponentExportPlugin;
  let currentConfig: IArgdownRequest =
    !config || typeof config === "function" ? {} : config;
  const webComponentDefaults = webComponentPlugin.defaults;
  let pluginSettings: IWebComponentExportSettings = {};

  const generateWebComponent = (code: string) => {
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
          addWebComponentScript: false
        }
      },
      currentConfig
    );
    const response = argdown.run(request);
    return response.webComponent;
  };
  const highlightCode = (code: string) => {
    const request: IArgdownRequest = defaultsDeep(
      {
        input: code,
        process: ["parse-input", "build-model", "highlight-source"]
      },
      currentConfig
    );
    const response = argdown.run(request);
    return response.highlightedSource;
  };
  const tempCode = renderer.code.bind(renderer);
  renderer.code = (
    code: string,
    language: string | undefined,
    isEscaped: boolean
  ) => {
    if (language === "argdown-map") {
      return generateWebComponent(code.trim()) || "";
    } else if (language === "argdown") {
      return highlightCode(code.trim()) || "";
    }
    return tempCode(code, language, isEscaped);
  };
  return (src: string, options?: marked.MarkedOptions | undefined) => {
    if (typeof config === "function") {
      currentConfig = config(options);
    }
    currentConfig.webComponent = currentConfig.webComponent || {};
    pluginSettings = defaultsDeep(
      {},
      currentConfig.webComponent,
      webComponentDefaults
    );

    let script = "";
    let styles = "";
    let polyfill = "";
    if (pluginSettings.addWebComponentScript) {
      script = `<script src="${pluginSettings.noModuleScriptUrl ||
        webComponentDefaults.noModuleScriptUrl}" type="module"></script>
          <script type="text/javascript" nomodule src="${pluginSettings.noModuleScriptUrl ||
            webComponentDefaults.noModuleScriptUrl}"></script>`;
    }
    if (pluginSettings.addGlobalStyles) {
      styles = `<link rel="stylesheet" type="text/css" href="${pluginSettings.globalStylesUrl ||
        webComponentDefaults.globalStylesUrl}">`;
    }
    if (pluginSettings.addWebComponentPolyfill) {
      polyfill = `<script src="${pluginSettings.webComponentPolyfill ||
        webComponentDefaults.webComponentPolyfill}" type="module"></script>`;
    }
    return `${script}${styles}${polyfill}${markedFn(src, {
      ...options,
      renderer
    })}`;
    return markedFn(src, { ...options, renderer });
  };
};
