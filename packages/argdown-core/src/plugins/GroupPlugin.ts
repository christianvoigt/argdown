import * as _ from "lodash";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IArgdownRequest, IArgdownResponse } from "../index";
import { IMapNode, ArgdownTypes, IGroupMapNode, ISection } from "../model/model";

export interface ISectionConfig extends ISection {
  statements?: string[];
  arguments?: string[];
}
export interface IGroupSettings {
  groupDepth?: number;
  regroup?: ISectionConfig[];
}
const defaultSettings: IGroupSettings = {
  groupDepth: 2
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
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): IGroupSettings => {
    if (request.group) {
      return request.group;
    } else {
      request.group = {};
      return request.group;
    }
  };
  prepare: IRequestHandler = (request, response) => {
    if (!response.statements) {
      throw new ArgdownPluginError(this.name, "No statements field in response.");
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(this.name, "No arguments field in response.");
    }
    if (!response.relations) {
      throw new ArgdownPluginError(this.name, "No relations field in response.");
    }
    _.defaultsDeep(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    if (!response.map) {
      throw new ArgdownPluginError(this.name, "No map field in response.");
    }
    const settings = this.getSettings(request);
    // Create group nodes and node tree structure
    const groupColorScheme =
      request.color && request.color.groupColorScheme
        ? request.color.groupColorScheme
        : ["#DADADA", "#BABABA", "#AAAAAA"];

    response.map!.nodes = createMapNodeTree(settings, groupColorScheme, response, response.map!.nodes);
  };
}
/**
 * Creates group nodes and returns a tree structure containing all group, statement and argument nodes of the map.
 */
const createMapNodeTree = (
  settings: IGroupSettings,
  groupColorScheme: string[],
  response: IArgdownResponse,
  nodes: IMapNode[]
): IMapNode[] => {
  const groupMap = createGroups(response, nodes);
  [...groupMap.values()].reduce(createAncestorGroups, groupMap);
  const groups = [...groupMap.values()];
  //normalize group levels
  const maxGroupLevel = groups.reduce((acc, curr) => (curr.level! > acc ? curr.level! : acc), 0);
  const minGroupLevel = maxGroupLevel - settings.groupDepth! + 1;
  const nodesWithSection = normalizeGroupLevels(minGroupLevel, groupColorScheme, groups);
  const nodesWithoutSection: IMapNode[] = nodes.filter(n => !findSection(response, n));
  return [...nodesWithSection, ...nodesWithoutSection];
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
          color: section.color,
          labelTitle: section.title,
          children: <IGroupMapNode[]>[],
          level: section.level,
          section: section
        };
        groupMap.set(section.id, group);
        if (section.parent) {
          group.parent = section.parent.id;
        }
      }
      group.children!.push(node);
    }
  }
  return groupMap;
};
const findSection = (response: IArgdownResponse, node: IMapNode): ISection | undefined | null => {
  if (node.type == ArgdownTypes.ARGUMENT_MAP_NODE) {
    let argument = response.arguments![node.title!];
    return argument.section;
  } else {
    let equivalenceClass = response.statements![node.title!];
    return equivalenceClass.section;
  }
};
const normalizeGroupLevels = (
  minGroupLevel: number,
  groupColorScheme: string[],
  groups: IGroupMapNode[]
): IMapNode[] => {
  const nodes: IMapNode[] = [];
  for (let group of groups) {
    group.level = group.level! - minGroupLevel;
    if (!group.color && group.level < groupColorScheme.length) {
      group.color = groupColorScheme[group.level];
    }
  }

  for (let group of groups) {
    if (group.level! < 0) {
      for (let node of group.children!) {
        if (node.type !== ArgdownTypes.GROUP_MAP_NODE || (<IGroupMapNode>node).level! >= 0) {
          nodes.push(node);
        }
      }
    } else if (!group.parent) {
      nodes.push(group);
    }
  }
  return nodes;
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
  while (currentGroup.parent) {
    let parentGroup = groupMap.get(currentGroup.parent);
    if (parentGroup) {
      parentGroup.children!.push(currentGroup);
      break;
    }
    const parentSection = currentGroup.section!.parent;
    if (parentSection) {
      if (parentSection.isGroup || parentSection.isGroup === undefined) {
        parentGroup = {
          type: ArgdownTypes.GROUP_MAP_NODE,
          id: parentSection.id,
          title: parentSection.title,
          color: parentSection.color,
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
      } else if (parentSection.parent) {
        currentGroup.parent = parentSection.parent.id;
      } else {
        break;
      }
    }
  }
  return groupMap;
};
