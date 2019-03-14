import * as builder from "xmlbuilder";
import pixelWidth from "string-pixel-width";

import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { checkResponseFields } from "../ArgdownPluginError";
import {
  RelationType,
  IMapNode,
  IGroupMapNode,
  IMapEdge,
  isGroupMapNode,
  ArgdownTypes
} from "../model/model";
import { IArgdownRequest } from "../index";
import {
  addLineBreaks,
  mergeDefaults,
  DefaultSettings,
  ensure,
  isObject
} from "../utils";
import defaultsDeep from "lodash.defaultsdeep";

export interface IGraphMLSettings {
  argument?: {
    width?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
    text?: {
      font?: string;
      fontSize?: number;
      bold?: boolean;
      /// does not affect the space between lines, is only used to account for default line height in yEd
      lineHeight?: number;
    };
    title?: {
      font?: string;
      fontSize?: number;
      bold?: boolean;
      /// does not affect the space between lines, is only used to account for default line height in yEd
      lineHeight?: number;
    };
  };
  statement?: {
    width?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
    text?: {
      font?: string;
      fontSize?: number;
      bold?: boolean;
      /// does not affect the space between lines, is only used to account for default line height in yEd
      lineHeight?: number;
    };
    title?: {
      font?: string;
      fontSize?: number;
      bold?: boolean;
      /// does not affect the space between lines, is only used to account for default line height in yEd
      lineHeight?: number;
    };
  };
  edge?: {
    width?: number;
  };
  group?: {
    font?: string;
    fontSize?: number;
    bold?: boolean;
    lineHeight?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
  };
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[GraphMLExportPlugin]]
     */
    graphml?: IGraphMLSettings;
  }
  interface IArgdownResponse {
    /**
     * Exported dot version of argument map
     *
     * Provided by the [[GraphMLExportPlugin]]
     */
    graphml?: string;
    /**
     * Temporary counter for groups used by the [[GraphMLExportPlugin]]
     */
    groupCount?: number;
  }
}
const defaultSettings: DefaultSettings<IGraphMLSettings> = {
  statement: ensure.object({
    width: 135,
    horizontalPadding: 10,
    verticalPadding: 7,
    text: ensure.object({
      font: "arial",
      fontSize: 13,
      bold: false,
      lineHeight: 1.1
    }),
    title: ensure.object({
      font: "arial",
      fontSize: 13,
      bold: true,
      lineHeight: 1.1
    })
  }),
  argument: ensure.object({
    width: 135,
    horizontalPadding: 10,
    verticalPadding: 7,
    text: ensure.object({
      font: "arial",
      fontSize: 13,
      bold: false,
      lineHeight: 1.1
    }),
    title: ensure.object({
      font: "arial",
      fontSize: 13,
      bold: true,
      lineHeight: 1.1
    })
  }),
  edge: ensure.object({
    width: 0.3
  }),
  group: ensure.object({
    font: "arial",
    fontSize: 16,
    lineHeight: 1.1,
    bold: false,
    horizontalPadding: 15,
    verticalPadding: 15
  })
};
/**
 * Exports map data to the graphml format.
 * The result ist stored in the [[IDotResponse.graphml]] response object property.
 *
 * Depends on data from: [[MapPlugin]]
 */
