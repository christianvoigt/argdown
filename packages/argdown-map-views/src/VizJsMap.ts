import Viz from "viz.js";
// import { Module, render } from "viz.js/full.render";
import * as d3 from "d3";
import { ZoomManager, OnZoomChangedHandler } from "./ZoomManager";
import { CanSelectNode } from "./CanSelectNode";

export interface VizJsMapProps {
  dot: string;
}
export class VizJsMap implements CanSelectNode {
  viz: any;
  zoomManager: ZoomManager;
  svgContainer: HTMLElement;
  selectedElement?: SVGGraphicsElement | null;
  selectedElementStrokeWidth?: string;
  constructor(
    svgContainer: HTMLElement,
    pathToFullRenderJs: string,
    onZoomChanged?: OnZoomChangedHandler
  ) {
    this.svgContainer = svgContainer;
    this.zoomManager = new ZoomManager(onZoomChanged, true);
    this.viz = new Viz({ workerURL: pathToFullRenderJs });
  }
  async render(props: VizJsMapProps) {
    const svgString = await this.viz.renderString(props.dot);
    this.svgContainer.innerHTML = svgString;
    const svg = d3.select(this.svgContainer).select<SVGSVGElement>("svg");
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
    svgGraph!.attr(
      "height",
      this.zoomManager.state.size.height * this.zoomManager.state.scale + 40
    );
  }
  getNodeWithArgdownId(id: string): SVGGraphicsElement | undefined {
    const nodes = this.zoomManager
      .svgGraph!.selectAll("g.node")
      .nodes() as SVGGraphicsElement[];
    const self = this;
    return nodes.find(n => self.getArgdownId(n) === id);
  }
  getArgdownId(node: SVGGraphicsElement): string {
    const title = d3
      .select(node)
      .select<SVGTitleElement>("title")
      .node();
    if (title) {
      console.log("id: " + title.textContent);
      return title.textContent || "";
    }
    return "";
  }
  /**
   *
   * Because we cannot override inline styles, we have to save original inline stroke and strokeWidth attributes and put them back in on deselection.
   */
  deselectNode(): void {
    if (this.selectedElement) {
      this.selectedElement.classList.remove("selected");
      const path = this.selectedElement.getElementsByTagName("path")[0];
      path.setAttribute("stroke-width", this.selectedElementStrokeWidth || "");
      //path.setAttribute("stroke", state.selectedNodeStroke || "");
    }
    this.selectedElement = null;
  }
  selectNode(id: string): void {
    this.deselectNode();
    this.selectedElement = this.getNodeWithArgdownId(id);
    if (this.selectedElement) {
      const path = this.selectedElement.getElementsByTagName("path")[0];
      this.selectedElement.classList.add("selected");
      //state.selectedNodeStroke = path.getAttribute("stroke") || "";
      this.selectedElementStrokeWidth = path.getAttribute("stroke-width") || "";
      //path.setAttribute("stroke", "#40e0d0");
      path.setAttribute("stroke-width", "8");
      this.zoomManager.moveToElement(this.selectedElement);
    }
  }
}
