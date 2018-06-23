import * as _ from "lodash";
import * as utils from "../utils";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IArgdownRequest, IArgdownResponse } from "../index";

export interface ITagData {
  tag?: string;
  cssClass?: string;
  color?: string;
  index?: number;
}

export interface ITagPluginSettings {
  colorScheme?: string[];
  tags?: ITagData[];
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[TagPlugin]]
     */
    tagPlugin?: ITagPluginSettings;
    /**
     * A custom color scheme
     *
     * The color at index x will be used for the tag at `request.tags[index]` (see [[IArgdownRequest.tags]])
     */
    tagColorScheme?: string[];
    /**
     * The manually selected tags that will be colored with the colors from the [[IArgdownRequest.tagColorScheme]]
     *
     * The tag at index x will be colored with the color from `request.tagColorScheme[index]`
     *
     * If no tags are manually selected, the tags will be colored by first appearance in the Argdown document.
     */
    tags?: ITagData[];
  }
  interface IArgdownResponse {
    /**
     * A list of all tags used in the Argdown input.
     *
     * Provided by the ModelPlugin
     */
    tags?: string[];
    /**
     * A dictionary of [[ITagData]] objects for each tag used.
     *
     * Provided by the TagPlugin.
     */
    tagsDictionary?: { [tagName: string]: ITagData };
  }
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
    request.tagPlugin = request.tagPlugin || {};
    return request.tagPlugin;
  }
  prepare: IRequestHandler = request => {
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
    if (request.tagColorScheme) {
      settings.colorScheme = request.tagColorScheme;
    }
    if (request.tags) {
      settings.tags = request.tags;
    }
  };
  run: IRequestHandler = (request, response) => {
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
    for (let tag of response.tags) {
      let tagData = null;
      if (settings.tags && request.tags) {
        let tagConfig = _.find(request.tags, { tag: tag });
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
