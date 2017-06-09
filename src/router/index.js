import Vue from 'vue'
import Router from 'vue-router'
import HtmlOutput from '@/components/HtmlOutput'
import HtmlNavigation from '@/components/HtmlNavigation'
import JSONOutput from '@/components/JSONOutput'
// import ArgMLOutput from '@/components/ArgMLOutput'
import DotOutput from '@/components/DotOutput'
import DebugLexerParserOutput from '@/components/DebugLexerParserOutput'
import DebugModelOutput from '@/components/DebugModelOutput'
import DebugNavigation from '@/components/DebugNavigation'
import MapNavigation from '@/components/MapNavigation'

const VizJsOutput = resolve => {
  // require.ensure is Webpack's special syntax for a code-split point.
  require.ensure(['@/components/VizJsOutput'], () => {
    resolve(require('@/components/VizJsOutput'))
  })
}

const DagreD3Output = resolve => {
  // require.ensure is Webpack's special syntax for a code-split point.
  require.ensure(['@/components/DagreD3Output'], () => {
    resolve(require('@/components/DagreD3Output'))
  })
}

Vue.use(Router)

export default new Router({
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      }
    }
  },
  routes: [
    {
      path: '/debug/lexer-parser',
      name: 'debug-lexer-parser',
      components: {
        default: DebugLexerParserOutput,
        'output-header': DebugNavigation
      }
    },
    {path: '/debug', redirect: { name: 'debug-lexer-parser' }},
    {
      path: '/debug/model',
      name: 'debug-model',
      components: {
        default: DebugModelOutput,
        'output-header': DebugNavigation
      }
    },
    {
      path: '/map/viz-js',
      name: 'map-viz-js',
      components: {
        default: VizJsOutput,
        'output-header': MapNavigation
      }
    },
    {
      path: '/map',
      name: 'map-dagre-d3',
      components: {
        default: DagreD3Output,
        'output-header': MapNavigation
      }
    },
    {
      path: '/map/dot',
      name: 'map-dot',
      components: {
        default: DotOutput,
        'output-header': MapNavigation
      }
    },
    // {
    //   path: '/map/graphml',
    //   name: 'map-graphml',
    //   components: {
    //     default: ArgMLOutput,
    //     'output-header': MapNavigation
    //   }
    // },
    {
      path: '/html',
      name: 'html',
      components: {
        default: HtmlOutput,
        'output-header': HtmlNavigation
      }
    },
    {
      path: '/json',
      name: 'json',
      component: JSONOutput
    },
    {path: '/', redirect: { name: 'html' }},
    {
      path: '/html/source',
      name: 'html-source',
      components: {
        default: HtmlOutput,
        'output-header': HtmlNavigation
      },
      props: {
        default: { source: true }
      }
    }
  ]
})
