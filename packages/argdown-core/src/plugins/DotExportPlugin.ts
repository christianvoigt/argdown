import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import {
  RelationType,
  ArgdownTypes,
  IMapNode,
  IGroupMapNode,
  IArgument,
  IEquivalenceClass,
  IMap,
  isGroupMapNode
} from "../model/model";
import { IArgdownRequest, IArgdownResponse } from "../index";
import {
  validateColorString,
  mergeDefaults,
  DefaultSettings,
  ensure,
  stringIsEmpty,
  isObject
} from "../utils";
import { escapeAsHtmlEntities, addLineBreaks } from "../utils";
import defaultsDeep from "lodash.defaultsdeep";
import merge from "lodash.merge";

export interface IRankMap {
  [key: string]: IRank;
}
export interface IRank {
  arguments: string[];
  statements: string[];
}
export interface IDotSettings {
  useHtmlLabels?: boolean;
  graphname?: string;
  measureLinePixelWidth?: boolean;
  group?: {
    lineWidth?: number;
    charactersInLine?: number;
    font?: string;
    fontSize?: number;
    bold?: boolean;
  };
  statement?: {
    lineWidth?: number;
    title?: {
      font: string;
      fontSize: number;
      bold: boolean;
      charactersInLine?: number;
    };
    text?: {
      font: string;
      fontSize: number;
      bold: boolean;
      charactersInLine?: number;
    };
  };
  argument?: {
    lineWidth?: number;
    title?: {
      font: string;
      fontSize: number;
      bold: boolean;
      charactersInLine?: number;
    };
    text?: {
      font: string;
      fontSize: number;
      bold: boolean;
      charactersInLine?: number;
    };
  };
  graphVizSettings?: { [name: string]: string };
  sameRank?: IRank[];
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[DotExportPlugin]]
     */
    dot?: IDotSettings;
  }
  interface IArgdownResponse {
    /**
     * Exported dot version of argument map
     *
     * Provided by the [[DotExportPlugin]]
     */
    dot?: string;
    /**
     * Temporary counter for groups used by the [[DotExportPlugin]]
     */
    groupCount?: number;
  }
}

const defaultSettings: DefaultSettings<IDotSettings> = {
  useHtmlLabels: true,
  graphname: "Argument Map",
  measureLinePixelWidth: false,
  group: ensure.object({
    lineWidth: 400,
    charactersInLine: 80,
    font: "arial",
    fontSize: 12
  }),
  argument: ensure.object({
    lineWidth: 180,
    title: ensure.object({
      font: "arial",
      fontSize: 10,
      bold: true,
      charactersInLine: 40
    }),
    text: ensure.object({
      font: "arial",
      fontSize: 10,
      bold: false,
      charactersInLine: 40
    })
  }),
  statement: ensure.object({
    lineWidth: 180,
    title: ensure.object({
      font: "arial",
      fontSize: 10,
      bold: true,
      charactersInLine: 40
    }),
    text: ensure.object({
      font: "arial",
      fontSize: 10,
      bold: false,
      charactersInLine: 40
    })
  }),
  graphVizSettings: ensure.object({
    rankdir: "BT", //BT | TB | LR | RL
    concentrate: "false",
    ratio: "auto",
    size: "10,10"
  }),
  sameRank: ensure.array([])
};

/**
 * Exports map data to dot format.
 * The result ist stored in the [[IDotResponse.dot]] response object property.
 *
 * Depends on data from: [[MapPlugin]]
 */
