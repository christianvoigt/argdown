import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IRuleNodeHandler, ITokenNodeHandler } from "../ArgdownTreeWalker";
export interface IModelPluginSettings {
    removeTagsFromText?: boolean;
}
export interface IModelPluginRequest extends IArgdownRequest {
    model?: IModelPluginSettings;
}
/**
 * The ModelPlugin builds the basic data model from the abstract syntax tree (AST) in the [[IArgdownResponse.ast]] response property that is provided by the [[ParserPlugin]].
 * This includes the following response object properties:
 *
 *  - [[IArgdownResponse.statements]]
 *  - [[IArgdownResponse.arguments]]
 *  - [[IArgdownResponse.relations]]
 *  - [[IArgdownResponse.sections]]
 *
 * Most of the other plugins depend on the data produced by this plugin. Whenever possible plugins should use the
 * data processed by this plugin instead of working with the AST nodes directly.
 *
 * depends on data from: [[ParserPlugin]]
 */
export declare class ModelPlugin implements IArgdownPlugin {
    name: string;
    defaults: IModelPluginSettings;
    ruleListeners: {
        [eventId: string]: IRuleNodeHandler;
    };
    tokenListeners: {
        [eventId: string]: ITokenNodeHandler;
    };
    getSettings: (request: IArgdownRequest) => IModelPluginSettings;
    prepare: IRequestHandler;
    run: IRequestHandler;
    constructor(config?: IModelPluginSettings);
}
