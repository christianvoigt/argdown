import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
/**
 * Settings used by the JSONExportPlugin
 */
export interface IJSONSettings {
    spaces?: number;
    /**
     * Should [[Argument.relations]], [[Statement.relations]] be removed from the JSON objects?
     */
    removeEmbeddedRelations?: boolean;
    /**
     * Should the JSON data include the response.map property?
     */
    exportMap?: boolean;
    /**
     * Should the JSON data include sections?
     */
    exportSections?: boolean;
    /**
     * Should the JSON data include tag data?
     */
    exportTags?: boolean;
    /**
     * Should the JSON data include metaData?
     */
    exportMetaData?: boolean;
}
/**
 * Request configuration data used by the JSONExportPlugin
 */
export interface IJSONRequest {
    json?: IJSONSettings;
}
/**
 * Response data added by the JSONExportPlugin
 */
export interface IJSONResponse {
    json?: string;
}
/**
 * Exports data in the response object to JSON.
 * The result ist stored in the [[IJSONResponse.json]] response object property.
 *
 * Note: The [[IArgdownResponse.ast]] object is not exported to JSON.
 *
 * Depends on data from: [[ModelPlugin]]
 * Can use data from: [[TagPlugin]], [[MetaDataPlugin]], [[MapPlugin]]
 */
export declare class JSONExportPlugin implements IArgdownPlugin {
    name: string;
    defaults: IJSONSettings;
    constructor(config?: IJSONSettings);
    getSettings(request: IArgdownRequest): IJSONSettings;
    prepare: IRequestHandler;
    run: IRequestHandler;
}
