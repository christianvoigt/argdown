export const convertCoordsL2L = (
  svg: SVGSVGElement,
  fromElem: SVGGraphicsElement,
  toElem: SVGGraphicsElement
) => {
  const matrixL2G = fromElem.getCTM()!;
  const matrixG2L = toElem.getCTM()!.inverse();
  const bBox = fromElem.getBBox();
  const point = svg.createSVGPoint();
  point.x = bBox.x + bBox.width / 2;
  point.y = bBox.y + bBox.height / 2;
  return point.matrixTransform(matrixL2G).matrixTransform(matrixG2L);
};
