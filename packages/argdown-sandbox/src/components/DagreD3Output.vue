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
import { DagreMap } from "@argdown/map-views";
import { EventBus } from "../event-bus.js";
import { saveAsSvg, saveAsPng } from "../map-export.js";

var saveDagreAsPng = null;
var saveDagreAsSvg = null;

export default {
  name: "dagre-d3-output",
  created: function() {
    this.$_dagreMap = null;
  },
  computed: {
    map: function() {
      // console.log('map called!')
      this.updateSVG();
      this.$store.getters.argdownData;
      this.$store.getters.config;
      return this.$store.getters.map;
    },
    settings: function() {
      // console.log('rankDir called!')
      this.updateSVG();
      return this.$store.getters.config.dagre;
    }
  },
  watch: {
    map: function() {
      // console.log('map watcher called!')
    },
    settings: function() {}
  },
  mounted: function() {
    var el = this.$refs.svg;
    var $store = this.$store;
    this.$_dagreMap = new DagreMap(el);
    this.updateSVG();
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
      if (!this.$_dagreMap) {
        return;
      }
      const exceptions = this.$store.getters.argdownData.exceptions;
      if (exceptions && exceptions.length > 0) {
        return;
      }
      const props = {
        settings: this.$store.getters.config.dagre,
        map: this.$store.getters.map
      };
      this.$_dagreMap.render(props);
    }
  }
};
</script>

<style lang="scss" scoped>
.dagre-d3-output {
  @import "../../node_modules/@argdown/map-views/dist/src/argdown-dagre.css";
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
