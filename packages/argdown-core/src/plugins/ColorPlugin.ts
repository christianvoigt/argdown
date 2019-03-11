import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { checkResponseFields } from "../ArgdownPluginError";
import { IArgdownRequest, IArgdownResponse } from "../index";
import {
  validateColorString,
  isString,
  isNumber,
  isObject,
  mergeDefaults,
  ensure,
  DefaultSettings
} from "../utils";
import { colorSchemes } from "./colorSchemes";
import {
  ISection,
  ArgdownTypes,
  IMapNode,
  isGroupMapNode
} from "../model/model";
import { ITagData } from "./ModelPlugin";
import defaultsDeep from "lodash.defaultsdeep";

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
   * colors of relation types
   */
  relationColors?: {
    attack?: string | number;
    support?: string | number;
    undercut?: string | number;
    entails?: string | number;
    contrary?: string | number;
    contradictory?: string | number;
  };
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
   * The color at index 0 will be used for untagged nodes.
   * The color at index n + 1 will be used for the tag at `tagsToColorize[n]`
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

const defaultSettings: DefaultSettings<IColorSettings> = {
  statementFontColor: "#000000",
  argumentFontColor: "#000000",
  groupFontColor: "#000000",
  colorScheme: colorSchemes["default"],
  groupColorScheme: ["#DADADA", "#BABABA", "#AAAAAA"],
  relationColors: ensure.object({
    attack: "#ff0000",
    support: "#00ff00",
    undercut: "#551A8B",
    entails: "#00ff00",
    contrary: "#ff0000",
    contradictory: "#ff0000"
  }),
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
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest): IColorSettings {
    if (!isObject(request.color)) {
      request.color = {};
    }
    return request.color;
  }
  run: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, ["statements", "arguments", "tags"]);

    //needs to be done here, to allow the DataPlugin to run in the same processor
    const settings = this.getSettings(request);
    mergeDefaults(settings, this.defaults);

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

    if (settings.colorizeByTag || settings.colorizeGroupsByTag) {
      for (let tagData of Object.values(response.tags!)) {
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
        } else {
          if (
            colorScheme &&
            tagData.occurrenceIndex !== undefined &&
            tagData.occurrenceIndex < colorScheme.length + 1
          ) {
            color = colorScheme[tagData.occurrenceIndex + 1]; // index 0 belongs to untagged nodes
          }
          if (
            groupColorScheme &&
            tagData.occurrenceIndex !== undefined &&
            tagData.occurrenceIndex < groupColorScheme.length + 1
          ) {
            groupColor = groupColorScheme[tagData.occurrenceIndex + 1]; // index 0 belongs to untagged groups
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
    for (let ec of Object.values(response.statements!)) {
      ec.fontColor = settings.statementFontColor;
      if (!settings.ignoreColorData && ec.data && ec.data.color !== undefined) {
        ec.color = getColor(colorScheme, ec.data.color);
      } else if (
        settings.statementColors &&
        settings.statementColors[ec.title!] !== undefined
      ) {
        ec.color = getColor(colorScheme, settings.statementColors[ec.title!]);
      } else if (settings.colorizeByTag && ec.tags && ec.tags.length > 0) {
        const tag = getTagWithHighestPriority(ec.tags, response.tags!);
        ec.color = getColor(colorScheme, tagColors[tag]);
      } else if (colorScheme && colorScheme.length > 0) {
        ec.color = colorScheme[0];
      }
      if (ec.relations) {
        ec.relations
          // .filter(r => r.from == ec)
          .forEach(r => {
            r.color = getColor(
              colorScheme,
              settings.relationColors![r.relationType]!
            );
          });
      }
    }
    for (let a of Object.values(response.arguments!)) {
      a.fontColor = settings.argumentFontColor;
      if (!settings.ignoreColorData && a.data && a.data.color !== undefined) {
        a.color = getColor(colorScheme, a.data.color);
      } else if (
        settings.argumentColors &&
        settings.argumentColors[a.title!] !== undefined
      ) {
        a.color = getColor(colorScheme, settings.argumentColors[a.title!]);
      } else if (settings.colorizeByTag && a.tags && a.tags.length > 0) {
        const tag = getTagWithHighestPriority(a.tags, response.tags!);
        a.color = getColor(colorScheme, tagColors[tag]);
      } else if (colorScheme && colorScheme.length > 0) {
        a.color = colorScheme[0];
      }
      if (a.relations) {
        a.relations
          // .filter(r => r.from == a)
          .forEach(r => {
            r.color = getColor(
              colorScheme,
              settings.relationColors![r.relationType]!
            );
          });
      }
    }
    const sectionsMap = createSectionsMap(response.sections!);
    for (let [, s] of sectionsMap) {
      colorizeSection(
        s,
        settings,
        groupColorScheme,
        groupTagColors,
        response.tags!
      );
    }
    // copy statement, argument and section colors to map nodes
    // create edge colors (we can not copy relation colors, as edge relationType might differ)
    if (response.map) {
      if (response.map.nodes) {
        for (let node of response.map.nodes) {
          colorNodesRecursive(response, sectionsMap, settings, node);
        }
      }
      if (response.map.edges) {
        for (let edge of response.map.edges) {
          edge.color = getColor(
            colorScheme,
            settings.relationColors![edge.relationType]!
          );
        }
      }
    }
  };
}

const colorNodesRecursive = (
  response: IArgdownResponse,
  sectionsMap: Map<string, ISection>,
  settings: IColorSettings,
  node: IMapNode
) => {
  if (isGroupMapNode(node)) {
    node.fontColor = settings.groupFontColor;
    const section = sectionsMap.get(node.id!)!;
    // because the group level can differ from the section level, we have to check if the section was colored by level
    // if that's the case, we have to recalculate the color based on the groupColorScheme.
    if (
      (!settings.ignoreColorData && section.data && section.data.color) ||
      (settings.groupColors && settings.groupColors[section.title!]) ||
      (settings.colorizeGroupsByTag && section.tags)
    ) {
      node.color = section.color;
    } else if (settings.groupColorScheme) {
      node.color =
        settings.groupColorScheme[
          Math.min(settings.groupColorScheme.length - 1, node.level! - 1)
        ];
    }
    if (node.children) {
      for (let child of node.children) {
        colorNodesRecursive(response, sectionsMap, settings, child);
      }
    }
  } else if (node.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
    node.fontColor = settings.argumentFontColor;
    node.color = response.arguments![node.title!].color;
  } else if (node.type === ArgdownTypes.STATEMENT_MAP_NODE) {
    node.fontColor = settings.statementFontColor;
    node.color = response.statements![node.title!].color;
  }
};
const createSectionsMap = (sections: ISection[]) => {
  const map = new Map<string, ISection>();
  for (let s of sections) {
    populateSectionsMapRecursive(s, map);
  }
  return map;
};
const populateSectionsMapRecursive = (
  section: ISection,
  sectionsMap: Map<string, ISection>
) => {
  sectionsMap.set(section.id, section);
  for (let child of section.children) {
    populateSectionsMapRecursive(child, sectionsMap);
  }
};

// Colors from the groupLevelColors field will be applied by the [[GroupPlugin]] after the group level has been set
const colorizeSection = (
  section: ISection,
  settings: IColorSettings,
  colorScheme: string[],
  tagColors: { [name: string]: string },
  tagDataDict: { [name: string]: ITagData }
) => {
  section.fontColor = settings.groupFontColor;
  if (
    !settings.ignoreColorData &&
    section.data &&
    section.data.color !== undefined
  ) {
    section.color = getColor(colorScheme, section.data.color);
  } else if (
    settings.groupColors &&
    settings.groupColors[section.title!] !== undefined
  ) {
    section.color = getColor(colorScheme, settings.groupColors[section.title!]);
  } else if (settings.colorizeGroupsByTag && section.tags) {
    const tag = getTagWithHighestPriority(section.tags, tagDataDict);
    section.color = getColor(colorScheme, tagColors[tag]);
  } else if (section.level && settings.groupColorScheme) {
    const index = Math.min(
      settings.groupColorScheme.length - 1,
      section.level - 1
    );
    section.color = settings.groupColorScheme[index];
  }
};

const getColor = (
  colorScheme: string[],
  color: string | number | ITagData
): string | undefined => {
  if (isString(color) && validateColorString(color)) {
    return color;
  } else if (
    isNumber(color) &&
    color < colorScheme.length &&
    validateColorString(colorScheme[color])
  ) {
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
const getTagWithHighestPriority = (
  tags: string[],
  tagDataDict: { [name: string]: ITagData }
): string => {
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
