import * as _ from "lodash";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IArgdownRequest } from "../index";
import { validateColorString, isString, isNumber, isObject } from "../utils";
import { colorSchemes } from "./colorSchemes";
import { ISection } from "../model/model";
import { ITagData } from "./ModelPlugin";

export interface IColorSettings {
  /**
   * Color of text for argument nodes
   */
  argumentFontColor?: string;
  /**
   * Color of text for statement nodes
   */
  statementFontColor?: string;
  /**
   * Color of text for group nodes
   */
  groupFontColor?: string;
  /**
   * Should arguments and statements be colorized by tag?
   */
  colorizeByTag?: boolean;
  /**
   * Should group be colorized by tag?
   */
  colorizeGroupsByTag?: boolean;
  /**
   * A custom color scheme
   *
   * The color at index x will be used for the tag at `tagsToColorize[index]`
   */
  colorScheme?: string[] | string;
  /**
   * Can be used to explicitely set colors for specific sets
   */
  tagColors?: { [tagName: string]: string | number | ITagData };
  /**
   * A dictionary mapping statement title to colors
   */
  statementColors?: { [title: string]: string | number };
  /**
   * A dictionary mapping argument title to colors
   */
  argumentColors?: { [title: string]: string | number };
  /**
   * A dictionary mapping group title to colors
   */
  groupColors?: { [title: string]: string | number };
  /**
   * Color scheme for groups.
   *
   * By default this will be applied by group level.
   * Can also be used with colorizeGroupsByTags
   */
  groupColorScheme?: string[];
  /**
   * Should colors defined in data elements be ignored?
   */
  ignoreColorData?: boolean;
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for colorization
     */
    color?: IColorSettings;
  }
}

const defaultSettings: IColorSettings = {
  colorScheme: colorSchemes["default"],
  groupColorScheme: ["#DADADA", "#BABABA", "#AAAAAA"],
  colorizeByTag: true,
  colorizeGroupsByTag: false
};
/**
 * Colorizes arguments and equivalence classes.
 *
 * - if [[IColorSettings.ignoreColorData]] is false, it first looks for the color defined in the elements YAML data.
 * - takes the color from [[IColorSettings.statmentColors]] or [[IColorSettings.argumentColors]] if one was defined for this element.
 * - if [[IColorSettings.colorizeByTag]] is true, it finally gives the element the color that corresponds to the [[IArgdownResponse.tagColors]] index of the elements first tag.
 */
export class ColorPlugin implements IArgdownPlugin {
  name = "ColorPlugin";
  defaults: IColorSettings;
  constructor(config?: IColorSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest): IColorSettings {
    request.color = request.color || {};
    return request.color;
  }
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
    //needs to be done here, to allow the DataPlugin to run in the same processor
    const settings = this.getSettings(request);
    _.defaultsDeep(settings, this.defaults);
    const tagColors: { [tagName: string]: string } = {};
    const groupTagColors: { [tagName: string]: string } = {};
    let colorScheme: string[];
    if (typeof settings.colorScheme === "string") {
      colorScheme = colorSchemes[settings.colorScheme];
      if (!colorScheme) {
        colorScheme = colorSchemes["default"];
      }
    } else {
      colorScheme = settings.colorScheme!;
    }
    let groupColorScheme: string[] = settings.groupColorScheme!;

