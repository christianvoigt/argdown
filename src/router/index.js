import Vue from 'vue'
import Router from 'vue-router'
import HtmlOutput from '@/components/HtmlOutput'
import ArgMLOutput from '@/components/ArgMLOutput'
import DotOutput from '@/components/DotOutput'
import DebugLexerParserOutput from '@/components/DebugLexerParserOutput'
import DebugPreprocessorOutput from '@/components/DebugPreprocessorOutput'
import DebugNavigation from '@/components/DebugNavigation'
import MapNavigation from '@/components/MapNavigation'
import MapSettings from '@/components/MapSettings'

const MapOutput = resolve => {
  // require.ensure is Webpack's special syntax for a code-split point.
  require.ensure(['@/components/MapOutput'], () => {
    resolve(require('@/components/MapOutput'))
  })
}

Vue.use(Router)

export default new Router({
  mode: 'history',
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
      path: '/debug/preprocessor',
      name: 'debug-preprocessor',
      components: {
        default: DebugPreprocessorOutput,
        'output-header': DebugNavigation
      }
    },
    {
      path: '/map',
      name: 'map',
      components: {
        default: MapOutput,
        'output-header': MapNavigation,
        'output-footer': MapSettings
      }
    },
    {
      path: '/map/dot',
      name: 'map-dot',
      components: {
        default: DotOutput,
        'output-header': MapNavigation,
        'output-footer': MapSettings
      }
    },
    {
      path: '/map/graphml',
      name: 'map-graphml',
      components: {
        default: ArgMLOutput,
        'output-header': MapNavigation,
        'output-footer': MapSettings
      }
    },
    {
      path: '/html',
      name: 'html',
      component: HtmlOutput
    },
    {path: '/', redirect: { name: 'html' }},
    {
      path: '/html/source',
      name: 'html-source',
      component: HtmlOutput,
      props: {
        source: true
      }
    }
  ]
})
