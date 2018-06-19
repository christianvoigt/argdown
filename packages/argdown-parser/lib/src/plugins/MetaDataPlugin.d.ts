import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IArgdownResponse } from "../IArgdownResponse";
import { ITokenNodeHandler } from "../ArgdownTreeWalker";
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
export declare class MetaDataPlugin implements IArgdownPlugin {
    name: string;
    defaults: IMetaDataSettings;
    tokenListeners: {
        [eventId: string]: ITokenNodeHandler;
    };
    constructor(config?: IMetaDataSettings);
    getSettings(request: IArgdownRequest): IMetaDataSettings;
    prepare: IRequestHandler;
}
