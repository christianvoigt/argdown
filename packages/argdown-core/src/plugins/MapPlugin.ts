import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { checkResponseFields } from "../ArgdownPluginError";
import { reduceToMap, mergeDefaults, stringIsEmpty, isObject } from "../utils";
import { IArgdownRequest, IArgdownResponse } from "../index";
import {
  IMap,
  IMapNode,
  IEquivalenceClass,
  IArgument,
  StatementRole,
  ArgdownTypes,
  IRelation,
  IMapEdge,
  IPCSStatement,
  RelationType,
  IInference
} from "../model/model";
import { relationMemberIsInSelection } from "./selectionUtils";
import defaultsDeep from "lodash.defaultsdeep";

export enum LabelMode {
  HIDE_UNTITLED = "hide-untitled",
  TITLE = "title",
  TEXT = "text",
  NONE = "none"
}
/**
 * The settings for the [[MapPlugin]].
 */
export interface IMapSettings {
  argumentLabelMode?: LabelMode;
  statementLabelMode?: LabelMode;
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
  argumentLabelMode: LabelMode.HIDE_UNTITLED,
  statementLabelMode: LabelMode.HIDE_UNTITLED,
  addTags: true
};

/**
 * This plugin creates the [[IArgdownResponse.map]] object.
 *
 * It takes the statements and arguments from the [[ISelection]] object found in [[IArgdownRequest.selection]]
 * and transforms them into statement and argument nodes.
 *
 * It will then create edges for all relations between the selected statements and arguments.
 *
 * Depends on data from: [[IPreselectionPlugin]], [[IStatementSelectionPlugin]], [[IArgumentSelectionPlugin]].
 *
 * This plugin is not responsible for creating group nodes. That is the job of the [[GroupPlugin]].
 */
export class MapPlugin implements IArgdownPlugin {
  name = "MapPlugin";
  defaults: IMapSettings;
  constructor(config?: IMapSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): IMapSettings => {
    if (isObject(request.map)) {
      return request.map;
    } else {
      request.map = {};
      return request.map;
    }
  };
  prepare: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, [
      "statements",
      "arguments",
      "relations"
    ]);
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, ["selection"]);
    const settings = this.getSettings(request);
    let selectedStatementsMap = reduceToMap(
      response.selection!.statements,
      curr => curr.title!
    );
    let selectedArgumentsMap = reduceToMap(
      response.selection!.arguments,
      curr => curr.title!
    );

    let nodeCount = 0;
    const statementNodes = response.selection!.statements.map<IMapNode>(
      createStatementNode(settings, nodeCount)
    );
    const statementNodesMap = reduceToMap<string, IMapNode>(
      statementNodes,
      curr => curr.title!
    );
    nodeCount += statementNodes.length;
    // Create argument nodes
    const argumentNodes = response.selection!.arguments.map<IMapNode>(
      createArgumentNode(settings, nodeCount)
    );
    const argumentNodesMap = reduceToMap<string, IMapNode>(
      argumentNodes,
      curr => curr.title!
    );
    nodeCount += argumentNodes.length;

    // Select relations
    const selectedRelations = response.relations!.filter(
      isRelationSelected(selectedStatementsMap, selectedArgumentsMap)
    );
    // Create edges
    // a) Create edges from relations
    const edges = selectedRelations.reduce<IMapEdge[]>(
      createEdgesFromRelation(statementNodesMap, argumentNodesMap),
      []
    );
    // b) Create edges from equivalences
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
    const map: IMap = {
      nodes: statementNodes.concat(argumentNodes),
      edges
    };
    response.map = map;
  };
}