export class DotExportPlugin implements IArgdownPlugin {
  name: string = "DotExportPlugin";
  defaults: IDotSettings;
  constructor(config?: IDotSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest): IDotSettings {
    if (isObject(request.dot)) {
      const settings = request.dot;
      return settings;
    } else {
      request.dot = {};
      return request.dot;
    }
  }
  prepare: IRequestHandler = (request, response) => {
    if (!response.map) {
      throw new ArgdownPluginError(this.name, "No map property in response.");
    }
    if (!response.statements) {
      throw new ArgdownPluginError(
        this.name,
        "No statements property in response."
      );
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(
        this.name,
        "No arguments property in response."
      );
    }
    if (!response.relations) {
      throw new ArgdownPluginError(
        this.name,
        "No relations property in response."
      );
    }
    let settings = this.getSettings(request);
    mergeDefaults(settings, defaultSettings);
  };
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);
    let rankMap: IRankMap = {};
    rankMap = Object.values(response.arguments!).reduce(
      reduceToRankMap,
      rankMap
    );
    rankMap = Object.values(response.statements!).reduce(
      reduceToRankMap,
      rankMap
    );
    settings.sameRank!.push(...Object.values(rankMap));

    response.groupCount = 0;
    let dot = 'digraph "' + settings.graphname + '" {\n\n';
    if (settings.graphVizSettings) {
      const keys = Object.keys(settings.graphVizSettings);
      for (let key of keys) {
        const value = settings.graphVizSettings[key];
        dot += key + ' = "' + value + '";\n';
      }
    }
    if (settings.sameRank && settings.sameRank.length > 0) {
      const nodeMaps = getNodeIdsMaps(response.map!);
      for (let rank of settings.sameRank) {
        dot += `{ rank = same;\n`;
        for (let argumentTitle of rank.arguments) {
          const id = nodeMaps.argumentNodes[argumentTitle];
          if (!id) {
            continue;
          }
          dot += `${id};\n`;
        }
        for (let ecTitle of rank.statements) {
          const id = nodeMaps.statementNodes[ecTitle];
          if (!id) {
            continue;
          }
          dot += `${id};\n`;
        }
        dot += `};\n`;
      }
    }

    for (let node of response.map!.nodes) {
      dot += this.exportNodesRecursive(node, response, settings);
    }

    dot += "\n\n";
    const edges = response.map!.edges;
    for (let edge of edges) {
      let attributes = `type="${edge.relationType}", `;
      attributes += `color="${edge.color}"`;
      switch (edge.relationType) {
        case RelationType.CONTRARY:
          attributes += `, dir="both"`;
          break;
        case RelationType.CONTRADICTORY:
          attributes += `, dir="both", arrowtail="diamond", arrowhead="diamond"`;
          break;
      }
      dot += `  ${edge.from.id} -> ${edge.to.id} [${attributes}];\n`;
    }
    dot += "\n}";

    response.dot = dot;
    return response;
  };
  exportNodesRecursive(
    node: IMapNode,
    response: IArgdownResponse,
    settings: IDotSettings
  ): string {
    let dot = "";
    response.groupCount =
      response.groupCount === undefined ? 0 : response.groupCount;
    if (node.type === ArgdownTypes.GROUP_MAP_NODE) {
      const groupNode: IGroupMapNode = <IGroupMapNode>node;
      response.groupCount++;
      let dotGroupId = "cluster_" + response.groupCount;
      let groupLabel = node.labelTitle || "";
      if (settings.useHtmlLabels) {
        groupLabel = settings.measureLinePixelWidth
          ? addLineBreaksAndEscape(groupLabel, true, {
              maxWidth: settings.group!.lineWidth!,
              fontSize: settings.group!.fontSize!,
              bold: settings.group!.bold!,
              font: settings.group!.font!
            })
          : addLineBreaksAndEscape(groupLabel, false, {
              charactersInLine: settings.group!.charactersInLine!
            });
        groupLabel = `<<FONT FACE="${settings.group!
          .font!}" POINT-SIZE="${settings.group!.fontSize!}" COLOR="${
          node.fontColor
        }">${groupLabel}</FONT>>`;
      } else {
        groupLabel = `"${escapeQuotesForDot(groupLabel)}"`;
      }
      let groupColor = node.color || "#CCCCCC";
      if (groupNode.isClosed) {
        dot += `  ${
          node.id
        } [label=${groupLabel}, shape="box", style="filled", penwidth="0" fillcolor="${groupColor}", fontcolor="${
          node.fontColor
        }",  type="${node.type}"];\n`;
      } else {
        dot += `\nsubgraph ${dotGroupId} {\n  label = ${groupLabel};\n  color = "${groupColor}";\n  style = filled;\n`;
        let labelloc = "t";
        if (
          settings.graphVizSettings &&
          settings.graphVizSettings.rankdir == "BT"
        ) {
          labelloc = "b";
        }
        dot += ` labelloc = "${labelloc}";\n\n`;
        if (groupNode.children) {
          for (let child of groupNode.children) {
            dot += this.exportNodesRecursive(child, response, settings);
          }
        }
        dot += `\n}\n\n`;
      }
      return dot;
    }

    let label = "";
    let color =
      node.color && validateColorString(node.color) ? node.color : "#63AEF2";
    label = getLabel(node, settings);
    if (node.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
      dot += `  ${
        node.id
      } [label=${label}, shape="box", style="filled,rounded", fillcolor="${color}", fontcolor="${
        node.fontColor
      }",  type="${node.type}"];\n`;
    } else if (node.type === ArgdownTypes.STATEMENT_MAP_NODE) {
      dot += `  ${
        node.id
      } [label=${label}, shape="box", style="filled,rounded,bold", color="${color}", fillcolor="white", labelfontcolor="white", fontcolor="${
        node.fontColor
      }", type="${node.type}"];\n`;
    }
    return dot;
  }
}

