import * as yaml from "js-yaml";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ITokenNodeHandler } from "../ArgdownTreeWalker";
import { IArgdownRequest } from "../index";
export enum FrontMatterSettingsModes {
  IGNORE = "ignore",
  DEFAULT = "default",
  PRIORITY = "priority"
}
import defaultsDeep from "lodash.defaultsdeep";
import merge from "lodash.merge";
import { mergeDefaults, isObject } from "../utils";

/**
 * Settings for the DataPlugin
 */
export interface IDataSettings {
  /**
   * If set to "ignore", any settings in the frontmatter will be ignored.
   * If set to "default" or undefined the front matter yaml data settings are merged as default settings into the request object.
   * If set to "priority" the yaml data settings overwrite any external settings.
   * This makes it possible to configure plugins without using an external argdown.config.js file.
   */
  frontMatterSettingsMode?: FrontMatterSettingsModes;
  /**
   * If false the YAML data of arguments, statements and headings is always parsed with the outer curly brackets.
   * In this case the YAML data has to always be in inline format which looks similar to JSON data.
   *
   * If true the data is parsed without the outer curly brackets if the opening bracket is followed by a line break.
   * This means that the YAML data has to be in block format instead of the JSON-like inline format.
   */
  switchToBlockFormatIfMultiline?: boolean;
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[DataPlugin]]
     */
    data?: IDataSettings;
  }
  interface IArgdownResponse {
    /**
     * Front matter meta data provided by the [[DataPlugin]]
     */
    frontMatter?: any;
  }
}
/**
 * The default settings of the DataPlugin
 */
const defaultSettings: IDataSettings = {
  frontMatterSettingsMode: FrontMatterSettingsModes.PRIORITY,
  switchToBlockFormatIfMultiline: true
};
const frontMatterStartPattern = /^\s*\={3,}/;
const frontMatterEndPattern = /\={3,}\s*$/;
const blockFormatStartPattern = /^{[ \t]*(\n\r|\n)/;
const blockFormatEndPattern = /}\s*$/;
/**
 * The DataPlugin parses Argdown YAML front matter and YAML data of statements, arguments, headings or inferences.
 * In the ParserPlugin the Argdown lexer treats these sections as single tokens so that their contents are ignored by the Argdown parser. Instead the YAML parsing is done
 * afterwards in this plugin by traversing the produced AST and using the `js-yaml` parser for parsing the content of the FrontMatter and Data tokens.
 *
 * The parsed data is added to the AST nodes and the data model elements it is meant for.
 * If multiple data sections exist for the same argument or equivalence class, the data is merged in order of appearance (last wins).
 *
 * The front matter data is added to the topmost AST `argdown` node and to the [[IDataResponse.frontMatter]] response property.
 * By default (or if `response.data.mergeFrontMatterIntoRequest` is true) the front matter is also merged into the request object so that it can be used to configure subsequent plugins.
 *
 * Depends on data of: [[ParserPlugin]]
 */
export class DataPlugin implements IArgdownPlugin {
  name = "DataPlugin";
  defaults: IDataSettings;
  tokenListeners: { [eventId: string]: ITokenNodeHandler };
  constructor(config?: IDataSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
    this.tokenListeners = {
      Data: (request, {}, token, parentNode) => {
        const options: yaml.LoadOptions = {};
        let dataStr = token.image;
        const settings = this.getSettings(request);
        if (settings.switchToBlockFormatIfMultiline) {
          const match = blockFormatStartPattern.exec(dataStr);
          if (match) {
            dataStr = dataStr
              .substr(match[0].length)
              .replace(blockFormatEndPattern, "");
          }
        }
        const data = yaml.safeLoad(dataStr, options);
        if (parentNode) {
          parentNode.data = data;
        }
      },
      FrontMatter: (request, response, token, parentNode) => {
        const options: yaml.LoadOptions = {};
        let dataStr = token.image
          .replace(frontMatterStartPattern, "")
          .replace(frontMatterEndPattern, "");
        const data: any = yaml.safeLoad(dataStr, options);
        if (parentNode) {
          parentNode.data = data;
        }
        response.frontMatter = data;
        const settings = this.getSettings(request);
        if (
          data &&
          isObject(data) &&
          settings!.frontMatterSettingsMode !== FrontMatterSettingsModes.IGNORE
        ) {
          if (
            settings.frontMatterSettingsMode ===
            FrontMatterSettingsModes.DEFAULT
          ) {
            defaultsDeep(request, data);
          } else {
            merge(request, data);
          }
        }
      }
    };
  }
  getSettings(request: IArgdownRequest) {
    if (isObject(request.data)) {
      return request.data;
    } else {
      request.data = {};
      return request.data;
    }
  }
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  //   run: IRequestHandler = (request, response, logger) => {};
}
