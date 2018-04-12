<template>
  <div class="viz-js-output map-output output">
    <div class="content">
      <div ref="container" class="rendered" v-html="svg">
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as Viz from 'viz.js'
import * as d3 from 'd3'
import { EventBus } from '../event-bus.js'
import {saveAsSvg, saveAsPng} from '../map-export.js'

var saveVizAsPng = null
var saveVizAsSvg = null

export default {
  name: 'viz-js-output',
  methods: {
    addZoomBehavior: function () {
      const svgContainer = this.$refs.container
      if (!svgContainer) {
        return
      }
      Vue.nextTick(function () {
        const svg = d3.select(svgContainer).select('svg')
        const svgGroup = svg.select('g')
        svg.attr('class', 'map-svg')
        svg.attr('width', '100%')
        svg.attr('height', '100%')
        svg.attr('viewBox', null)
        var zoom = d3.behavior.zoom().on('zoom', function () {
          svgGroup.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')')
        })
        svg.call(zoom)
        if (!svg.node()) {
          return
        }
        const svgSize = svg.node().getBoundingClientRect()
        const groupSize = svgGroup.node().getBBox()
        const initialScale = 0.75
        zoom
          .translate([(svgSize.width - groupSize.width * initialScale) / 2, (svgSize.height + groupSize.height * initialScale) / 2])
          .scale(initialScale)
          .event(svg)
        svgGroup.attr('height', groupSize.height * initialScale + 40)
      })
    }
  },
  mounted: function () {
    this.addZoomBehavior()
    var el = this.$refs.container
    var $store = this.$store
    saveVizAsPng = function () {
      var scale = $store.state.pngScale
      saveAsPng(el.getElementsByTagName('svg')[0], scale, false)
    }
    saveVizAsSvg = function () {
      saveAsSvg(el.getElementsByTagName('svg')[0], false)
    }
    EventBus.$on('save-map-as-svg', saveVizAsSvg)
    EventBus.$on('save-map-as-png', saveVizAsPng)
  },
  beforeDestroy: function () {
    EventBus.$off('save-map-as-svg', saveVizAsSvg)
    EventBus.$off('save-map-as-png', saveVizAsPng)
  },
  computed: {
    svg: function () {
      this.addZoomBehavior()
      const dot = this.$store.getters.dot
      return dot ? Viz(dot) : null
    }
  }
}
</script>

<style scoped>
.rendered{
  height:100%;
}
</style>
