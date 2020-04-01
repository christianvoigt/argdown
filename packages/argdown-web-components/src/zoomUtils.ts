import { zoom, ZoomBehavior, zoomIdentity } from "d3-zoom";
import { select, event, Selection } from "d3-selection";

export const addZoom = (
  svg: Selection<SVGSVGElement, null, HTMLElement, any>
) => {
  const g = svg.select<SVGGraphicsElement>("g");
  const listener = function() {
    g.attr("transform", event.transform);
  };
  const zoomBehavior = zoom<SVGSVGElement, null>().on("zoom", listener);
  svg.call(zoomBehavior);
  const bbox = g.node().getBBox();
  showAllAndCenterMap(svg, zoomBehavior, bbox.width, bbox.height);
  return zoomBehavior;
};
export const removeZoom = (
  svg: Selection<SVGSVGElement, null, HTMLElement, any>,
  zoomBehavior: ZoomBehavior<SVGSVGElement, any>
) => {
  setZoom(svg, zoomBehavior, 0, 0, 0, 0);
  zoomBehavior.on("zoom", null);
};

export const showAllAndCenterMap = (
  svg: Selection<SVGSVGElement, null, HTMLElement, any>,
  zoomBehavior: ZoomBehavior<SVGSVGElement, any>,
  width: number,
  height: number
) => {
  let positionInfo = svg.node().getBoundingClientRect();
  const horizontalPadding = 10;
  const verticalPadding = 10;
  const availableWidth = positionInfo.width - horizontalPadding * 2;
  const availableHeight = positionInfo.height - verticalPadding * 2 - 40; // takes into account padding-top
  const xScale = availableWidth / width;
  const yScale = availableHeight / height;
  const scale = Math.min(xScale, yScale);
  const x = horizontalPadding + (availableWidth - width * scale) / 2;
  const scaledHeight = height * scale;
  const y =
    40 +
    verticalPadding +
    availableHeight +
    (availableHeight - scaledHeight) / 2;
  setZoom(svg, zoomBehavior, x, y, scale, 0);
};
export const setZoom = (
  svg: Selection<SVGSVGElement, null, HTMLElement, any>,
  zoomBehavior: ZoomBehavior<SVGSVGElement, any>,
  x: number,
  y: number,
  scale: number,
  duration: number
) => {
  svg
    .transition()
    .duration(duration)
    .call(zoomBehavior.transform, zoomIdentity.translate(x, y).scale(scale));
};