export class GraphMLExportPlugin implements IArgdownPlugin {
  name: string = "GraphMLExportPlugin";
  defaults: IGraphMLSettings;
  constructor(config?: IGraphMLSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest): IGraphMLSettings {
    if (isObject(request.graphml)) {
      return request.graphml;
    } else {
      request.graphml = {};
      return request.graphml;
    }
  }
  prepare: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, [
      "statements",
      "arguments",
      "map",
      "relations"
    ]);
    let settings = this.getSettings(request);
    mergeDefaults(settings, this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);
    const graphml = this.createGraphMLDocument();
    const graph = graphml.e("graph", {
      edgedefault: "directed",
      id: "G"
    });
    for (let node of response.map!.nodes) {
      this.createNodeElement(graph, node, settings);
    }
    for (let edge of response.map!.edges) {
      this.createEdgeElement(graph, edge, settings);
    }
    response.graphml = graphml.end({
      pretty: true,
      indent: "  ",
      newline: "\n",
      allowEmpty: false
    });
  };
  createGraphMLDocument(): builder.XMLElementOrXMLNode {
    const graphml = builder
      .create("graphml", {
        version: "1.0",
        encoding: "UTF-8",
        standalone: true
      })
      .a("xmlns", "http://graphml.graphdrawing.org/xmlns")
      .a("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
      .a("xmlns:y", "http://www.yworks.com/xml/graphml")
      .a(
        "xsi:schemaLocation",
        "http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd"
      );
    graphml.e("key", {
      for: "node",
      "yfiles.type": "nodegraphics",
      id: "d0"
    });
    graphml.e("key", {
      for: "edge",
      "yfiles.type": "edgegraphics",
      id: "d1"
    });
    return graphml;
  }
  createEdgeElement(
    graph: builder.XMLElementOrXMLNode,
    edge: IMapEdge,
    settings: IGraphMLSettings
  ): builder.XMLElementOrXMLNode {
    let edgeColor = edge.color;
    let sourceArrow = "none";
    let targetArrow = "standard";
    switch (edge.relationType) {
      case RelationType.CONTRARY:
        sourceArrow = "standard";
        break;
      case RelationType.CONTRADICTORY:
        sourceArrow = "diamond";
        targetArrow = "diamond";
        break;
    }
    const edgeEl = graph.e("edge", {
      id: edge.id,
      directed: true,
      source: edge.from.id,
      target: edge.to.id
    });
    const polyLine = edgeEl.e("data", { key: "d1" }).e("y:PolyLineEdge", {});
    polyLine.e("y:Path", { sx: "0.0", sy: "0.0", tx: "0.0", ty: "0.0" });
    polyLine.e("y:LineStyle", {
      color: edgeColor,
      type: "line",
      width: settings.edge!.width
    });
    polyLine.e("y:Arrows", { source: sourceArrow, target: targetArrow });
    polyLine.e("y:BendStyle", { smoothed: "false" });
    return edgeEl;
  }
  createGroupElement(
    parent: builder.XMLElementOrXMLNode,
    groupMapNode: IGroupMapNode,
    settings: IGraphMLSettings
  ): builder.XMLElementOrXMLNode {
    const labelWidth = pixelWidth(groupMapNode.labelTitle, {
      font: settings.group!.font,
      size: settings.group!.fontSize,
      bold: settings.group!.bold
    });
    const labelHeight = settings.group!.fontSize! * settings.group!.lineHeight!;
    const groupColor = groupMapNode.color || "#AAAAAA";
    const groupFontColor = groupMapNode.fontColor || "#000000";
    const outerGroupEl = parent.e("node", {
      id: groupMapNode.id,
      "yfiles.foldertype": "folder"
    });
    const realizers = outerGroupEl
      .e("data", { key: "d0" })
      .e("y:ProxyAutoBoundsNode")
      .e("y:Realizers", { active: groupMapNode.isClosed ? "1" : "0" });
    const openGroup = realizers.e("y:GroupNode");
    openGroup.e("y:Geometry", {
      width: labelWidth + settings.group!.horizontalPadding! * 2,
      height: labelHeight + settings.group!.verticalPadding! * 2,
      x: "0",
      y: "0"
    });
    openGroup.e("y:Fill", {
      color: groupColor,
      transparent: "false"
    });
    openGroup.e("y:BorderStyle", {
      color: groupColor,
      width: "0"
    });
    openGroup.e(
      "y:NodeLabel",
      {
        alignment: "center",
        autoSizePolicy: "node_width",
        // borderDistance: "2.0",
        fontFamily: settings.group!.font,
        fontSize: settings.group!.fontSize!.toString(),
        fontStyle: settings.group!.bold ? "bold" : "plain",
        hasBackgroundColor: "false",
        hasLineColor: "false",
        horizontalTextPosition: "center",
        iconTextGap: "4",
        modelName: "internal",
        modelPosition: "t",
        textColor: groupFontColor,
        verticalTextPosition: "bottom",
        visible: "true",
        width: labelWidth.toString(),
        height: labelHeight.toString(),
        x: "0.0",
        "xml:space": "preserve",
        y: "0"
      },
      groupMapNode.labelTitle
    );
    openGroup.e("y:Shape", { type: "rectangle" });
    openGroup.e("y:State", {
      closed: "false",
      closedHeight: labelHeight + settings.group!.verticalPadding! * 2,
      closedWidth: labelWidth + settings.group!.horizontalPadding! * 2,
      innerGraphDisplayEnabled: "false"
    });
    openGroup.e("y:Insets", {
      bottom: settings.group!.verticalPadding!.toString(),
      bottomF: settings.group!.verticalPadding!.toString(),
      left: settings.group!.horizontalPadding!.toString(),
      leftF: settings.group!.horizontalPadding!.toString(),
      right: settings.group!.horizontalPadding!.toString(),
      rightF: settings.group!.horizontalPadding!.toString(),
      top: settings.group!.verticalPadding!.toString(),
      topF: settings.group!.verticalPadding!.toString()
    });
    const closedGroup = realizers.e("y:GroupNode");
    closedGroup.e("y:Geometry", {
      width: labelWidth + settings.group!.horizontalPadding! * 2,
      height: labelHeight,
      x: "0",
      y: "0"
    });
    closedGroup.e("y:Fill", {
      color: groupColor,
      transparent: "false"
    });
    closedGroup.e("y:BorderStyle", {
      color: groupColor,
      width: "0"
    });
    closedGroup.e(
      "y:NodeLabel",
      {
        alignment: "center",
        autoSizePolicy: "node_width",
        // borderDistance: "2.0",
        fontFamily: "Arial",
        fontSize: settings.group!.fontSize!.toString(),
        fontStyle: "plain",
        hasBackgroundColor: "false",
        hasLineColor: "false",
        horizontalTextPosition: "center",
        iconTextGap: "4",
        modelName: "internal",
        modelPosition: "t",
        textColor: groupFontColor,
        verticalTextPosition: "bottom",
        visible: "true",
        width: labelWidth.toString(),
        height: labelHeight.toString(),
        x: "0.0",
        "xml:space": "preserve",
        y: "0"
      },
      groupMapNode.labelTitle
    );
    closedGroup.e("y:Shape", { type: "rectangle" });
    closedGroup.e("y:State", {
      closed: "true",
      closedHeight: labelHeight + settings.group!.verticalPadding! * 2,
      closedWidth: labelWidth + settings.group!.horizontalPadding! * 2,
      innerGraphDisplayEnabled: "false"
    });
    closedGroup.e("y:Insets", {
      bottom: settings.group!.verticalPadding!.toString(),
      bottomF: settings.group!.verticalPadding!.toString(),
      left: settings.group!.horizontalPadding!.toString(),
      leftF: settings.group!.horizontalPadding!.toString(),
      right: settings.group!.horizontalPadding!.toString(),
      rightF: settings.group!.horizontalPadding!.toString(),
      top: settings.group!.verticalPadding!.toString(),
      topF: settings.group!.verticalPadding!.toString()
    });

    // innerGroupEl.e("y:BorderInsets", {
    //   bottom: "5",
    //   bottomF: "4.948730468748863",
    //   left: "13",
    //   leftF: "12.927550877193198",
    //   right: "0",
    //   rightF: "0.0",
    //   top: "6",
    //   topF: "5.90856725711626"
    // });
    const groupGraph = outerGroupEl.e("graph", {
      id: groupMapNode.id + ":",
      edgedefault: "directed"
    });
    for (let child of groupMapNode.children!) {
      this.createNodeElement(groupGraph, child, settings);
    }
    return outerGroupEl;
  }
  createNodeElement(
    parent: builder.XMLElementOrXMLNode,
    mapNode: IMapNode,
    settings: IGraphMLSettings
  ): builder.XMLElementOrXMLNode {
    if (isGroupMapNode(mapNode)) {
      return this.createGroupElement(parent, mapNode, settings);
    }
    let nodeSettings = settings.statement;
    let borderColor = mapNode.color || "#63AEF2";
    let fillColor = "#FFFFFF";
    let borderWidth = 3.0;
    if (mapNode.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
      nodeSettings = settings.argument;
      fillColor = mapNode.color || "#63AEF2";
      borderColor = "#000000";
      borderWidth = 0.3;
    }
    const fontColor = mapNode.fontColor || "#000000";
    const innerNodeWidth =
      nodeSettings!.width! - nodeSettings!.horizontalPadding! * 2;
    const showTitle = mapNode.labelTitle != null;
    const showText = mapNode.labelText != null;
    const labelTitle = addLineBreaks(mapNode.labelTitle!, true, {
      maxWidth: innerNodeWidth,
      font: nodeSettings!.title!.font,
      fontSize: nodeSettings!.title!.fontSize!,
      bold: nodeSettings!.title!.bold
    });
    const labelText = addLineBreaks(mapNode.labelText!, true, {
      maxWidth: innerNodeWidth,
      font: nodeSettings!.text!.font,
      fontSize: nodeSettings!.text!.fontSize!,
      bold: nodeSettings!.text!.bold
    });
    const titleHeight =
      labelTitle.lines *
      nodeSettings!.title!.fontSize! *
      nodeSettings!.title!.lineHeight!;
    const textHeight =
      labelText.lines *
      nodeSettings!.text!.fontSize! *
      nodeSettings!.text!.lineHeight!;
    const nrOfVerticalPaddings = showTitle && showText ? 3 : 2;
    const nodeHeight =
      titleHeight +
      textHeight +
      nodeSettings!.verticalPadding! * nrOfVerticalPaddings;
    const nodeEl = parent.e("node", { id: mapNode.id });
    let shapeNode = nodeEl.e("data", { key: "d0" }).e("y:ShapeNode");
    shapeNode.e("y:Geometry", {
      width: nodeSettings!.width!.toString(),
      height: nodeHeight,
      x: "0",
      y: "0"
    });
    shapeNode.e("y:Fill", {
      color: fillColor,
      transparent: "false"
    });
    shapeNode.e("y:BorderStyle", {
      color: borderColor,
      type: "line",
      width: borderWidth
    });
    if (showTitle) {
      shapeNode.e(
        "y:NodeLabel",
        {
          alignment: "center",
          autoSizePolicy: "content",
          fontFamily: nodeSettings!.title!.font,
          fontSize: nodeSettings!.title!.fontSize!.toString(),
          fontStyle: nodeSettings!.title!.bold! ? "bold" : "plain",
          hasBackgroundColor: "false",
          hasLineColor: "false",
          modelName: "internal",
          topInset: nodeSettings!.verticalPadding!.toString(),
          bottomInset: nodeSettings!.verticalPadding!.toString(),
          borderDistance: 0,
          modelPosition: "t",
          textColor: fontColor,
          visible: "true",
          width: innerNodeWidth.toString(),
          height: titleHeight + nodeSettings!.verticalPadding! * 2,
          x: nodeSettings!.horizontalPadding!.toString()
        },
        labelTitle.text
      );
    }
    if (showText) {
      shapeNode.e(
        "y:NodeLabel",
        {
          alignment: "center",
          autoSizePolicy: "content",
          fontFamily: nodeSettings!.text!.font,
          fontSize: nodeSettings!.text!.fontSize!.toString(),
          topInset: !showTitle
            ? nodeSettings!.verticalPadding!.toString()
            : "0",
          bottomInset: nodeSettings!.verticalPadding!.toString(),
          fontStyle: nodeSettings!.text!.bold ? "bold" : "plain",
          hasBackgroundColor: "false",
          hasLineColor: "false",
          modelName: "internal",
          modelPosition: "b",
          borderDistance: 0,
          textColor: fontColor,
          visible: "true",
          width: innerNodeWidth,
          height: showTitle
            ? textHeight + nodeSettings!.verticalPadding! * 2
            : textHeight + nodeSettings!.verticalPadding!,
          x: nodeSettings!.horizontalPadding!.toString(),
          y: (nodeSettings!.verticalPadding! * 2 + titleHeight).toString()
        },
        labelText.text
      );
    }
    shapeNode.e("y:Shape", { type: "roundrectangle" });
    return nodeEl;
  }
}
