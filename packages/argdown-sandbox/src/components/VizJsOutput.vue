<template>
  <div class="viz-js-output map-output output">
    <div class="content">
      <div ref="container" class="rendered"></div>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../event-bus.js";
import { saveAsSvg, saveAsPng } from "../map-export.js";
import { VizJsMap } from "@argdown/map-views";

var saveVizAsPng = null;
var saveVizAsSvg = null;

// eslint-disable-next-line no-undef
var basePath = process.env.BASE_URL || "/";

export default {
  name: "viz-js-output",
  methods: {
    updateMap: function () {
      if (!this.$_vizJsMap) {
        return;
      }
      const exceptions = this.$store.getters.argdownData.exceptions;
      if (exceptions && exceptions.length > 0) {
        return;
      }

      const props = {
        dot: this.$store.getters.dot,
        settings: this.$store.getters.config.vizJs,
      };
      this.$_vizJsMap.render(props).catch((e) => console.log(e));
    },
  },
  computed: {
    dot: function () {
      this.updateMap();
      this.$store.getters.config;
      return this.$store.getters.dot;
    },
  },
  watch: {
    dot: function () {
      // console.log('map watcher called!')
    },
  },

  mounted: function () {
    const svgContainer = this.$refs.container;
    const workerURL = basePath + "render.browser.js";
    this.$_vizJsMap = new VizJsMap(svgContainer, {
      workerURL: workerURL,
    });
    this.updateMap();
    var el = this.$refs.container;
    var $store = this.$store;
    saveVizAsPng = function () {
      var scale = $store.state.pngScale;
      saveAsPng(el.getElementsByTagName("svg")[0], scale, false);
    };
    saveVizAsSvg = function () {
      saveAsSvg(el.getElementsByTagName("svg")[0], false);
    };
    EventBus.$on("save-map-as-svg", saveVizAsSvg);
    EventBus.$on("save-map-as-png", saveVizAsPng);
  },
  beforeDestroy: function () {
    EventBus.$off("save-map-as-svg", saveVizAsSvg);
    EventBus.$off("save-map-as-png", saveVizAsPng);
  },
};
</script>

<style lang="scss" scoped>
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
