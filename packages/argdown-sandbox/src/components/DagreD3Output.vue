<template>
  <div ref="output" class="dagre-d3-output map-output output">
    <div class="content">
      <div class="rendered">
        <svg ref="svg" width="100%" height="100%">
          <g class="dagre" style="transform: translate(0, 10px)"></g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
/*eslint-disable */
import * as dagreD3 from "dagre-d3";
import * as pixelWidth from "string-pixel-width";
import * as d3 from "d3";
import { EventBus } from "../event-bus.js";
import { saveAsSvg, saveAsPng } from "../map-export.js";
import { ArgdownTypes } from "@argdown/core";
import { splitByLineWidth } from "@argdown/core";
import { createDagreMap } from "./dagre-map.js";

var saveDagreAsPng = null;
var saveDagreAsSvg = null;

export default {
  name: "dagre-d3-output",
  computed: {
    map: function() {
      // console.log('map called!')
      this.updateSVG();
      this.$store.getters.argdownData;
      this.$store.getters.config;
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
    updateSVG: function() {
      createDagreMap(
        this.$store.getters.map,
        this.$refs.svg,
        this.$store.getters.config.dagre,
        this.$store.getters.tags
      );
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
