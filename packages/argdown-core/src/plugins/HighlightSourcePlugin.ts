import hljs from "highlight.js/lib/core";
import argdown from "@argdown/highlightjs";
import { DefaultSettings, isObject, mergeDefaults } from "../utils";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "..";
import defaultsDeep from "lodash.defaultsdeep";
hljs.registerLanguage("argdown", argdown);

/**
 * Settings used by the WebComponentExportPlugin
 */
export interface IHighlightSourceSettings {
  /**
   * Remove FrontMatter from highlighted source
   */
  removeFrontMatter?: boolean;
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[WebComponentExportPlugin]]
     */
    sourceHighlighter?: IHighlightSourceSettings;
  }

  interface IArgdownResponse {
    /**
     * Highlighted Argdown source code (powered by Prism.js)
     *
     * Provided by the [[HighlightSourcePlugin]]
     */
    highlightedSource?: string;
  }
}
const defaultSettings: DefaultSettings<IHighlightSourceSettings> = {
  removeFrontMatter: false
};
export class HighlightSourcePlugin implements IArgdownPlugin {
  name = "HighlightSourcePlugin";
  defaults: IHighlightSourceSettings;
  constructor(config?: IHighlightSourceSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest) {
    if (isObject(request.sourceHighlighter)) {
      return request.sourceHighlighter;
    } else {
      request.sourceHighlighter = {};
      return request.sourceHighlighter;
    }
  }
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };

  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);
    const code = settings.removeFrontMatter
      ? this.removeFrontMatter(request.input!)
      : request.input;
    response.highlightedSource = `<pre class="language-argdown"><code class="language-argdown">${
      hljs.highlight("argdown", code || "").value
    }</code></pre>`;
  };
  removeFrontMatter(str: string) {
    return str.replace(/[\s]*===+[\s\S]*===+[\s]*/, "");
  }
}