const createStatementNode = (
  settings: IMapSettings,
  initialNodeCount: number
) => (ec: IEquivalenceClass, index: number) => {
  const node: IMapNode = {
    type: ArgdownTypes.STATEMENT_MAP_NODE,
    title: ec.title,
    color: ec.color,
    id: "n" + Number(initialNodeCount + index)
  };
  if(ec.data && ec.data["images"] && Array.isArray(ec.data["images"])){
    node.images = ec.data["images"];
  }
  if (settings.statementLabelMode == LabelMode.TEXT 
    || settings.statementLabelMode == LabelMode.HIDE_UNTITLED) {
    const canonicalMember = IEquivalenceClass.getCanonicalMember(ec);
    node.labelText = canonicalMember ? canonicalMember.text : undefined;
    node.labelTextRanges = canonicalMember ? canonicalMember.ranges : undefined;
  }
  if (
    settings.statementLabelMode == LabelMode.TITLE || 
    settings.statementLabelMode == LabelMode.HIDE_UNTITLED ||
    (settings.statementLabelMode == LabelMode.TEXT && stringIsEmpty(node.labelText))
  ) {
    if (
      settings.statementLabelMode === LabelMode.TITLE ||
      !ec.title!.startsWith("Untitled") ||
      !node.labelText
    ) {
      node.labelTitle = ec.title;
    }
  }
  if (settings.addTags && ec.tags) {
    node.tags = ec.tags;
  }
  return node;
};
const createArgumentNode = (
  settings: IMapSettings,
  initialNodeCount: number
) => (a: IArgument, index: number) => {
  const node: IMapNode = {
    title: a.title,
    type: ArgdownTypes.ARGUMENT_MAP_NODE,
    color: a.color,
    id: "n" + Number(initialNodeCount + index)
  };
  if(a.data && a.data["images"] && Array.isArray(a.data["images"])){
    node.images = a.data["images"].map((img)=>img);
  }
  if (settings.argumentLabelMode == LabelMode.TEXT || 
    settings.argumentLabelMode == LabelMode.HIDE_UNTITLED) {
    const canonicalMember = IArgument.getCanonicalMember(a);
    node.labelText = canonicalMember ? canonicalMember.text : undefined;
    node.labelTextRanges = canonicalMember ? canonicalMember.ranges : undefined;
  }
  if (
    settings.argumentLabelMode == LabelMode.TITLE ||
    settings.argumentLabelMode == LabelMode.HIDE_UNTITLED || 
    (settings.argumentLabelMode == LabelMode.TEXT && stringIsEmpty(node.labelText))
  ) {
    if (
      !a.title!.startsWith("Untitled") ||
      settings.argumentLabelMode == LabelMode.TITLE ||
      !node.labelText
    ) {
      node.labelTitle = a.title;
    }
  }
  if (settings.addTags && a.tags) {
    node.tags = a.tags;
  }
  return node;
};
const getFroms = (
  rel: IRelation,
  statementNodesMap: Map<string, IMapNode>,
  argumentNodesMap: Map<string, IMapNode>,
  isReverseRelation: boolean
) => {
  const froms: IMapNode[] = [];
  if (!isReverseRelation && rel.from!.type === ArgdownTypes.ARGUMENT) {
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
  return froms;
};
const getTos = (
  rel: IRelation,
  statementNodesMap: Map<string, IMapNode>,
  argumentNodesMap: Map<string, IMapNode>,
  isReverseRelation: boolean
) => {
  const tos: IMapNode[] = [];
  if (!isReverseRelation && rel.to!.type === ArgdownTypes.ARGUMENT) {
    tos.push(argumentNodesMap.get(rel.to!.title!)!);
  } else if (!isReverseRelation && rel.to!.type === ArgdownTypes.INFERENCE) {
    const argumentNode = argumentNodesMap.get(
      (<IInference>rel.to).argumentTitle!
    );
    tos.push(argumentNode!);
  } else if (rel.to!.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    const statementNode = statementNodesMap.get(rel.to!.title!);
    if (!isReverseRelation && statementNode) {
      tos.push(statementNode);
    } else if (!statementNode) {
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
  return tos;
};
const createEdgesFromRelation = (
  statementNodesMap: Map<string, IMapNode>,
  argumentNodesMap: Map<string, IMapNode>
) => {
  const funcInst = (
    acc: IMapEdge[],
    rel: IRelation,
    currentIndex: number,
    array: IRelation[],
    isReverseRelation?: boolean
  ): IMapEdge[] => {
    const froms: IMapNode[] = getFroms(
      rel,
      statementNodesMap,
      argumentNodesMap,
      !!isReverseRelation
    );
    const tos: IMapNode[] = getTos(
      rel,
      statementNodesMap,
      argumentNodesMap,
      !!isReverseRelation
    );

    for (let from of froms) {
      for (let to of tos) {
        // let addEdge = true;
        const edge: IMapEdge = {
          type: ArgdownTypes.MAP_EDGE,
          from: from,
          to: to,
          id: "e" + Number(acc.length + 1),
          relationType: rel.relationType
        };
        if (rel.from!.type === ArgdownTypes.EQUIVALENCE_CLASS) {
          edge.fromEquivalenceClass = <IEquivalenceClass>rel.from;
        }
        if (rel.to!.type === ArgdownTypes.EQUIVALENCE_CLASS) {
          edge.toEquivalenceClass = <IEquivalenceClass>rel.to;
        }
        // If the relation is ec2ec, but the edge is s2a or a2s, we have to change the relation type to SUPPORT or ATTACK.
        // let s2sEdge =
        //   from.type === ArgdownTypes.STATEMENT_MAP_NODE &&
        //   to.type === ArgdownTypes.STATEMENT_MAP_NODE;
        // // if (!s2sEdge) {
        //   // Check if we have to reverse the edge direction or dismiss the edge entirely
        //   if (isSymmetric) {
        //     let fromIsPremise = false;
        //     let toIsPremise = false;
        //     let toIsConclusion = false;
        //     if (from.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
        //       const fromArgument = response.arguments![from.title!];
        //       fromIsPremise =
        //         fromArgument.pcs[fromArgument.pcs.length - 1].title !==
        //         rel.from!.title;
        //     }
        //     if (to.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
        //       const toArgument = response.arguments![to.title!];
        //       toIsPremise =
        //         toArgument.pcs[toArgument.pcs.length - 1].title !== rel.to!.title;
        //       toIsConclusion = !toIsPremise;
        //     }
        //     if (fromIsPremise && toIsPremise) {
        //       // ignore relations from premise to premise
        //       addEdge = false;
        //     } else if (fromIsPremise || toIsConclusion) {
        //       edge.from = to;
        //       edge.to = from;
        //     }
        //   }
        let s2sEdge =
          from.type === ArgdownTypes.STATEMENT_MAP_NODE &&
          to.type === ArgdownTypes.STATEMENT_MAP_NODE;
        if (!s2sEdge) {
          if (rel.relationType === RelationType.CONTRADICTORY) {
            edge.relationType = RelationType.ATTACK;
          } else if (rel.relationType === RelationType.CONTRARY) {
            edge.relationType = RelationType.ATTACK;
          } else if (rel.relationType === RelationType.ENTAILS) {
            edge.relationType = RelationType.SUPPORT;
          }
        }
        acc.push(edge);
      }
      // if (addEdge) {
      // }
    }
    if (!isReverseRelation && IRelation.isSymmetric(rel)) {
      const revRel = { ...rel };
      revRel.from = rel.to;
      revRel.to = rel.from;
      acc = funcInst(acc, revRel, currentIndex, array, true);
    }
    return acc;
  };
  return funcInst;
};
/**
 * Add implicit support edges derived from statement-statement equivalences:
 * 1. For all argument-nodes: Create support edges for conclusion-in-argument-node +> statement-node equivalences
 * 2. For all argument-nodes: Create support edges for conclusion-in-argument-node +> premise-in-argument-node
 * 3. For all statement-nodes: Create support edges for statement-node +> premise-in-argument-node equivalences
 *
 * Check for redundant edges from explicitely defined relations in all cases
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
    if (
      statementNode &&
      !edgeExists(edges, argumentNode, statementNode, RelationType.SUPPORT)
    ) {
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
        const argumentNode2 = argumentNodesMap.get(
          (<IPCSStatement>statement).argumentTitle!
        );
        if (
          argumentNode2 &&
          !edgeExists(edges, argumentNode, argumentNode2, RelationType.SUPPORT)
        ) {
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
        const argumentNode = argumentNodesMap.get(
          (<IPCSStatement>statement).argumentTitle!
        );
        // 3)
        if (
          argumentNode &&
          !edgeExists(edges, statementNode, argumentNode, RelationType.SUPPORT)
        ) {
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
const edgeExists = (
  edges: IMapEdge[],
  from: IMapNode,
  to: IMapNode,
  relationType: RelationType
) => {
  return !!edges.find(
    e => e.from === from && e.to === to && e.relationType === relationType
  );
};
const isRelationSelected = (
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => (relation: IRelation): boolean => {
  return (
    relationMemberIsInSelection(
      relation,
      relation.from!,
      selectedStatements,
      selectedArguments
    ) &&
    relationMemberIsInSelection(
      relation,
      relation.to!,
      selectedStatements,
      selectedArguments
    )
  );
};
