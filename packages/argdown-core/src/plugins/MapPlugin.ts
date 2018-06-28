import * as _ from "lodash";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { reduceToMap } from "../utils";
import { IArgdownRequest, IArgdownResponse } from "../index";
import {
  IMap,
  IMapNode,
  IEquivalenceClass,
  IArgument,
  StatementRole,
  RelationMember,
  ArgdownTypes,
  IRelation,
  IMapEdge,
  IPCSStatement,
  RelationType,
  IConclusion,
  IStatement,
  IGroupMapNode,
  ISection,
  IInference,
  isArgumentStatement,
  isConclusion
} from "../model/model";
/**
 * The StatementSelectionMode in the [[IMapSettings]] determines which statements will be added as nodes to the argument map.
 */
export enum StatementSelectionMode {
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
export enum LabelMode {
  HIDE_UNTITLED = "hide-untitled",
  TITLE = "title",
  TEXT = "text"
}
export enum GroupMode {
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
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[MapPlugin]]
     **/
    map?: IMapSettings;
  }
  interface IArgdownResponse {
    /**
     * Argument map data provided by the [[MapPlugin]]
     *
     */
    map?: IMap;
  }
}
const defaultSettings: IMapSettings = {
  statementSelectionMode: StatementSelectionMode.WITH_TITLE,
  argumentLabelMode: LabelMode.HIDE_UNTITLED,
  statementLabelMode: LabelMode.HIDE_UNTITLED,
  excludeDisconnected: true,
  selectElementsWithoutSection: true,
  selectElementsWithoutTag: true,
  groupMode: GroupMode.HEADING,
  groupDepth: 2,
  addTags: true
};
export class MapPlugin implements IArgdownPlugin {
  name = "MapPlugin";
  defaults: IMapSettings;
  constructor(config?: IMapSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): IMapSettings => {
    if (request.map) {
      return request.map;
    } else {
      request.map = {};
      return request.map;
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
    response.map = this.makeMap(request, response);
  };
  makeMap(request: IArgdownRequest, response: IArgdownResponse): IMap {
    const settings = this.getSettings(request);
    // 1) Preselection round: Select elements by intrinsic criteria
    // 1.1) Preselect statements by tag and section
    let selectedStatements = Object.keys(response.statements!)
      .map<IEquivalenceClass>(title => response.statements![title])
      .filter(isPreselected(settings));
    let selectedStatementsMap = reduceToMap(selectedStatements, curr => curr.title!);

    // 1.2) Preselect arguments by tag and section
    const allArguments = Object.keys(response.arguments!).map<IArgument>(title => response.arguments![title]);
    // const selectedArguments = allArguments.filter(isArgumentSelected(settings, response));
    let selectedArguments = allArguments.filter(isPreselected(settings));
    let selectedArgumentsMap = reduceToMap(selectedArguments, curr => curr.title!);

    // 2) Selection round: Select elements by extrinsic criteria, taking intrinsic preselection into account
    // 2.1) Select statements from preselection based on statementSelectionMode, taking preselection into account
    selectedStatements = selectedStatements.filter(
      isStatementSelected(settings, selectedStatementsMap, selectedArgumentsMap)
    );
    selectedStatementsMap = reduceToMap(selectedStatements, curr => curr.title!);

    // 2.2) Select arguments from preselection, taking argument preselection and statement selection into account
    selectedArguments = selectedArguments.filter(
      isArgumentSelected(settings, response, selectedStatementsMap, selectedArgumentsMap)
    );
    selectedArgumentsMap = reduceToMap(selectedArguments, curr => curr.title!);

    // 3) Create nodes
    // 3.1) Create statement nodes
    let nodeCount = 0;
    const statementNodes = selectedStatements.map<IMapNode>(createStatementNode(settings, nodeCount));
    const statementNodesMap = reduceToMap<string, IMapNode>(statementNodes, curr => curr.title!);
    nodeCount += statementNodes.length;
    // 3.2) Create argument nodes
    const argumentNodes = selectedArguments.map<IMapNode>(createArgumentNode(settings, nodeCount));
    const argumentNodesMap = reduceToMap<string, IMapNode>(argumentNodes, curr => curr.title!);
    nodeCount += argumentNodes.length;
    // 3.3) Create group nodes and node tree structure
    const nodes = createMapNodeTree(settings, response, statementNodes.concat(argumentNodes));

    // 4) Select relations
    const selectedRelations = response.relations!.filter(
      isRelationSelected(selectedStatementsMap, selectedArgumentsMap)
    );
    // 5) Create edges
    // 5.1) Create edges from relations
    const edges = selectedRelations.reduce<IMapEdge[]>(
      createEdgesFromRelation(statementNodesMap, argumentNodesMap),
      []
    );
    // 5.2) Create edges from equivalences
    edges.push(
      ...createSupportEdgesFromEquivalences(
        response,
        edges.length,
        statementNodes,
        statementNodesMap,
        argumentNodes,
        argumentNodesMap
      )
    );
    return <IMap>{
      nodes,
      edges
    };
  }
}
const isPreselected = (settings: IMapSettings) => (el: IEquivalenceClass | IArgument) => {
  const sectionSelected =
    !settings.selectedSections ||
    (!el.section && settings.selectElementsWithoutSection) ||
    (el.section && settings.selectedSections.indexOf(el.section!.title!) > -1);
  const tagSelected =
    !settings.selectedTags ||
    (!el.tags && settings.selectElementsWithoutTag) ||
    (el.tags && el.tags.find(t => settings.selectedTags!.indexOf(t) > -1));
  return sectionSelected && tagSelected;
};
const untitledPattern = /^Untitled/;
const isStatementSelected = (
  settings: IMapSettings,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => (equivalenceClass: IEquivalenceClass) => {
  const withRelations =
    equivalenceClass.relations!.length > 0 &&
    undefined !==
      equivalenceClass.relations!.find(r =>
        otherRelationMemberIsInSelection(r, equivalenceClass, selectedStatements, selectedArguments)
      );
  const usedInArgument = equivalenceClass.members.find(isUsedInSelectedArgument(selectedArguments));
  let inSelection = false;
  switch (settings.statementSelectionMode) {
    case StatementSelectionMode.ALL:
      inSelection = true;
      break;
    case StatementSelectionMode.WITH_TITLE:
      inSelection = (!usedInArgument && withRelations) || !untitledPattern.exec(equivalenceClass.title!);
      break;
    case StatementSelectionMode.TOP_LEVEL:
      inSelection = (!usedInArgument && withRelations) || !!equivalenceClass.isUsedAsTopLevelStatement;
      break;
    case StatementSelectionMode.WITH_RELATIONS:
      inSelection = withRelations;
      break;
    case StatementSelectionMode.NOT_USED_IN_ARGUMENT:
      inSelection = !usedInArgument;
      break;
    case StatementSelectionMode.WITH_MORE_THAN_ONE_RELATION:
      const nrOfRelationPartners = equivalenceClass.relations!.reduce((acc, r) => {
        return countOtherRelationMembersInSelection(acc, r, equivalenceClass, selectedStatements, selectedArguments);
      }, 0);
      inSelection = withRelations && (!usedInArgument || nrOfRelationPartners > 1);
      break;
  }
  return (!settings.excludeDisconnected || (usedInArgument || withRelations)) && inSelection;
};
const isUsedInSelectedArgument = (selectedArguments: Map<string, IArgument>) => (statement: IStatement) => {
  if (isArgumentStatement(statement) && statement.role !== StatementRole.PRELIMINARY_CONCLUSION) {
    return selectedArguments.get(statement.argumentTitle!) !== undefined;
  }
  return false;
};
const isPCSStatementConnectedByEquivalence = (
  response: IArgdownResponse,
  s: IPCSStatement,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
): boolean => {
  if (s.role === StatementRole.MAIN_CONCLUSION || s.role === StatementRole.PREMISE) {
    let requiredRole = StatementRole.MAIN_CONCLUSION;
    if (s.role === StatementRole.MAIN_CONCLUSION) {
      requiredRole = StatementRole.PREMISE;
    }
    if (selectedStatements.get(s.title!) !== undefined) {
      return true;
    }
    const ec = response.statements![s.title!];
    return (
      undefined !==
      ec.members.find(
        s => s.role === requiredRole && selectedArguments.get((<IPCSStatement>s).argumentTitle!) !== undefined
      )
    );
  }
  return false;
};
/**
 * Selects arguments if
 *  - either settings.excludeDisconnected is false
 *  - or one of the following conditions applies:
 *    - argument.relations is not empty
 *    - a premise is supported/attacked by another argument or selected statement
 *    - the main conclusion is supporting/attacking another argument or selected statement
 *    - an inference is undercut by an argument or a selected statement
 *    - implicit support: a premise is equivalent with a main conclusion of another argument or a selected statement
 *    - implicit support: the main conclusion is equivalent with a premise of another argument or a selected statement
 */
const isArgumentSelected = (
  settings: IMapSettings,
  response: IArgdownResponse,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => (argument: IArgument) => {
  if (!settings.excludeDisconnected) {
    return true;
  }
  let hasConnections = false;
  if (argument.relations && argument.relations.length > 0) {
    hasConnections =
      undefined !==
      argument.relations.find(r =>
        otherRelationMemberIsInSelection(r, argument, selectedStatements, selectedArguments)
      );
  }
  if (hasConnections) {
    return true;
  }
  if (argument.pcs && argument.pcs.length > 0) {
    hasConnections =
      undefined !==
      argument.pcs.find(s => {
        let hasConnections = false;
        if (isConclusion(s) && (<IConclusion>s).inference!.relations!.length > 0) {
          const inference = (<IConclusion>s).inference!;
          hasConnections =
            undefined !==
            inference.relations!.find(r =>
              otherRelationMemberIsInSelection(r, inference, selectedStatements, selectedArguments)
            );
        }
        if (hasConnections) {
          return true;
        }
        const equivalenceClass = response.statements![s.title!];
        if (equivalenceClass.relations) {
          hasConnections =
            undefined !==
            equivalenceClass.relations.find(r =>
              otherRelationMemberIsInSelection(r, equivalenceClass, selectedStatements, selectedArguments)
            );
          if (hasConnections) {
            return true;
          }
        }
        if (hasConnections) {
          return true;
        }
        return isPCSStatementConnectedByEquivalence(response, s, selectedStatements, selectedArguments);
      });
  }
  return hasConnections;
};
const countOtherRelationMembersInSelection = (
  currentCount: number,
  relation: IRelation,
  relationMember: RelationMember,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
): number => {
  const other = relation.from === relationMember ? relation.to! : relation.from!;
  if (other.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    if (selectedStatements.get(relationMember.title!) === undefined) {
      return currentCount;
    }
    let role = StatementRole.MAIN_CONCLUSION;
    if (relation.to === other) {
      role = StatementRole.PREMISE;
    }
    return other.members!.reduce(
      (acc, s) =>
        s.role === role && selectedArguments.get((<IPCSStatement>s).argumentTitle!) !== undefined ? acc + 1 : acc,
      currentCount
    );
  } else if (other.type === ArgdownTypes.ARGUMENT && selectedArguments.get(other.title!) !== undefined) {
    return currentCount + 1;
  } else if (other.type === ArgdownTypes.INFERENCE && selectedArguments.get(other.argumentTitle!) !== undefined) {
    return currentCount + 1;
  }
  return currentCount;
};
const otherRelationMemberIsInSelection = (
  relation: IRelation,
  relationMember: RelationMember,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => {
  const other = relation.from === relationMember ? relation.to! : relation.from!;
  return relationMemberIsInSelection(relation, other, selectedStatements, selectedArguments);
};
const relationMemberIsInSelection = (
  relation: IRelation,
  relationMember: RelationMember,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => {
  if (relationMember.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    if (selectedStatements.get(relationMember.title!)) {
      return true;
    }
    let role = StatementRole.MAIN_CONCLUSION;
    if (relation.to === relationMember) {
      role = StatementRole.PREMISE;
    }
    return (
      undefined !==
      relationMember.members.find(
        s => s.role === role && selectedArguments.get((<IPCSStatement>s).argumentTitle!) !== undefined
      )
    );
  } else if (relationMember.type === ArgdownTypes.ARGUMENT && selectedArguments.get(relationMember.title!)) {
    return true;
  } else if (relationMember.type === ArgdownTypes.INFERENCE && selectedArguments.get(relationMember.argumentTitle!)) {
    return true;
  }
  return false;
};
const isRelationSelected = (
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => (relation: IRelation): boolean => {
  return (
    relationMemberIsInSelection(relation, relation.from!, selectedStatements, selectedArguments) &&
    relationMemberIsInSelection(relation, relation.to!, selectedStatements, selectedArguments)
  );
};
const createStatementNode = (settings: IMapSettings, initialNodeCount: number) => (
  ec: IEquivalenceClass,
  index: number
) => {
  const node: IMapNode = {
    type: ArgdownTypes.STATEMENT_MAP_NODE,
    title: ec.title,
    id: "n" + Number(initialNodeCount + index)
  };
  if (settings.statementLabelMode !== LabelMode.TEXT || _.isEmpty(node.labelText)) {
    if (settings.statementLabelMode === LabelMode.TITLE || !ec.title!.startsWith("Untitled")) {
      node.labelTitle = ec.title;
    }
  }
  if (settings.statementLabelMode !== LabelMode.TITLE) {
    node.labelText = IEquivalenceClass.getCanonicalMemberText(ec) || undefined;
  }
  if (settings.addTags && ec.sortedTags) {
    node.tags = ec.sortedTags;
  }
  return node;
};
const createArgumentNode = (settings: IMapSettings, initialNodeCount: number) => (a: IArgument, index: number) => {
  const node: IMapNode = {
    title: a.title,
    type: ArgdownTypes.ARGUMENT_MAP_NODE,
    id: "n" + Number(initialNodeCount + index)
  };
  if (settings.argumentLabelMode != LabelMode.TITLE) {
    node.labelText = IArgument.getCanonicalMemberText(a) || undefined;
  }
  if (settings.argumentLabelMode !== LabelMode.TEXT || _.isEmpty(node.labelText)) {
    if (!a.title!.startsWith("Untitled") || settings.argumentLabelMode == LabelMode.TITLE) {
      node.labelTitle = a.title;
    }
  }
  if (settings.addTags && a.sortedTags) {
    node.tags = a.sortedTags;
  }
  return node;
};
const createEdgesFromRelation = (statementNodesMap: Map<string, IMapNode>, argumentNodesMap: Map<string, IMapNode>) => (
  acc: IMapEdge[],
  rel: IRelation
): IMapEdge[] => {
  const froms: IMapNode[] = [];
  const tos: IMapNode[] = [];
  if (rel.from!.type === ArgdownTypes.ARGUMENT) {
    froms.push(argumentNodesMap.get(rel.from!.title!)!);
  } else if (rel.from!.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    const statementNode = statementNodesMap.get(rel.from!.title!);
    if (statementNode) {
      froms.push(statementNode);
    } else {
      const ec = <IEquivalenceClass>rel.from!;
      ec.members.reduce((acc, s) => {
        if (s.role === StatementRole.MAIN_CONCLUSION) {
          const node = argumentNodesMap.get((<IPCSStatement>s).argumentTitle!);
          if (node) {
            acc.push(node);
          }
        }
        return acc;
      }, froms);
    }
  }
  if (rel.to!.type === ArgdownTypes.ARGUMENT) {
    tos.push(argumentNodesMap.get(rel.to!.title!)!);
  } else if (rel.to!.type === ArgdownTypes.INFERENCE) {
    const argumentNode = argumentNodesMap.get((<IInference>rel.to).argumentTitle!);
    tos.push(argumentNode!);
  } else if (rel.to!.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    const statementNode = statementNodesMap.get(rel.to!.title!);
    if (statementNode) {
      tos.push(statementNode);
    } else {
      const ec = <IEquivalenceClass>rel.to;
      ec.members.reduce((acc, s) => {
        if (s.role === StatementRole.PREMISE) {
          const node = argumentNodesMap.get((<IPCSStatement>s).argumentTitle!);
          if (node) {
            acc.push(node);
          }
        }
        return acc;
      }, tos);
    }
  }
  for (let from of froms) {
    for (let to of tos) {
      const edge1: IMapEdge = {
        type: ArgdownTypes.MAP_EDGE,
        from: from,
        to: to,
        id: "e" + Number(acc.length + 1),
        relationType: rel.relationType
      };
      acc.push(edge1);
      if (rel.from!.type === ArgdownTypes.EQUIVALENCE_CLASS) {
        edge1.fromEquivalenceClass = <IEquivalenceClass>rel.from;
      }
      if (rel.to!.type === ArgdownTypes.EQUIVALENCE_CLASS) {
        edge1.toEquivalenceClass = <IEquivalenceClass>rel.to;
      }
      if (rel.relationType === RelationType.CONTRADICTORY) {
        edge1.relationType = RelationType.ATTACK;
        const edge2: IMapEdge = {
          type: ArgdownTypes.MAP_EDGE,
          from: to,
          to: from,
          id: "e" + Number(acc.length + 1),
          relationType: RelationType.ATTACK,
          fromEquivalenceClass: edge1.toEquivalenceClass,
          toEquivalenceClass: edge1.fromEquivalenceClass
        };
        acc.push(edge2);
      } else if (rel.relationType === RelationType.CONTRARY) {
        edge1.relationType = RelationType.ATTACK;
      } else if (rel.relationType === RelationType.ENTAILS) {
        edge1.relationType = RelationType.SUPPORT;
      }
    }
  }
  return acc;
};
/**
 * Add implicit support edges derived from statement-statement equivalences:
 * 1. For all argument-nodes: Create support edges for conclusion-in-argument-node +> statement-node equivalences
 * 2. For all argument-nodes: Create support edges for conclusion-in-argument-node +> premise-in-argument-node
 * 3. For all statement-nodes: Create support edges for statement-node +> premise-in-argument-node equivalences
 **/
const createSupportEdgesFromEquivalences = (
  response: IArgdownResponse,
  initialEdgeCount: number,
  statementNodes: IMapNode[],
  statementNodesMap: Map<string, IMapNode>,
  argumentNodes: IMapNode[],
  argumentNodesMap: Map<string, IMapNode>
): IMapEdge[] => {
  const edges: IMapEdge[] = [];
  for (let argumentNode of argumentNodes) {
    const argument = response.arguments![argumentNode.title!];
    if (argument.pcs.length == 0) {
      continue;
    }
    const conclusion = argument.pcs[argument.pcs.length - 1];
    const ec = response.statements![conclusion.title!];
    const statementNode = statementNodesMap.get(conclusion.title!);
    // 1)
    if (statementNode) {
      edges.push({
        type: ArgdownTypes.MAP_EDGE,
        relationType: RelationType.SUPPORT,
        from: argumentNode,
        to: statementNode,
        fromEquivalenceClass: ec,
        toEquivalenceClass: ec,
        id: "e" + Number(initialEdgeCount + edges.length + 1)
      });
      continue;
    }
    // 2)
    for (let statement of ec.members) {
      if (statement.role === StatementRole.PREMISE) {
        const argumentNode2 = argumentNodesMap.get((<IPCSStatement>statement).argumentTitle!);
        if (argumentNode2) {
          edges.push({
            type: ArgdownTypes.MAP_EDGE,
            relationType: RelationType.SUPPORT,
            from: argumentNode,
            to: argumentNode2,
            fromEquivalenceClass: ec,
            toEquivalenceClass: ec,
            id: "n" + Number(initialEdgeCount + edges.length + 1)
          });
        }
      }
    }
  }
  for (let statementNode of statementNodes) {
    const ec = response.statements![statementNode.title!];
    for (let statement of ec.members) {
      if (statement.role === StatementRole.PREMISE) {
        const argumentNode = argumentNodesMap.get((<IPCSStatement>statement).argumentTitle!);
        // 3)
        if (argumentNode) {
          edges.push({
            type: ArgdownTypes.MAP_EDGE,
            relationType: RelationType.SUPPORT,
            from: statementNode,
            to: argumentNode,
            fromEquivalenceClass: ec,
            toEquivalenceClass: ec,
            id: "e" + Number(initialEdgeCount + edges.length + 1)
          });
        }
      }
    }
  }
  return edges;
};
/**
 * Creates group nodes and returns a tree structure containing all group, statement and argument nodes of the map.
 */
const createMapNodeTree = (settings: IMapSettings, response: IArgdownResponse, nodes: IMapNode[]): IMapNode[] => {
  if (settings.groupMode && settings.groupMode === "none") {
    return [...nodes];
  }
  const groupMap = createGroups(response, nodes);
  [...groupMap.values()].reduce(createAncestorGroups, groupMap);
  const groups = [...groupMap.values()];
  //normalize group levels
  const maxGroupLevel = groups.reduce((acc, curr) => (curr.level! > acc ? curr.level! : acc), 0);
  const minGroupLevel = maxGroupLevel - settings.groupDepth! + 1;
  const nodesWithSection = normalizeGroupLevels(minGroupLevel, groups);
  const nodesWithoutSection: IMapNode[] = nodes.filter(n => findSection(response, n) === undefined);
  return [...nodesWithSection, ...nodesWithoutSection];
};
const createGroups = (response: IArgdownResponse, nodes: IMapNode[]) => {
  const groupMap = new Map<string, IGroupMapNode>();
  for (let node of nodes) {
    let section = findSection(response, node);
    if (section !== undefined) {
      let group: IGroupMapNode | undefined = groupMap.get(section.id);
      if (!group) {
        group = {
          type: ArgdownTypes.GROUP_MAP_NODE,
          id: section.id,
          title: section.title,
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
const findSection = (response: IArgdownResponse, node: IMapNode): ISection | undefined => {
  if (node.type == ArgdownTypes.ARGUMENT_MAP_NODE) {
    let argument = response.arguments![node.title!];
    return argument.section;
  } else {
    let equivalenceClass = response.statements![node.title!];
    return equivalenceClass.section;
  }
};
const normalizeGroupLevels = (minGroupLevel: number, groups: IGroupMapNode[]): IMapNode[] => {
  const nodes: IMapNode[] = [];
  for (let group of groups) {
    group.level = group.level! - minGroupLevel;
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
