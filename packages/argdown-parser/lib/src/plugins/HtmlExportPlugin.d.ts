import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IRuleNodeHandler, ITokenNodeHandler } from "../ArgdownTreeWalker";
import { IArgdownResponse } from "../IArgdownResponse";
/**
 * Settings used by the HTMLExportPlugin
 */
export interface IHtmlExportSettings {
    /**
     * Remove sourrounding html and body tags, remove head section of HTML.
     *
     * Instead a simple div containing the argdown HTML is returned.
     */
    headless?: boolean;
    /**
     * External CSS file to include in the HTML head section.
     */
    cssFile?: string;
    /** Title of the HTML document. If not provided, the first top-level heading will be used. */
    title?: string;
    lang?: string;
    charset?: string;
    allowFileProtocol?: boolean;
    /** Optional setting to specify a custom head section. */
    head?: string;
    /** Function to test if a link is valid. */
    validateLink?: (url: string, allowFile: boolean) => boolean;
    /** Function to normalize links. */
    normalizeLink?: (url: string) => string;
}
/**
 * Request configuration data used by the HTMLExportPlugin.
 */
export interface IHtmlRequest extends IArgdownRequest {
    html?: IHtmlExportSettings;
}
/**
 * Response data produced by the HTMLExportPlugin.
 */
export interface IHtmlResponse extends IArgdownResponse {
    /** the exported html string */
    html?: string;
    htmlIds?: {
        [id: string]: boolean;
    } | null;
}
/**
 * Exports the Argdown code to HTML.
 *
 * Depends on data from: ParserPlugin, ModelPlugin
 *
 * Can use data from: TagPlugin
 */
export declare class HtmlExportPlugin implements IArgdownPlugin {
    name: string;
    defaults: IHtmlExportSettings;
    ruleListeners: {
        [eventId: string]: IRuleNodeHandler;
    };
    tokenListeners: {
        [eventId: string]: ITokenNodeHandler;
    };
    getSettings(request: IArgdownRequest): IHtmlExportSettings;
    prepare: IRequestHandler;
    constructor(config?: IHtmlExportSettings);
    getCssClassesFromTags(response: IArgdownResponse, tags: string[]): string;
}
