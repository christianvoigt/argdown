<template>
<div class="argdown-snippet" :class="snippetClasses">
    <ArgdownMark/>
    <div class="menu">
        <a href="#" v-if="activeView === 'source'" v-on:click.prevent="activeView ='map'" class='button map'>Map</a>
        <a href="#" v-if="activeView === 'map'" v-on:click.prevent="activeView ='source'" class="button source">Source</a>
        <a href="#" v-if="!fullscreen" v-on:click.prevent="fullscreen = true" class='button fullscreen'><ExpandIcon/></a>
        <a href="#" v-if="fullscreen" v-on:click.prevent="fullscreen = false" class='button embedded'><CompressIcon/></a>
    </div>
    <div v-if="activeView === 'source'" class="source-view">
        <slot name="source"></slot>
    </div>
    <div v-if="activeView === 'map'" ref="mapView" class="map-view">
        <div v-if="zoomMessage" class="zoom-message"><span>{{zoomMessage}}</span></div>
        <div class="map-wrap" v-on:click="addZoom()" v-on:mouseover="onMouseoverMap()" v-on:mouseout="onMouseoutMap()"><slot name="map"></slot></div>
        <div v-if="title" class="map-title">{{title}}</div>
    </div>
</div>
</template>

<script>
import ArgdownMark from "./ArgdownMark.vue";
const showAllAndCenterMap = component => {
  if (!component.svg) {
    return;
  }
  let positionInfo = component.svg.node().getBoundingClientRect();
  const xScale = positionInfo.width / component.graphSize.width;
  const yScale = positionInfo.height / component.graphSize.height;
  const scale = Math.min(xScale, yScale);
  const x = (positionInfo.width - component.graphSize.width * scale) / 2;
  const scaledHeight = component.graphSize.height * scale;
  const y = scaledHeight + (positionInfo.height - scaledHeight) / 2;
  setZoom(x, y, scale, 0, component);
};
const setZoom = (x, y, scale, duration, component) => {
  if (!component.svg || !component.zoom) {
    return;
  }
  component.svg
    .transition()
    .duration(duration)
    .call(
      component.zoom.transform,
      // eslint-disable-next-line
      component.zoomIdentity.translate(x, y).scale(scale)
    );
};

export default {
  data: function() {
    var view = "source";
    if (this.initialView === "map") {
      view = "map";
    }
    return {
      activeView: view,
      zoomMessage: "",
      isMounted: false,
      zoomIsInitialized: false,
      fullscreen: false
    };
  },
  mounted: function() {
    this.$data.isMounted = true;
  },
  watch: {
    fullscreen: function(newValue) {
      if (newValue) {
        document.body.classList.add("noscroll");
      } else {
        document.body.classList.remove("noscroll");
      }
    },
    activeView: function(newValue, oldValue) {
      if (newValue !== "map" && this.$data.isMounted && this.$data.zoomIsInitialized) {
        if (this.removeZoomTimeout) {
          clearTimeout(this.removeZoomTimeout);
          this.removeZoomTimeout = null;
        }
        this.removeZoom();
      }
    }
  },
  computed: {
    snippetClasses: function() {
      let classes = this.$data.fullscreen ? "fullscreen" : "embedded";
      classes += " " + this.$data.activeView + "-active";
      return classes;
    }
  },
  methods: {
    onMouseoutMap: function() {
      this.$data.zoomMessage = "";
      if (!this.removeZoomTimeout) {
        this.removeZoomTimeout = setTimeout(() => this.removeZoom(), 3000);
      }
    },
    onMouseoverMap: function() {
      if (this.removeZoomTimeout) {
        clearTimeout(this.removeZoomTimeout);
        this.removeZoomTimeout = null;
      }
      if (!this.$data.zoomIsInitialized) {
        this.$data.zoomMessage = "Click once to enable zoom";
      }
    },
    addZoom: function() {
      if (this.$data.zoomIsInitialized) {
        return;
      }
      this.$data.zoomMessage = "Initializing zoom...";
      var self = this;
      import("d3").then(d3 => {
        self.zoomIdentity = d3.zoomIdentity;
        self.svg = d3.select(self.$refs.mapView).select("svg");
        self.svgGraph = self.svg.select("g");
        // self.svg.attr("height", "100%");
        self.svg.attr("width", "100%");
        self.svg.attr("viewBox", null);
        self.zoom = d3.zoom().on("zoom", function() {
          self.svgGraph.attr("transform", d3.event.transform);
          self.scale = d3.event.transform.k;
          self.x = d3.event.transform.x;
          self.y = d3.event.transform.y;
        });
        self.svg.call(self.zoom);
        const groupNode = self.svgGraph.node();
        const bBox = groupNode.getBBox();
        self.graphSize = {};
        self.graphSize.width = bBox.width;
        self.graphSize.height = bBox.height;
        showAllAndCenterMap(self);
        self.$data.zoomIsInitialized = true;
        self.$data.zoomMessage = "";
      });
    },
    removeZoom: function() {
      if (this.removeZoomTimeout) {
        clearTimeout(this.removeZoomTimeout);
        this.removeZoomTimeout = null;
      }
      if (!this.$data.zoomIsInitialized) {
        return;
      }
      this.svg.on(".zoom", null);
      this.zoomIdentity = null;
      this.svg = null;
      this.svgGraph = null;
      this.zoom = null;
      this.graphSize = null;
      this.$data.zoomIsInitialized = false;
    }
  },
  props: { title: String, initialView: String },
  components: {
    ArgdownMark
  }
};
</script>

