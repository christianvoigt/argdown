<template>
  <div ref="output" class="dagre-d3-output map-output output">
    <div class="content">
      <div class="rendered">
        <svg ref="svg" width="100%" height="100%">
          <g class="dagre" style="transform: translate(0, 10px)">
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";
import { EventBus } from "../event-bus.js";
import { saveAsSvg, saveAsPng } from "../map-export.js";
import { ArgdownTypes } from "@argdown/core";

var saveDagreAsPng = null;
var saveDagreAsSvg = null;

export default {
  name: "dagre-d3-output",
  computed: {
    map: function() {
      // console.log('map called!')
      this.updateSVG();
      this.$store.getters.argdownData;
      return this.$store.getters.map;
    },
    rankDir: function() {
      // console.log('rankDir called!')
      this.updateSVG();
      return this.$store.state.config.dagre.rankDir;
    },
    nodeSep: function() {
      // console.log('nodeSep called!')
      this.updateSVG();
      return this.$store.state.config.dagre.nodeSep;
    },
    rankSep: function() {
      // console.log('nodeSep called!')
      this.updateSVG();
      return this.$store.state.config.dagre.rankSep;
    }
  },
  watch: {
    map: function() {
      // console.log('map watcher called!')
    },
    rankDir: function() {
      // console.log('rankDir watcher called!')
    },
    nodeSep: function() {},
    rankSep: function() {}
  },
  mounted: function() {
    this.updateSVG();
    var el = this.$refs.svg;
    var $store = this.$store;
    saveDagreAsPng = function() {
      var scale = $store.state.pngScale;
      saveAsPng(el, scale, true);
    };
    saveDagreAsSvg = function() {
      saveAsSvg(el, true);
    };
    EventBus.$on("save-map-as-svg", saveDagreAsSvg);
    EventBus.$on("save-map-as-png", saveDagreAsPng);
  },
  beforeDestroy: function() {
    EventBus.$off("save-map-as-svg", saveDagreAsSvg);
    EventBus.$off("save-map-as-png", saveDagreAsPng);
  },
  methods: {
    addNode: function(node, g, currentGroup) {
      const nodeProperties = {
        labelType: "html",
        class: node.type,
        paddingBottom: 0,
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0
      };
      nodeProperties.label = '<div class="node-label">';
      if (node.labelTitle) {
        nodeProperties.label += "<h3>" + node.labelTitle + "</h3>";
      }
      // eslint-disable-next-line
      if (
        node.labelText &&
        (node.type === ArgdownTypes.STATEMENT_MAP_NODE ||
          node.type === ArgdownTypes.ARGUMENT_MAP_NODE)
      ) {
        nodeProperties.label += "<p>" + node.labelText + "</p>";
      }
      if (node.tags) {
        for (let tag of node.tags) {
          nodeProperties.class += " ";
          // eslint-disable-next-line
          nodeProperties.class += this.$store.getters.tags[tag].cssClass;
        }
      }
      nodeProperties.label += "</div>";

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
          this.addNode(child, g, node);
        }
      }
    },
    updateSVG: function() {
      // console.log('updateSVG called!')
      const map = this.$store.getters.map;
      // eslint-disable-next-line
      if (!this.$refs.svg || !map || !map.nodes || !map.edges || map.nodes.length === 0) {
        // console.log('svg or map undefined')
        const svg = d3.select(this.$refs.svg);
        svg.selectAll("*").remove();
        return;
      }
      // Create the input graph
      const g = new dagreD3.graphlib.Graph({ compound: true })
        .setGraph({
          rankdir: this.$store.state.config.dagre.rankDir,
          rankSep: this.$store.state.config.dagre.rankSep,
          nodeSep: this.$store.state.config.dagre.nodeSep,
          marginx: 20,
          marginy: 20
        })
        .setDefaultEdgeLabel(function() {
          return {};
        });

      for (let node of map.nodes) {
        this.addNode(node, g);
      }

      for (let edge of map.edges) {
        g.setEdge(edge.from.id, edge.to.id, { class: edge.relationType });
      }

      const nodes = g.nodes();

      for (let v of nodes) {
        const node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
      }

      // Create the renderer
      const render = new dagreD3.render(); // eslint-disable-line new-cap

      // const layout = dagreD3.layout().rankSep(50).rankDir('BT')

      // Set up an SVG group so that we can translate the final graph.
      const svg = d3.select(this.$refs.svg);
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
      // renderer.layout(layout).run(svgGroup, g)
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
          d3.zoomIdentity.translate((getSvgWidth() - g.graph().width * initialScale) / 2, 20).scale(initialScale)
        );
      svgGroup.attr("height", g.graph().height * initialScale + 40);
    }
  }
};
</script>

<style lang="scss" scoped>
.dagre-d3-output {
  @import "../scss/dagre.css";
  .content {
    flex: 1;
    overflow: auto;
    .rendered {
      flex: 1;
      display: flex;
      flex-direction: column;
      /* Firefox bug fix styles */
      min-width: 0;
      min-height: 0;
    }
  }
}
</style>
