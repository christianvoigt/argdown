import {
  IArgdownRequest,
  WebComponentExportPlugin,
  IWebComponentExportSettings
} from "@argdown/core";
import { argdown } from "@argdown/core/dist/argdown";
import type MarkdownIt from "markdown-it"; 
import defaultsDeep from "lodash.defaultsdeep";
import Token from "markdown-it/lib/token";

const createArgdownPlugin = (config?: ((env:any)=>IArgdownRequest) | IArgdownRequest) => {
  const webComponentPlugin = argdown.getPlugin(
    WebComponentExportPlugin.name,
    "export-web-component"
  ) as WebComponentExportPlugin;
  let currentConfig:IArgdownRequest = !config || typeof config === "function"? {} : config; 
  const webComponentDefaults = webComponentPlugin.defaults;
  let pluginSettings:IWebComponentExportSettings = {};

  const ArgdownPlugin = (md: MarkdownIt) => {
    const generateWebComponent = (code: string) => {
      const request: IArgdownRequest = defaultsDeep({
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
      },currentConfig);
      const response = argdown.run(request);
      return response.webComponent;
    };
    const highlightCode = (code: string) => {
      const request: IArgdownRequest = defaultsDeep({
        input: code,
        process: [
          "parse-input",
          "build-model",
          "highlight-source",
        ]
      }, currentConfig);
      const response = argdown.run(request);
      return response.highlightedSource;
    };
    (md as any).argdown = argdown;

    const tempFence = md.renderer.rules.fence.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
      const token = tokens[idx];
      const code = token.content.trim();
      if (token.info === "argdown-map") {
        return generateWebComponent(code) || "";
      }else if(token.info === "argdown"){
        return highlightCode(code) ||"";
      }
      return tempFence(tokens, idx, options, env, slf);
    };
      const tempRender = md.renderer.render.bind(md.renderer);
      md.renderer.render = (tokens: Token[], options:any, env: any) => {
        let script = "";
        let styles = "";
        let polyfill = "";
        if(typeof config === "function"){
          currentConfig = config(env);
        }
        currentConfig.webComponent = currentConfig.webComponent ||{};
        pluginSettings = defaultsDeep({}, currentConfig.webComponent, webComponentDefaults);
      
        if (pluginSettings.addWebComponentScript) {
          script = `<script src="${
            currentConfig.webComponent.noModuleScriptUrl || webComponentDefaults.noModuleScriptUrl
          }" type="module"></script>
          <script type="text/javascript" nomodule src="${
            currentConfig.webComponent.noModuleScriptUrl || webComponentDefaults.noModuleScriptUrl
          }"></script>`;
        }
        if (currentConfig.webComponent.addGlobalStyles) {
          styles = `<link rel="stylesheet" type="text/css" href="${
            currentConfig.webComponent.globalStylesUrl || webComponentDefaults.globalStylesUrl
          }">`;
        }
        if (currentConfig.webComponent.addWebComponentPolyfill) {
          polyfill = `<script src="${
            currentConfig.webComponent.webComponentPolyfill || webComponentDefaults.webComponentPolyfill
          }" type="module"></script>`;
        }
        return `${script}${styles}${polyfill}${tempRender(tokens, options, env)}`;
      };
  };
  return ArgdownPlugin;
};
export default createArgdownPlugin;