<style lang="stylus" scoped>
$accentColor = #3e8eaf;
$textColor = #2c3e50;
$borderColor = #eaecef;
$codeBgColor = #282c34;
$codeBgColor = #18222d;
$argumentColor = #62c4f0;
$statementColor = #a3cdcf;
$grey = #7a8388;

.argdown-snippet {
  position: relative;

  // &.source-active {
  // .argdown-mark {
  // background-color: #f4f4f4;
  // }
  // .source-view{
  // pre{
  // border: 0;
  // }
  // }
  // }
  &.fullscreen {
    position: fixed;
    z-index: 10000;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;

    .menu {
      right: 22px;
    }

    .source-view {
      height: 100%;

      .language-argdown.extra-class {
        height: 100%;
        border-radius: 0;
        margin: 0;

        pre[class*='language-'] {
          box-sizing: border-box;
          height: 100%;
          overflow: auto;
          margin: 0;
          padding-left: 10em;
          padding-top: 80px;

          code {
            padding-bottom: 80px;
          }
        }
      }
    }

    .map-view, .map-wrap {
      height: 100%;
      border-radius: 0;
      border: 0;
    }

    .map-view svg {
      height: 100%;
    }
  }

  .map-view {
    display: flex;
    flex-direction: column;
    background: #fff;
    z-index: 10;
    width: 100%;
    border: 1px solid $borderColor;
    border-radius: 6px;

    .map-wrap {
      display: flex;
      flex-direction: column;
    }

    svg {
      max-width: 100%;
      min-height: 150px;
      height: auto;
      margin: 0 auto;
    }

    .map-title {
      padding: 0.8rem;
      border-top: 1px solid #EEE;
    }
  }

  .source-view {
    .lanugage-argdown.extra-class {
      background-color: transparent;
    }

    pre {
      // background-color: #f4f4f4;
      background-color: #fff;
      border: 1px solid $borderColor;
      border-radius: 6px;
      padding-top: 50px;
    }
  }

  .menu {
    position: absolute;
    right: 6px;
    top: 6px;
    z-index: 10;
    margin: 0 -3px;
  }

  .button {
    display: inline-block;
    font-size: 0.8rem;
    color: #fff;
    background-color: #3e8eaf;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    transition: background-color 0.1s ease;
    box-sizing: border-box;
    border-bottom: 1px solid #38809d;
    margin: 0 3px;

    &:hover {
      background-color: #387e9c;
    }

    svg {
      height: 0.8rem;
      width: auto;
      color: #fff;
    }
  }

  .zoom-message {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 6px;
    text-align: center;

    span {
      display: inline-block;
      font-size: 0.8rem;
      padding: 0.5rem;
      color: #3e8eaf;
      background: rgba(256, 256, 256, 0.9);
      text-align: center;
    }
  }
}
</style>