const addLineBreaksAndEscape = (
  str: string,
  measurePixelWidth: boolean,
  options: {
    maxWidth?: number;
    charactersInLine?: number;
    fontSize?: number;
    font?: string;
    bold?: boolean;
  }
): string => {
  const result = addLineBreaks(
    escapeAsHtmlEntities(str),
    measurePixelWidth,
    merge(
      {
        lineBreak: "<BR/>"
      },
      options
    )
  );
  return result.text;
};
const escapeQuotesForDot = (str: string): string => {
  return str.replace(/\"/g, '\\"');
};
const getLabel = (node: IMapNode, settings: IDotSettings): string => {
  const isArgumentNode = node.type === ArgdownTypes.ARGUMENT_MAP_NODE;
  const title = node.labelTitle;
  const text = node.labelText;
  const color = node.fontColor;
  let label = "";
  if (settings.useHtmlLabels) {
    const maxWidth = isArgumentNode
      ? settings.argument!.lineWidth!
      : settings.statement!.lineWidth!;
    label += `<<TABLE WIDTH="${maxWidth}" ALIGN="CENTER" BORDER="0" CELLSPACING="0">`;
    if (!stringIsEmpty(title)) {
      let { fontSize, font, bold, charactersInLine } = isArgumentNode
        ? settings.argument!.title!
        : settings.statement!.title!;
      let titleLabel = settings.measureLinePixelWidth
        ? addLineBreaksAndEscape(title!, true, {
            maxWidth,
            fontSize,
            bold,
            font
          })
        : addLineBreaksAndEscape(title!, false, {
            charactersInLine
          });
      if (bold) {
        titleLabel = `<B>${titleLabel}</B>`;
      }
      titleLabel = `<TR><TD WIDTH="${maxWidth}" ALIGN="TEXT" BALIGN="CENTER"><FONT FACE="${font}" POINT-SIZE="${fontSize}" COLOR="${color}">${titleLabel}</FONT></TD></TR>`;
      label += titleLabel;
    }
    if (!stringIsEmpty(text)) {
      let { fontSize, font, bold, charactersInLine } = isArgumentNode
        ? settings.argument!.text!
        : settings.statement!.text!;
      let textLabel = settings.measureLinePixelWidth
        ? addLineBreaksAndEscape(text!, true, {
            maxWidth,
            fontSize,
            bold,
            font
          })
        : addLineBreaksAndEscape(text!, false, {
            charactersInLine
          });
      if (bold) {
        textLabel = `<B>${textLabel}</B>`;
      }
      textLabel = `<TR><TD ALIGN="TEXT" WIDTH="${maxWidth}" BALIGN="CENTER"><FONT FACE="${font}" POINT-SIZE="${fontSize}" COLOR="${color}">${textLabel}</FONT></TD></TR>`;
      label += textLabel;
    }
    label += "</TABLE>>";
  } else {
    label = '"' + escapeQuotesForDot(title || "Untitled") + '"';
  }
  return label;
};
const reduceToRankMap = (
  acc: IRankMap,
  curr: IArgument | IEquivalenceClass
) => {
  if (curr.data && curr.data.rank) {
    const rank = acc[curr.data.rank] || {
      arguments: [],
      statements: []
    };
    if (curr.type === ArgdownTypes.ARGUMENT) {
      rank.arguments.push(curr.title!);
    } else {
      rank.statements.push(curr.title!);
    }
    acc[curr.data.rank] = rank;
  }
  return acc;
};
interface INodeMaps {
  argumentNodes: { [key: string]: string };
  statementNodes: { [key: string]: string };
}
const getNodeIdsMaps = (map: IMap): INodeMaps => {
  const maps = { argumentNodes: {}, statementNodes: {} };
  map.nodes.reduce(reduceToNodeMaps, maps);
  return maps;
};
const reduceToNodeMaps = (acc: INodeMaps, curr: IMapNode) => {
  if (isGroupMapNode(curr) && curr.children) {
    acc = curr.children.reduce(reduceToNodeMaps, acc);
  } else if (curr.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
    acc.argumentNodes[curr.title!] = curr.id!;
  } else if (curr.type === ArgdownTypes.STATEMENT_MAP_NODE) {
    acc.statementNodes[curr.title!] = curr.id!;
  }
  return acc;
};
