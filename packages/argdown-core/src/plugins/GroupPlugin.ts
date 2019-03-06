import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IArgdownRequest, IArgdownResponse } from "../index";
import {
  IMapNode,
  ArgdownTypes,
  IGroupMapNode,
  ISection,
  isGroupMapNode
} from "../model/model";
import { mergeDefaults, ensure, DefaultSettings, isObject } from "../utils";
import defaultsDeep from "lodash.defaultsdeep";

export interface ISectionConfig extends ISection {
  statements?: string[];
  arguments?: string[];
}
export interface IGroupSettings {
  groupDepth?: number;
  regroup?: ISectionConfig[];
  sections?: { [key: string]: { isGroup?: boolean; isClosed?: boolean } };
  ignoreIsClosed?: boolean;
  ignoreIsGroup?: boolean;
}
const defaultSettings: DefaultSettings<IGroupSettings> = {
  groupDepth: 2,
  sections: ensure.object({}),
  regroup: ensure.array([])
};
declare module "../index" {
  interface IArgdownRequest {
    group?: IGroupSettings;
  }
}
/**
 * Creates groups from sections.
 *
 * Transforms the response.map.nodes array into a tree of group nodes
 * containing statement, argument or other group nodes as children.
 *
 * If a statement or argument has no section, it will remain a root element of the tree.
 *
 * This plugin should be run after the [[MapPlugin]]
 */
export class GroupPlugin implements IArgdownPlugin {
  name = "GroupPlugin";
  defaults: IGroupSettings;
  constructor(config?: IGroupSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): IGroupSettings => {
    if (isObject(request.group)) {
      return request.group;
    } else {
      request.group = {};
      return request.group;
    }
  };
  prepare: IRequestHandler = (request, response) => {
    if (!response.statements) {
      throw new ArgdownPluginError(
        this.name,
        "No statements field in response."
      );
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(
        this.name,
        "No arguments field in response."
      );
    }
    if (!response.relations) {
      throw new ArgdownPluginError(
        this.name,
        "No relations field in response."
      );
    }
    let settings = this.getSettings(request);
    mergeDefaults(settings, this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    if (!response.map) {
      throw new ArgdownPluginError(this.name, "No map field in response.");
    }
    const settings = this.getSettings(request);
    // Create group nodes and node tree structure
    const minGroupLevel =
      (response.maxSectionLevel || 0) - settings.groupDepth! + 1;
    if (response.sections) {
      response.sections = response.sections.map(s =>
        setIsGroupRecursive(s, minGroupLevel)
      );
    }

    response.map!.nodes = createMapNodeTree(response, response.map!.nodes);
  };
}
/**
 * Creates group nodes and returns a tree structure containing all group, statement and argument nodes of the map.
 */
const createMapNodeTree = (
  response: IArgdownResponse,
  nodes: IMapNode[]
): IMapNode[] => {
  const groupMap = createGroups(response, nodes);
  [...groupMap.values()].reduce(createAncestorGroups, groupMap);
  const groups = [...groupMap.values()];
  const topLevelGroups = groups.filter(g => !g.parent);
  for (let group of topLevelGroups) {
    setGroupLevelsRecursive(group);
  }
  const nodesWithoutSection: IMapNode[] = nodes.filter(
    n => !findSection(response, n)
  );
  return [...topLevelGroups, ...nodesWithoutSection];
};
/// Sets isGroup for all sections that have not already an isGroup property.
/// isGroup = section.level - ((maxSectionLevel - groupDepth) + 1) >= 0;
const setIsGroupRecursive = (section: ISection, minGroupLevel: number) => {
  if (section.isGroup === undefined) {
    section.isGroup = section.level >= minGroupLevel;
  }
  if (section.children) {
    for (let child of section.children) {
      setIsGroupRecursive(child, minGroupLevel);
    }
  }
  return section;
};

const createGroups = (response: IArgdownResponse, nodes: IMapNode[]) => {
  const groupMap = new Map<string, IGroupMapNode>();
  for (let node of nodes) {
    let section = findSection(response, node);
    if (section) {
      let group: IGroupMapNode | undefined = groupMap.get(section.id);
      if (!group) {
        group = {
          type: ArgdownTypes.GROUP_MAP_NODE,
          id: section.id,
          title: section.title,
          labelTitle: section.title,
          children: <IMapNode[]>[],
          level: section.level,
          section: section,
          isClosed: section.isClosed
        };
        groupMap.set(section.id, group);
        let parentSection = section.parent;
        while (parentSection && parentSection.isGroup === false) {
          parentSection = parentSection.parent;
        }
        if (parentSection) {
          group.parent = parentSection.id;
        }
      }
      group.children!.push(node);
    }
  }
  return groupMap;
};
const findSection = (
  response: IArgdownResponse,
  node: IMapNode
): ISection | undefined | null => {
  let section = null;
  if (node.type == ArgdownTypes.ARGUMENT_MAP_NODE) {
    let argument = response.arguments![node.title!];
    section = argument.section;
  } else {
    let equivalenceClass = response.statements![node.title!];
    section = equivalenceClass.section;
  }
  while (section && section.isGroup === false) {
    section = section.parent;
  }
  return section;
};
const setGroupLevelsRecursive = (
  currentGroup: IGroupMapNode,
  parentLevel: number = 0
): IGroupMapNode => {
  currentGroup.level = parentLevel + 1;
  if (currentGroup.children) {
    for (let child of currentGroup.children) {
      if (isGroupMapNode(child)) {
        setGroupLevelsRecursive(child, currentGroup.level);
      }
    }
  }
  return currentGroup;
};
/**
 * Creates all ancestor groups of a group that are not already existing.
 * Ignores sections with isGroup false.
 * @param acc A map of all groups so far
 * @param curr The group
 * @returns The original group map with the new groups added
 */
const createAncestorGroups = (
  groupMap: Map<string, IGroupMapNode>,
  group: IGroupMapNode
): Map<string, IGroupMapNode> => {
  let currentGroup = group;
  let parentSection = currentGroup.section!.parent;
  while (currentGroup.parent) {
    let parentGroup = groupMap.get(currentGroup.parent);
    if (parentGroup) {
      parentGroup.children!.push(currentGroup);
      break;
    }
    if (parentSection) {
      if (parentSection.isGroup || parentSection.isGroup === undefined) {
        parentGroup = {
          type: ArgdownTypes.GROUP_MAP_NODE,
          id: parentSection.id,
          title: parentSection.title,
          labelTitle: parentSection.title,
          children: [currentGroup],
          level: parentSection.level,
          section: parentSection
        };
        if (parentSection.parent) {
          parentGroup.parent = parentSection.parent.id;
        }
        groupMap.set(currentGroup.parent, parentGroup);
        currentGroup = parentGroup;
        parentSection = currentGroup.section!.parent;
      } else if (parentSection.parent) {
        currentGroup.parent = parentSection.parent.id;
        parentSection = parentSection.parent;
      } else {
        currentGroup.parent = undefined;
        break;
      }
    }
  }
  return groupMap;
};
