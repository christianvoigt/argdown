<template>
  <div class="viz-js-output map-output output">
    <div class="content">
      <div ref="container" class="rendered" v-html="svg"></div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render.js";
import * as d3 from "d3";
import { EventBus } from "../event-bus.js";
import { saveAsSvg, saveAsPng } from "../map-export.js";

var viz = new Viz({ Module, render });
var saveVizAsPng = null;
var saveVizAsSvg = null;

export default {
  name: "viz-js-output",
  methods: {
    addZoomBehavior: function() {
      const svgContainer = this.$refs.container;
      if (!svgContainer) {
        return;
      }
      Vue.nextTick(function() {
        // next tick is not enough, this will still cause some d3-related bug
        // so we simply wait a little longer...
        setTimeout(() => {
          console.log("adding zoom");
          const svg = d3.select(svgContainer).select("svg");
          const svgGroup = svg.select("g");
          svg.attr("class", "map-svg");
          svg.attr("width", "100%");
          svg.attr("height", "100%");
          svg.attr("viewBox", null);
          var zoom = d3.zoom().on("zoom", function() {
            // eslint-disable-next-line
            svgGroup.attr("transform", d3.event.transform);
          });
          svg.call(zoom);
          if (!svg.node()) {
            return;
          }
          const svgSize = svg.node().getBoundingClientRect();
          const groupSize = svgGroup.node().getBBox();
          const initialScale = 0.75;
          svg
            .transition()
            .duration(0)
            .call(
              zoom.transform,
              d3.zoomIdentity
                .translate(
                  (svgSize.width - groupSize.width * initialScale) / 2,
                  (svgSize.height + groupSize.height * initialScale) / 2
                )
                .scale(initialScale)
            );
          svgGroup.attr("height", groupSize.height * initialScale + 40);
        }, 100);
      });
    }
  },
  mounted: function() {
    this.addZoomBehavior();
    var el = this.$refs.container;
    var $store = this.$store;
    saveVizAsPng = function() {
      var scale = $store.state.pngScale;
      saveAsPng(el.getElementsByTagName("svg")[0], scale, false);
    };
    saveVizAsSvg = function() {
      saveAsSvg(el.getElementsByTagName("svg")[0], false);
    };
    EventBus.$on("save-map-as-svg", saveVizAsSvg);
    EventBus.$on("save-map-as-png", saveVizAsPng);
  },
  beforeDestroy: function() {
    EventBus.$off("save-map-as-svg", saveVizAsSvg);
    EventBus.$off("save-map-as-png", saveVizAsPng);
  },
  asyncComputed: {
    svg: function() {
      this.addZoomBehavior();
      const dot = this.$store.getters.dot;
      return dot ? viz.renderString(dot) : null;
    }
  }
};
</script>

<style  lang="scss" scoped>
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
</style>
