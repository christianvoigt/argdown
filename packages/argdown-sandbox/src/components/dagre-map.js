import * as dagreD3 from "dagre-d3";
import * as pixelWidth from "string-pixel-width";
import * as d3 from "d3";
import { ArgdownTypes } from "@argdown/core";
import { splitByLineWidth, splitByCharactersInLine } from "@argdown/core";
import _ from "lodash";

var createTSpan = (str, font, fontSize, bold, color, dy = "1em") => {
  var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
  tspan.setAttributeNS(
    "http://www.w3.org/XML/1998/namespace",
    "xml:space",
    "preserve"
  );
  let styles = `font-family: ${font}; font-size:${fontSize}px; color:${color};`;
  if (bold) {
    styles = styles + "font-weight: bold;";
  }
  tspan.setAttribute("style", styles);
  tspan.setAttribute("dy", dy);
  // tspan.setAttribute("x", "0");
  tspan.setAttribute("text-anchor", "middle");
  tspan.innerHTML = escapeHtml(str);
  tspan.setAttribute("x", "0");

  // var lineWidth = tspan.getComputedTextLength();
  // const width = 200;
  // tspan.setAttribute("x", (width + (width - lineWidth)) * 0.5);
  return tspan;
};

function escapeHtml(str) {
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");

  return str;
}
const createDagreNode = function(node, g, currentGroup, settings, tags) {
  var svgLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");

  var docFrag = document.createDocumentFragment();
  let maxWidth = 0;
  let lineWidth = 0;
  let rx = 0;
  let ry = 0;
  let titleSettings = null;
  let textSettings = null;
  if (node.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
    lineWidth = settings.argument.lineWidth;
    titleSettings = settings.argument.title;
    textSettings = settings.argument.text;
    rx = settings.argument.rx;
    ry = settings.argument.ry;
  } else if (node.type === ArgdownTypes.STATEMENT_MAP_NODE) {
    lineWidth = settings.statement.lineWidth;
    titleSettings = settings.statement.title;
    textSettings = settings.statement.text;
    rx = settings.statement.rx;
    ry = settings.statement.ry;
  } else {
    lineWidth = settings.group.lineWidth;
    titleSettings = settings.group.title;
    textSettings = null;
  }
  if (node.labelTitle) {
    let { bold, fontSize, font, charactersInLine } = titleSettings;
    var titleArr = settings.measureLinePixelWidth
      ? splitByLineWidth(node.labelTitle, {
          maxWidth: lineWidth,
          fontSize,
          bold,
          font
        })
      : splitByCharactersInLine(node.labelTitle, charactersInLine, true);
    for (let str of titleArr) {
      const width = pixelWidth(str, {
        font: font,
        size: fontSize,
        bold: bold
      });
      maxWidth = width > maxWidth ? width : maxWidth;
      docFrag.appendChild(
        createTSpan(str, font, fontSize, bold, node.fontColor)
      );
    }
  }
  if (node.labelText) {
    let { bold, fontSize, font, charactersInLine } = textSettings;
    var textArr = settings.measureLinePixelWidth
      ? splitByLineWidth(node.labelText, {
          maxWidth: lineWidth,
          fontSize,
          bold,
          font
        })
      : splitByCharactersInLine(node.labelText, charactersInLine, true);
    let dy = node.labelTitle ? "1.5em" : "1em";
    for (let str of textArr) {
      const width = pixelWidth(str, {
        font: font,
        size: fontSize,
        bold: bold
      });
      maxWidth = width > maxWidth ? width : maxWidth;
      docFrag.appendChild(
        createTSpan(str, font, fontSize, bold, node.fontColor, dy)
      );
      dy = "1em";
    }
  }
  svgLabel.appendChild(docFrag);
  const translate = (lineWidth - (lineWidth - maxWidth)) * 0.5;
  svgLabel.setAttribute("transform", `translate(${translate})`);
  const nodeProperties = {
    labelType: "svg",
    label: svgLabel,
    class: node.type,
    rx,
    ry,
    width: lineWidth + 20
  };
  // Old ForeignObject label (buggy in Chrome):
  // nodeProperties.label = '<div class="node-label">';
  // if (node.labelTitle) {
  //   nodeProperties.label += "<h3>" + escapeHtml(node.labelTitle) + "</h3>";
  // }
  // // eslint-disable-next-line
  // if (
  //   node.labelText &&
  //   (node.type === ArgdownTypes.STATEMENT_MAP_NODE ||
  //     node.type === ArgdownTypes.ARGUMENT_MAP_NODE)
  // ) {
  //   nodeProperties.label += "<p>" + escapeHtml(node.labelText) + "</p>";
  // }
  // nodeProperties.label += "</div>";
  if (node.tags) {
    for (let tag of node.tags) {
      nodeProperties.class += " ";
      // eslint-disable-next-line
      nodeProperties.class += tags[tag].cssClass;
    }
  }
  if (node.color) {
    if (node.type === ArgdownTypes.STATEMENT_MAP_NODE) {
      nodeProperties.style = `stroke:${node.color};`;
    } else {
      nodeProperties.style = `fill:${node.color};`;
    }
  }

  if (node.type === ArgdownTypes.GROUP_MAP_NODE) {
    nodeProperties.clusterLabelPos = "top";
    nodeProperties.class += " level-" + node.level;
  }
  g.setNode(node.id, nodeProperties);
  if (currentGroup) {
    g.setParent(node.id, currentGroup.id);
  }
  if (node.type === ArgdownTypes.GROUP_MAP_NODE) {
    for (let child of node.children) {
      createDagreNode(child, g, node, settings, tags);
    }
  }
};

