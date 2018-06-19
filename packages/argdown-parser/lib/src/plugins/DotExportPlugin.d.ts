import { IArgdownRequest } from "../IArgdownRequest";
import { IArgdownResponse } from "../IArgdownResponse";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IMapNode } from "../model/model";
export interface IDotSettings {
    useHtmlLabels?: boolean;
    graphname?: string;
    lineLength?: number;
    groupColors?: string[];
    graphVizSettings?: {
        [name: string]: string;
    };
    colorNodesByTag?: boolean;
}
export interface IDotRequest extends IArgdownRequest {
    dot?: IDotSettings;
}
export interface IDotResponse extends IArgdownResponse {
    dot?: string;
    groupCount?: number;
}
/**
 * Exports map data to dot format.
 * The result ist stored in the [[IDotResponse.dot]] response object property.
 *
 * Depends on data from: [[MapPlugin]]
 */
export declare class DotExportPlugin implements IArgdownPlugin {
    name: string;
    defaults: IDotSettings;
    constructor(config?: IDotSettings);
    getSettings(request: IArgdownRequest): IDotSettings;
    prepare: IRequestHandler;
    run: IRequestHandler;
    exportNodesRecursive(node: IMapNode, response: IDotResponse, settings: IDotSettings): string;
}
