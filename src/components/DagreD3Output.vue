<template>
  <div ref="output" class="dagre-d3-output map-output output">
    <div class="content">
      <div class="rendered">
        <svg ref="svg" width="100%" height="100%">
          <g style="transform: translate(0, 10px)">
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import * as dagreD3 from 'dagre-d3'
import * as d3 from 'd3'

export default {
  name: 'dagre-d3-output',
  computed: {
    map: function () {
      // console.log('map called!')
      this.updateSVG()
      this.$store.getters.argdownData
      return this.$store.getters.map
    },
    rankDir: function () {
      // console.log('rankDir called!')
      this.updateSVG()
      return this.$store.state.config.dagre.rankDir
    },
    nodeSep: function () {
      // console.log('nodeSep called!')
      this.updateSVG()
      return this.$store.state.config.dagre.nodeSep
    },
    rankSep: function () {
      // console.log('nodeSep called!')
      this.updateSVG()
      return this.$store.state.config.dagre.rankSep
    }
  },
  watch: {
    map: function () {
      // console.log('map watcher called!')
    },
    rankDir: function () {
      // console.log('rankDir watcher called!')
    },
    nodeSep: function () {
    },
    rankSep: function () {
    }
  },
  mounted: function () {
    this.updateSVG()
  },
  methods: {
    addNode: function (node, g, currentGroup) {
      const nodeProperties = {
        labelType: 'html',
        class: node.type,
        paddingBottom: 0,
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0
      }
      nodeProperties.label = '<div class="node-label">'
      if (node.labelTitle) {
        nodeProperties.label += '<h3>' + node.labelTitle + '</h3>'
      }
      if (node.labelText && (node.type === 'statement' || node.type === 'argument')) {
        nodeProperties.label += '<p>' + node.labelText + '</p>'
      }
      if (node.tags) {
        for (let tag of node.tags) {
          nodeProperties.class += ' '
          nodeProperties.class += this.$store.getters.tagsDictionary[tag].cssClass
        }
      }
      nodeProperties.label += '</div>'

      if (node.type === 'group') {
        nodeProperties.clusterLabelPos = 'top'
        nodeProperties.class += ' level-' + node.level
      }
      g.setNode(node.id, nodeProperties)
      if (currentGroup) {
        g.setParent(node.id, currentGroup.id)
      }
      if (node.type === 'group') {
        for (let child of node.nodes) {
          this.addNode(child, g, node)
        }
      }
    },
    updateSVG: function () {
      // console.log('updateSVG called!')
      const map = this.$store.getters.map

      if (!this.$refs.svg || !map || !map.nodes || !map.edges) {
        // console.log('svg or map undefined')
        return
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
        .setDefaultEdgeLabel(function () { return {} })

      for (let node of map.nodes) {
        this.addNode(node, g)
      }

      for (let edge of map.edges) {
        g.setEdge(edge.from.id, edge.to.id, { class: edge.type })
      }

      const nodes = g.nodes()

      for (let v of nodes) {
        const node = g.node(v)
        // Round the corners of the nodes
        node.rx = node.ry = 5
      }

      // Create the renderer
      const render = new dagreD3.render() // eslint-disable-line new-cap

      // const layout = dagreD3.layout().rankSep(50).rankDir('BT')

      // Set up an SVG group so that we can translate the final graph.
      const svg = d3.select(this.$refs.svg)
      svg.selectAll('*').remove()

      svg.append('g')
      const svgGroup = svg.select('g')
      // console.log('svg ' + svg)
      // console.log('svgGroup ' + svgGroup)

      var zoom = d3.behavior.zoom().on('zoom', function () {
        svgGroup.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')')
      })
      svg.call(zoom)

      // Run the renderer. This is what draws the final graph.
      render(svgGroup, g)
      // renderer.layout(layout).run(svgGroup, g)
      // Center the graph
      let initialScale = 0.75
      let getSvgWidth = function () {
        let positionInfo = svg.node().getBoundingClientRect()
        return positionInfo.width
      }
      zoom
        .translate([(getSvgWidth() - g.graph().width * initialScale) / 2, 20])
        .scale(initialScale)
        .event(svg)
      svgGroup.attr('height', g.graph().height * initialScale + 40)
    }
  }
}
</script>

<style lang="scss">
.dagre-d3-output{
  .content{
    flex: 1;
    overflow: auto;   
    .rendered{
      flex:1;
      display:flex;
      flex-direction:column;
      /* Firefox bug fix styles */
      min-width:0;
      min-height:0;
    } 
  }
  .cluster {
    rect{
      fill: #ddd;      
    }
    .node-label{
      width:auto;
    }
    h3{
      margin:0;
      padding-top:3px;
      font-size:14px;
    }
    &.level-0 rect{
      fill:#dadada;
    }
    &.level-1 rect{
      fill:#bababa;
    }
    &.level-2 rect{
      fill:#aaa;
    }
  }

  text {
    font-weight: 300;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serf;
    font-size: 14px;
  }

  .node rect {
    stroke: #999;
    fill: #fff;
    stroke-width: 1.5px;
  }

  .edgePath path {
    stroke: #333;
    stroke-width: 1.5px;
  }    
  .edgePath.attack {
    path{
      stroke: red;
    }
    marker{
      fill: red;
    }
  }
  .edgePath.support {
    path{
      stroke: green;
    }
    marker{
      fill: green;
    }
  }
  .edgePath.undercut {
    path{
      stroke: purple;
    }
    marker{
      fill: purple;
    }
  }  
  .node{
  cursor:pointer;
  display:block;
  position:static;
  margin:0;
  white-space: normal;
  width:200px;
  height:auto;
  text-align:center;
  color:#000;
  .node-label{
    white-space:normal;
    padding:5px;
  }
p{
  padding: 0px;
  margin:0;
  font-weight:normal;
  font-size:12px;
  display:block;
} 
h3{
  padding: 0px;
  margin:0;
  font-size:14px;
  font-weight:bold;
  color:#264260;
  display:block;
}   
  }
  .node.argument{
    rect{
      fill: cornflowerblue;  
      stroke: black;
      stroke-width: 2px;
    }
    text{
      fill: black;
    }
  }
  .node.statement{
    rect{
      fill: white;  
      stroke: cornflowerblue;
      stroke-width: 3px;
    }
    text{
      fill: black;
    }
  }  
  .node-label{
    text-align:center;
    width: 150px;
    
    h3{
        font-weight:bold;
    }
  }
  .node.statement.tag7 rect{
    stroke:#666666;
  }
  .node.argument.tag7 rect{
    fill:#666666;
  }
  .node.statement.tag6 rect{
    stroke:#a6761d;
  }
  .node.argument.tag6 rect{
    fill:#a6761d;
  }
  .node.statement.tag5 rect{
    stroke:#e6ab02;
  }
  .node.argument.tag5 rect{
    fill:#e6ab02;
  }
  .node.statement.tag4 rect{
    stroke:#66a61e;
  }
  .node.argument.tag4 rect{
    fill:#66a61e;
  }
  .node.statement.tag3 rect{
    stroke:#e7298a;
  }
  .node.argument.tag3 rect{
    fill:#e7298a;
  }
  .node.statement.tag2 rect{
    stroke:#7570b3;
  }
  .node.argument.tag2 rect{
    fill:#7570b3;
  }
  .node.statement.tag1 rect{
    stroke:#d95f02;
  }
  .node.argument.tag1 rect{
    fill:#d95f02;
  }
  .node.statement.tag0 rect{
    stroke:#1b9e77;
  }
  .node.argument.tag0 rect{
    fill:#1b9e77;
  }
}

</style>
