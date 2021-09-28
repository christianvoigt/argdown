/* tslint:disable-next-line */
import Viz from "@aduh95/viz.js";

import { VizConstructorOptions } from "@aduh95/viz.js";
import { select } from "d3-selection";
import "d3-transition";
// import { Module, render } from "viz.js/full.render";
// import * as d3 from "d3";
import { ZoomManager, OnZoomChangedHandler } from "./ZoomManager";
import { CanSelectNode, OnSelectionChangedHandler } from "./CanSelectNode";
import { mergeDefaults, isObject } from "@argdown/core";

export enum GraphvizEngine {
  CIRCO = "circo",
  DOT = "dot",
  FDP = "fdp",
  NEATO = "neato",
  OSAGE = "osage",
  TWOPI = "twopi"
}
export interface IVizJsSettings {
  removeProlog?: boolean;
  engine?: GraphvizEngine;
  nop?: number;
  images?: [{ path: string; width: number; height: number }];
}
export interface VizJsMapProps {
  dot: string;
  settings?: IVizJsSettings;
  scale?: number;
  position?: { x?: number; y?: number };
  selectedNode?: string | null;
}
export const vizJsDefaultSettings = {
  // removeProlog: true,
  // engine: GraphvizEngine.DOT,
  // format: "svg"
};
export class VizJsMap implements CanSelectNode {
  vizJsConfig?: VizConstructorOptions;
  viz: any;
  renderSync?: (str: string, settings: IVizJsSettings) => string;
  zoomManager: ZoomManager;
  svgContainer: HTMLElement;
  selectedElement?: SVGGraphicsElement | null;
  selectedElementStrokeWidth?: string;
  onSelectionChanged?: OnSelectionChangedHandler;
  constructor(
    svgContainer: HTMLElement,
    renderSync: ((str: string, settings: IVizJsSettings) => string) | null, // sync render mode still needed for vscode as long as webviews do not support web workers, set vizjsConfig to null if renderSync is used.
    config: VizConstructorOptions | null, // should be used if web workers are supported, renderSync should be set null in that case
    onZoomChanged?: OnZoomChangedHandler,
    onSelectionChanged?: OnSelectionChangedHandler
  ) {
    if (!renderSync && config) {
      this.vizJsConfig = config;
      this.viz = new Viz(this.vizJsConfig);
    } else if (renderSync) {
      this.renderSync = renderSync;
    }
    this.svgContainer = svgContainer;
    this.zoomManager = new ZoomManager(onZoomChanged, true);
    this.onSelectionChanged = onSelectionChanged;
  }
  async renderAsync(dot: string, options: IVizJsSettings) {
    if (this.viz === undefined && this.vizJsConfig) {
      this.viz = new Viz(this.vizJsConfig);
    }
    return this.viz.renderString(dot, options);
  }
  async render(props: VizJsMapProps) {
    const settings = isObject(props.settings) ? props.settings : {};
    mergeDefaults(settings, vizJsDefaultSettings);
    let svgString = "";
    if (this.renderSync) {
      svgString = this.renderSync(props.dot, settings);
    } else {
      svgString = await this.renderAsync(props.dot, settings);
    }
    if (settings.removeProlog) {
      svgString = svgString.replace(
        /<\?[ ]*xml[\S ]+?\?>[\s]*<\![ ]*DOCTYPE[\S\s]+?\.dtd\"[ ]*>/,
        ""
      );
    }
    if (settings.images) {
      for (let image of settings.images) {
        if ((image as any).dataUrl) {
          const stringToReplace = new RegExp(image.path, "g");
          svgString = svgString.replace(
            stringToReplace,
            (image as any).dataUrl
          );
        }
      }
    }
    this.svgContainer.innerHTML = svgString;
    const svg = select<HTMLElement, null>(this.svgContainer).select<
      SVGSVGElement
    >("svg");
    svg.attr("class", "map-svg");
    svg.attr("width", "100%");
    svg.attr("height", "100%");
    svg.attr("viewBox", null);

    const svgGraph = svg.select<SVGGraphicsElement>("g");
    const groupNode: SVGGraphicsElement = svgGraph!.node() as SVGGraphicsElement;
    const bBox = groupNode.getBBox();
    const width = bBox.width;
    const height = bBox.height;

    this.zoomManager.init(svg, svgGraph, width, height);
    if (!props.scale || !props.position) {
      this.zoomManager.showAllAndCenterMap();
    } else {
      this.zoomManager.setZoom(
        props.position.x || 0,
        props.position.y || 0,
        props.scale,
        0
      );
    }
    svgGraph!.attr(
      "height",
      this.zoomManager.state.size.height * this.zoomManager.state.scale + 40
    );
    if (props.selectedNode) {
      this.selectNode(props.selectedNode);
    }
  }
  getNodeWithArgdownId(id: string): SVGGraphicsElement | undefined {
    const nodes = this.zoomManager
      .svgGraph!.selectAll("g.node")
      .nodes() as SVGGraphicsElement[];
    const self = this;
    return nodes.find(n => self.getArgdownId(n) === id);
  }
  getArgdownId(node: SVGGraphicsElement): string {
    const title = select(node)
      .select<SVGTitleElement>("title")
      .node();
    if (title) {
      return title.textContent || "";
    }
    return "";
  }
  deselectNode() {
    this._deselectNode();
    if (this.onSelectionChanged) {
      this.onSelectionChanged(null);
    }
  }
  /**
   *
   * Because we cannot override inline styles, we have to save original inline stroke and strokeWidth attributes and put them back in on deselection.
   */
  private _deselectNode(): void {
    if (this.selectedElement) {
      this.selectedElement.classList.remove("selected");
      const path = this.selectedElement.getElementsByTagName("path")[0];
      path.setAttribute("stroke-width", this.selectedElementStrokeWidth || "");
      //path.setAttribute("stroke", state.selectedNodeStroke || "");
    }
    this.selectedElement = null;
  }
  selectNode(id: string): void {
    this._deselectNode();
    this.selectedElement = this.getNodeWithArgdownId(id);
    if (this.selectedElement) {
      const path = this.selectedElement.getElementsByTagName("path")[0];
      this.selectedElement.classList.add("selected");
      //state.selectedNodeStroke = path.getAttribute("stroke") || "";
      this.selectedElementStrokeWidth = path.getAttribute("stroke-width") || "";
      //path.setAttribute("stroke", "#40e0d0");
      path.setAttribute("stroke-width", "8");
      this.zoomManager.moveToElement(this.selectedElement);
      if (this.onSelectionChanged) {
        this.onSelectionChanged(id);
      }
    }
  }
}
