import * as _ from "lodash";
import * as utils from "../utils";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { ITagData, IArgdownResponse } from "../IArgdownResponse";
import { ArgdownPluginError } from "../ArgdownPluginError";

export interface ITagPluginSettings {
  colorScheme?: string[];
  tags?: ITagData[];
}
export interface ITagPluginRequest {
  tagPlugin?: ITagPluginSettings;
  tagColorScheme?: string[];
  tags?: ITagData[];
}
const defaultSettings: ITagPluginSettings = {
  colorScheme: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]
};
export class TagPlugin implements IArgdownPlugin {
  name = "TagPlugin";
  defaults: ITagPluginSettings;
  constructor(config?: ITagPluginSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest): ITagPluginSettings {
    const r = request as ITagPluginRequest;
    if (!r.tagPlugin) {
      r.tagPlugin = {};
    }
    return r.tagPlugin;
  }
  prepare: IRequestHandler = request => {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
    const r = request as ITagPluginRequest;
    if (r.tagColorScheme) {
      settings.colorScheme = r.tagColorScheme;
    }
    if (r.tags) {
      settings.tags = r.tags;
    }
  };
  run: IRequestHandler = (request, response, logger) => {
    if (!response.tags) {
      throw new ArgdownPluginError(this.name, "Missing tags field in response.");
    }
    if (!response.statements) {
      throw new ArgdownPluginError(this.name, "Missing statements field in response.");
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(this.name, "Missing arguments field in response.");
    }
    response.tagsDictionary = {};

    let selectedTags: string[] = response.tags;
    const settings = this.getSettings(request);
    if (settings.tags) {
      selectedTags = [];
      for (let tagData of settings.tags) {
        if (tagData.tag) {
          selectedTags.push(tagData.tag);
        }
      }
    }
    const tagRequest = request as ITagPluginRequest;
    for (let tag of response.tags) {
      let tagData = null;
      if (settings.tags && tagRequest.tags) {
        let tagConfig = _.find(tagRequest.tags, { tag: tag });
        tagData = _.clone(tagConfig);
      }
      if (!tagData) {
        tagData = { tag: tag };
      }
      response.tagsDictionary[tag] = tagData;
      let index = selectedTags.indexOf(tag);
      tagData.cssClass = utils.stringToClassName("tag-" + tag);
      if (index > -1) {
        if (!tagData.color && index < settings.colorScheme!.length) {
          tagData.color = settings.colorScheme![index];
        }
        tagData.cssClass += " tag" + index;
        tagData.index = index;
      }
    }
    for (let title of Object.keys(response.statements)) {
      let equivalenceClass = response.statements[title];
      if (equivalenceClass.tags) {
        equivalenceClass.sortedTags = this.sortTags(equivalenceClass.tags, response);
      }
    }
    for (let title of Object.keys(response.arguments)) {
      let argument = response.arguments[title];
      if (argument.tags) {
        argument.sortedTags = this.sortTags(argument.tags, response);
      }
    }
  };
  sortTags(tags: string[], response: IArgdownResponse): string[] {
    const filtered = _.filter(tags, function(tag) {
      return response.tagsDictionary![tag].index != null;
    });
    const sorted = _.sortBy(filtered, function(tag) {
      return response.tagsDictionary![tag].index;
    });
    return sorted;
  }
}
