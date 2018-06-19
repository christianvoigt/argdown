import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { ITagData, IArgdownResponse } from "../IArgdownResponse";
export interface ITagPluginSettings {
    colorScheme?: string[];
    tags?: ITagData[];
}
export interface ITagPluginRequest {
    tagPlugin?: ITagPluginSettings;
    tagColorScheme?: string[];
    tags?: ITagData[];
}
export declare class TagPlugin implements IArgdownPlugin {
    name: string;
    defaults: ITagPluginSettings;
    constructor(config?: ITagPluginSettings);
    getSettings(request: IArgdownRequest): ITagPluginSettings;
    prepare: IRequestHandler;
    run: IRequestHandler;
    sortTags(tags: string[], response: IArgdownResponse): string[];
}
