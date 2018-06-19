import * as _ from "lodash";
import * as yaml from "js-yaml";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IArgdownResponse } from "../IArgdownResponse";
import { IAstNodeHandler, IRuleNodeHandler, ITokenNodeHandler } from "../ArgdownTreeWalker";

/**
 * Settings for the MetaDataPlugin
 */
export interface IMetaDataSettings {
  /**
   * If true the front matter yaml data is merged into the request object.
   * This makes it possible to configure plugins without using an external argdown.config.js file.
   */
  mergeFrontMatterIntoRequest?: boolean;
  /**
   * If false the YAML metaData of arguments, statements and headings is always parsed with the outer curly brackets.
   * In this case the YAML data has to always be in inline format which looks similar to JSON data.
   *
   * If true the metaData is parsed without the outer curly brackets if the opening bracket is followed by a line break.
   * This means that the YAML data has to be in block format instead of the JSON-like inline format.
   */
  switchToBlockFormatIfMultiline?: boolean;
}
/**
 * Request configuration data used by the MetaDataPlugin
 */
export interface IMetaDataRequest extends IArgdownRequest {
  metadata?: IMetaDataSettings;
}
/**
 * Response data produced by the MetaDataPlugin
 */
export interface IMetaDataResponse extends IArgdownResponse {
  frontMatter?: any;
}
/**
 * The default settings of the MetaDataPlugin
 */
const defaultSettings: IMetaDataSettings = {
  mergeFrontMatterIntoRequest: true,
  switchToBlockFormatIfMultiline: true
};
const frontMatterStartPattern = /^\s*\={3,}/;
const frontMatterEndPattern = /\={3,}\s*$/;
const blockFormatStartPattern = /^{[ \t]*(\n\r|\n)/;
const blockFormatEndPattern = /}\s*$/;
/**
 * The MetaDataPlugin parses Argdown YAML front matter and YAML meta data of statements, arguments, headings or inferences.
 * In the ParserPlugin the Argdown lexer treats these sections as single tokens so that their contents are ignored by the Argdown parser. Instead the YAML parsing is done
 * afterwards in this plugin by traversing the produced AST and using the `js-yaml` parser for parsing the content of the FrontMatter and MetaData tokens.
 *
 * The parsed metaData is added to the AST nodes and the data model elements it is meant for.
 * If multiple metaData sections exist for the same argument or equivalence class, the data is merged in order of appearance (last wins).
 *
 * The front matter data is added to the topmost AST `argdown` node and to the [[IMetaDataResponse.frontMatter]] response property.
 * By default (or if `response.metaData.mergeFrontMatterIntoRequest` is true) the front matter is also merged into the request object so that it can be used to configure subsequent plugins.
 *
 * Depends on data of: [[ParserPlugin]]
 */
export class MetaDataPlugin implements IArgdownPlugin {
  name = "MetaDataPlugin";
  defaults: IMetaDataSettings;
  tokenListeners: { [eventId: string]: ITokenNodeHandler };
  constructor(config?: IMetaDataSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
    this.tokenListeners = {
      MetaData: (request, {}, token, parentNode, {}, logger) => {
        const options: yaml.LoadOptions = {};
        let metaDataStr = token.image;
        const settings = this.getSettings(request);
        if (settings.switchToBlockFormatIfMultiline) {
          const match = blockFormatStartPattern.exec(metaDataStr);
          if (match) {
            metaDataStr = metaDataStr.substr(match[0].length).replace(blockFormatEndPattern, "");
          }
        }
        const metaData = yaml.safeLoad(metaDataStr, options);
        if (parentNode) {
          parentNode.metaData = metaData;
        }
      },
      FrontMatter: (request, response, token, parentNode, {}, logger) => {
        const options: yaml.LoadOptions = {};
        let metaDataStr = token.image.replace(frontMatterStartPattern, "").replace(frontMatterEndPattern, "");
        const metaData: any = yaml.safeLoad(metaDataStr, options);
        if (parentNode) {
          parentNode.metaData = metaData;
        }
        (<IMetaDataResponse>response).frontMatter = metaData;
        const settings = this.getSettings(request);
        if (metaData && _.isObject(metaData) && settings!.mergeFrontMatterIntoRequest) {
          _.merge(request, metaData);
        }
      }
    };
  }
  getSettings(request: IArgdownRequest) {
    const r = request as IMetaDataRequest;
    if (r.metadata) {
      return r.metadata;
    } else {
      r.metadata = {};
      return r.metadata;
    }
  }
  prepare: IRequestHandler = request => {
    _.defaultsDeep(this.getSettings(request), this.defaults);
  };
  //   run: IRequestHandler = (request, response, logger) => {};
}
