import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IArgdownResponse } from "../IArgdownResponse";
import { IMap } from "../model/model";
/**
 * The StatementSelectionMode in the [[IMapSettings]] determines which statements will be added as nodes to the argument map.
 */
export declare enum StatementSelectionMode {
    /**
     * Every statement will be added as node to the argument map.
     */
    ALL = "all",
    /**
     * Only statements with the StatementRole.TOP_LEVEL_STATEMENT or statements with otherwise not represented relations will be added to the argument map.
     */
    TOP_LEVEL = "top-level",
    /**
     * Only statements with with manually defined titles  or statements with otherwise not represented relations will be added to the argument map.
     */
    WITH_TITLE = "with-title",
    /**
     * Only statements with at least one relation to another node in the map will be added to the argument map.
     */
    WITH_RELATIONS = "with-relations",
    /**
     * Only statements not used in any argument's premise-conclusion-structure will be added to the argument map.
     */
    NOT_USED_IN_ARGUMENT = "not-used-in-argument",
    /**
     * Only statements that are in relations with more than one other node in the map or statements with otherwise not represented relations will be added to the argument map.
     */
    WITH_MORE_THAN_ONE_RELATION = "with-more-than-one-relation"
}
export declare enum LabelMode {
    HIDE_UNTITLED = "hide-untitled",
    TITLE = "title",
    TEXT = "text"
}
export declare enum GroupMode {
    HEADING = "heading",
    TAG = "tag",
    NONE = "none"
}
/**
 * The settings for the [[MapPlugin]].
 */
export interface IMapSettings {
    /**
     * The StatementSelectionMode determines which statements are added as nodes to the argument map.
     */
    statementSelectionMode?: StatementSelectionMode;
    /**
     * Can be used to only select arguments and statements with certain tags
     */
    selectedTags?: string[];
    /**
     * Should arguments and statements without tags be excluded from the selection?
     * This is only relevant, if [[IMapSettings.selectedTags]] is used.
     */
    selectElementsWithoutTag?: boolean;
    /**
     *
     * A list of headings that can be used to only selected arguments and statements from certain sections in the texts.
     */
    selectedSections?: string[];
    /**
     * Should arguments and statements that are defined under no heading be excluded from the selection?
     * This is only relevant if [[IMapSettings.selectedSections]] is used.
     */
    selectElementsWithoutSection?: boolean;
    argumentLabelMode?: LabelMode;
    statementLabelMode?: LabelMode;
    /**
     * Should statements and arguments be excluded from the map if they have
     * no relations to other selected arguments or statements?
     */
    excludeDisconnected?: boolean;
    groupMode?: GroupMode;
    groupDepth?: number;
    /**
     * Should tags be added to the node labels?
     */
    addTags?: boolean;
}
export interface IMapRequest extends IArgdownRequest {
    map?: IMapSettings;
}
export interface IMapResponse extends IArgdownResponse {
    map?: IMap;
}
export declare class MapPlugin implements IArgdownPlugin {
    name: string;
    defaults: IMapSettings;
    constructor(config?: IMapSettings);
    getSettings: (request: IArgdownRequest) => IMapSettings;
    prepare: IRequestHandler;
    run: IRequestHandler;
    makeMap(request: IMapRequest, response: IMapResponse): IMap;
}