export const defaultSettings = {
  rankDir: "BT",
  rankSep: 50,
  nodeSep: 70,
  measureLinePixelWidth: false,
  argument: {
    lineWidth: 150,
    rx: 5,
    ry: 5,
    title: {
      bold: true,
      font: "arial",
      fontSize: 14,
      charactersInLine: 25
    },
    text: {
      bold: false,
      font: "arial",
      fontSize: 14,
      charactersInLine: 25
    }
  },
  statement: {
    lineWidth: 150,
    rx: 5,
    ry: 5,
    title: {
      bold: true,
      font: "arial",
      fontSize: 14,
      charactersInLine: 25
    },
    text: {
      bold: false,
      font: "arial",
      fontSize: 14,
      charactersInLine: 25
    }
  },
  group: {
    lineWidth: 300,
    title: {
      bold: false,
      font: "arial",
      fontSize: 18,
      charactersInLine: 40
    }
  }
};

export const createDagreMap = function(map, svgElement, settings, tags) {
  settings = _.defaultsDeep({}, settings, defaultSettings);
  // eslint-disable-next-line
  if (
    !svgElement ||
    !map ||
    !map.nodes ||
    !map.edges ||
    map.nodes.length === 0
  ) {
    // console.log('svg or map undefined')
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();
    return;
  }
  // Create the input graph
  const g = new dagreD3.graphlib.Graph({ compound: true })
    .setGraph({
      rankdir: settings.rankDir,
      rankSep: settings.rankSep,
      nodeSep: settings.nodeSep,
      marginx: 20,
      marginy: 20
    })
    .setDefaultEdgeLabel(function() {
      return {};
    });

  for (let node of map.nodes) {
    createDagreNode(node, g, null, settings, tags);
  }

  for (let edge of map.edges) {
    const props = {
      class: edge.relationType
    };
    if (edge.relationType === "contradictory") {
      props.arrowhead = "diamond";
      props.arrowtail = "diamond";
    }
    g.setEdge(edge.from.id, edge.to.id, props);
  }

  //   const nodes = g.nodes();

  //   for (let v of nodes) {
  //     const node = g.node(v);
  //     // Round the corners of the nodes
  //     node.rx = node.ry = 5;
  //   }

  // Create the renderer
  const render = new dagreD3.render(); // eslint-disable-line new-cap
  // Add our custom arrow
  render.arrows().diamond = function normal(parent, id, edge, type) {
    var marker = parent
      .append("marker")
      .attr("id", id)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto");

    var path = marker
      .append("path")
      .attr("d", "M 0 5 L 5 2 L 10 5 L 5 8 z")
      .style("stroke-width", 0)
      .style("stroke-dasharray", "1,0");
    dagreD3.util.applyStyle(path, edge[type + "Style"]);
    if (edge[type + "Class"]) {
      path.attr("class", edge[type + "Class"]);
    }
  };

  // Set up an SVG group so that we can translate the final graph.
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  svg.append("g");
  const svgGroup = svg.select("g");
  svgGroup.attr("class", "dagre");
  // console.log('svg ' + svg)
  // console.log('svgGroup ' + svgGroup)

  var zoom = d3.zoom().on("zoom", function() {
    // eslint-disable-next-line
    svgGroup.attr("transform", d3.event.transform);
  });
  svg.call(zoom);

  // Run the renderer. This is what draws the final graph.
  render(svgGroup, g);
  // Center the graph
  let initialScale = 0.75;
  let getSvgWidth = function() {
    let positionInfo = svg.node().getBoundingClientRect();
    return positionInfo.width;
  };
  svg
    .transition()
    .duration(0)
    .call(
      zoom.transform,
      // eslint-disable-next-line
      d3.zoomIdentity
        .translate((getSvgWidth() - g.graph().width * initialScale) / 2, 20)
        .scale(initialScale)
    );
  svgGroup.attr("height", g.graph().height * initialScale + 40);
};
