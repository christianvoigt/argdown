<template>
  <div class="viz-js-output map-output output">
    <div class="content">
      <div ref="container" class="rendered" v-html="svg"></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as Viz from 'viz.js'
import * as d3 from 'd3'

export default {
  name: 'viz-js-output',
  methods: {
    addZoomBehavior: function () {
      const svgContainer = this.$refs.container
      if (!svgContainer) {
        return
      }
      console.log(svgContainer)
      Vue.nextTick(function () {
        const svg = d3.select(svgContainer).select('svg')
        const svgGroup = svg.select('g')
        svg.attr('width', '100%')
        svg.attr('height', '100%')
        svg.attr('viewBox', null)
        var zoom = d3.behavior.zoom().on('zoom', function () {
          svgGroup.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')')
        })
        svg.call(zoom)
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
  },
  computed: {
    svg: function () {
      this.addZoomBehavior()
      return Viz(this.$store.getters.dot)
    }
  }
}
</script>

<style scoped>
.rendered{
  height:100%;
}
</style>
