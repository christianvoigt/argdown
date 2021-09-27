import {
  IArgdownRequest,
  WebComponentExportPlugin,
  IWebComponentExportSettings,
  ArgdownApplication
} from "@argdown/core";
import { argdown as defaultArgdownApplication } from "@argdown/core/dist/argdown";
import type MarkdownIt from "markdown-it"; 
import defaultsDeep from "lodash.defaultsdeep";
import Token from "markdown-it/lib/token";

const createArgdownPlugin = (config?: ((env:any)=>IArgdownRequest) | IArgdownRequest, customArgdownApplication?: ArgdownApplication) => {
  const argdown = customArgdownApplication || defaultArgdownApplication;
  const webComponentPlugin = argdown.getPlugin(
    WebComponentExportPlugin.name,
    "export-web-component"
  ) as WebComponentExportPlugin;
  let currentConfig:IArgdownRequest = !config || typeof config === "function"? {} : config; 
  const webComponentDefaults = webComponentPlugin.defaults;

  const ArgdownPlugin = (md: MarkdownIt) => {
    const generateWebComponent = (code: string, initialView?: string, additionalSettings?: IWebComponentExportSettings) => {
      const request: IArgdownRequest = defaultsDeep({
        input: code,
        process: "export-web-component"},
        currentConfig, 
        {        
          webComponent: {
          addGlobalStyles: false,
          addWebComponentPolyfill: false,
          addWebComponentScript: false,
          initialView: initialView ||"map"
        }
      });
      if(additionalSettings){
        request.webComponent = defaultsDeep({}, additionalSettings, request.webComponent);
      }
      const {svg} = argdown.run({...request, process: "export-svg"});
      console.log(svg);
      const response = argdown.run(request);
      return response.webComponent;
    };
    (md as any).argdown = argdown;

    const tempFence = md.renderer.rules.fence!.bind(md.renderer.rules)!;
    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
      const token = tokens[idx];
      const chunks = (token.info || ``).match(/^(\S+)(\s+(.+))?/);
      if (!chunks || !chunks.length) {
        return tempFence(tokens, idx, options, env, slf);;
      }
      const lang = chunks[1];

      const code = token.content.trim();
      if (lang === "argdown-map") {
        return generateWebComponent(code, "map") || "";
      }else if(lang === "argdown"){
        return generateWebComponent(code, "source") || "";
      }else if(lang === "argdown-source"){ // needed for Argdown Cheatsheet in docs
        return generateWebComponent(code, "source", {
          withoutHeader: true,
          withoutZoom: true,
          withoutFigure: true,
          views: {
            source: true,
            map: false
          }
        }) || "";
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
        const pluginSettings = defaultsDeep({}, currentConfig.webComponent||{}, webComponentDefaults);
        if (pluginSettings.addWebComponentScript) {
          script = `<script src="${
            pluginSettings.webComponentScriptUrl
          }"></script>`;
        }
        if (pluginSettings.addGlobalStyles) {
          styles = `<link rel="stylesheet" type="text/css" href="${
            pluginSettings.globalStylesUrl
          }">`;
        }
        if (pluginSettings.addWebComponentPolyfill) {
          polyfill = `<script src="${
            pluginSettings.webComponentPolyfillUrl
          }"></script>`;
        }
        return `${script}${styles}${polyfill}${tempRender(tokens, options, env)}`;
      };
  };
  return ArgdownPlugin;
};
export default createArgdownPlugin;