    if (settings.colorizeByTag) {
      for (let tagData of Object.values(response.tags)) {
        const tag = tagData.tag;
        if (!tag) {
          continue;
        }
        let color: string | undefined = undefined;
        let groupColor: string | undefined = undefined;
        if (settings.tagColors && settings.tagColors[tag] !== undefined) {
          const tagColorsEntry = settings.tagColors[tag];
          color = getColor(colorScheme, tagColorsEntry);
          groupColor = getColor(groupColorScheme, settings.tagColors[tag]);
          if (isObject(tagColorsEntry)) {
            tagData.priority = tagColorsEntry.priority;
          }
        } else if (colorScheme) {
          if (tagData.occurrenceIndex !== undefined && tagData.occurrenceIndex < colorScheme.length) {
            color = colorScheme[tagData.occurrenceIndex];
          }
          if (tagData.occurrenceIndex !== undefined && tagData.occurrenceIndex < groupColorScheme.length) {
            groupColor = groupColorScheme[tagData.occurrenceIndex];
          }
        }
        if (tag !== undefined && color !== undefined) {
          tagColors[tag] = color;
          tagData.color = color;
        }
        if (tag !== undefined && groupColor !== undefined) {
          groupTagColors[tag] = groupColor;
        }
      }
    }
    for (let ec of Object.values(response.statements)) {
      if (!settings.ignoreColorData && ec.data && ec.data.color !== undefined) {
        ec.color = getColor(colorScheme, ec.data.color);
      } else if (settings.statementColors && settings.statementColors[ec.title!] !== undefined) {
        ec.color = getColor(colorScheme, settings.statementColors[ec.title!]);
      } else if (settings.colorizeByTag && ec.tags) {
        const tag = getTagWithHighestPriority(ec.tags, response.tags);
        ec.color = getColor(colorScheme, tagColors[tag]);
      }
    }
    for (let a of Object.values(response.arguments)) {
      if (!settings.ignoreColorData && a.data && a.data.color !== undefined) {
        a.color = getColor(colorScheme, a.data.color);
      } else if (settings.argumentColors && settings.argumentColors[a.title!] !== undefined) {
        a.color = getColor(colorScheme, settings.argumentColors[a.title!]);
      } else if (settings.colorizeByTag && a.tags) {
        const tag = getTagWithHighestPriority(a.tags, response.tags);
        a.color = getColor(colorScheme, tagColors[tag]);
      }
    }

    for (let s of Object.values(response.sections!)) {
      colorizeSectionsRecursive(s, settings, groupColorScheme, groupTagColors, response.tags);
    }
  };
}

// Colors from the groupLevelColors field will be applied by the [[GroupPlugin]] after the group level has been set
const colorizeSectionsRecursive = (
  section: ISection,
  settings: IColorSettings,
  colorScheme: string[],
  tagColors: { [name: string]: string },
  tagDataDict: { [name: string]: ITagData }
) => {
  if (!settings.ignoreColorData && section.data && section.data.color !== undefined) {
    section.color = getColor(colorScheme, section.data.color);
  } else if (settings.groupColors && settings.groupColors[section.title!] !== undefined) {
    section.color = getColor(colorScheme, settings.groupColors[section.title!]);
  } else if (settings.colorizeGroupsByTag && section.tags) {
    const tag = getTagWithHighestPriority(section.tags, tagDataDict);
    section.color = getColor(colorScheme, tagColors[tag]);
  }
  if (section.children) {
    for (let child of section.children) {
      colorizeSectionsRecursive(child, settings, colorScheme, tagColors, tagDataDict);
    }
  }
};

const getColor = (colorScheme: string[], color: string | number | ITagData): string | undefined => {
  if (isString(color) && validateColorString(color)) {
    return color;
  } else if (isNumber(color) && color < colorScheme.length && validateColorString(colorScheme[color])) {
    return colorScheme[color];
  } else if (isObject(color)) {
    const tagData = <ITagData>color;
    if (isString(tagData.color)) {
      return tagData.color;
    } else if (isNumber(tagData.color)) {
      return colorScheme[tagData.color];
    }
  }
  return;
};
const getTagWithHighestPriority = (tags: string[], tagDataDict: { [name: string]: ITagData }): string => {
  return tags.length === 0
    ? tags[0]
    : tags.reduce<string>((acc: string, curr: string) => {
        const currTagData = tagDataDict[curr];
        const accTagData = tagDataDict[acc];
        if (currTagData && accTagData) {
          if ((currTagData.priority || 0) > (accTagData.priority || 0)) {
            return curr;
          } else {
            return acc;
          }
        }
        return curr;
      }, "");
};
