import Vue from "vue";
import Router from "vue-router";
import HtmlOutput from "@/components/HtmlOutput";
import HtmlNavigation from "@/components/HtmlNavigation";
import JSONOutput from "@/components/JSONOutput";
// import ArgMLOutput from '@/components/ArgMLOutput'
import DotOutput from "@/components/DotOutput";
import GraphMLOutput from "@/components/GraphMLOutput";
import DebugLexerParserOutput from "@/components/DebugLexerParserOutput";
import DebugModelOutput from "@/components/DebugModelOutput";
import DebugNavigation from "@/components/DebugNavigation";
import MapNavigation from "@/components/MapNavigation";

const VizJsOutput = () => import("@/components/VizJsOutput.vue");

const DagreD3Output = () => import("@/components/DagreD3Output.vue");

Vue.use(Router);

export default new Router({
  mode: "history",
  base: "/sandbox/",
  scrollBehavior(to) {
    if (to.hash) {
      return {
        selector: to.hash
      };
    }
  },
  routes: [
    {
      path: "/debug/lexer-parser",
      name: "debug-lexer-parser",
      components: {
        default: DebugLexerParserOutput,
        "output-header": DebugNavigation
      }
    },
    { path: "/debug", redirect: { name: "debug-lexer-parser" } },
    {
      path: "/debug/model",
      name: "debug-model",
      components: {
        default: DebugModelOutput,
        "output-header": DebugNavigation
      }
    },
    {
      path: "/map",
      name: "map-viz-js",
      components: {
        default: VizJsOutput,
        "output-header": MapNavigation
      }
    },
    {
      path: "/map/dagre-d3",
      name: "map-dagre-d3",
      components: {
        default: DagreD3Output,
        "output-header": MapNavigation
      }
    },
    {
      path: "/map/dot",
      name: "map-dot",
      components: {
        default: DotOutput,
        "output-header": MapNavigation
      }
    },
    {
      path: "/map/graphml",
      name: "map-graphml",
      components: {
        default: GraphMLOutput,
        "output-header": MapNavigation
      }
    },
    {
      path: "/html",
      name: "html",
      components: {
        default: HtmlOutput,
        "output-header": HtmlNavigation
      }
    },
    {
      path: "/json",
      name: "json",
      component: JSONOutput
    },
    { path: "/", redirect: { name: "html" } },
    {
      path: "/html/source",
      name: "html-source",
      components: {
        default: HtmlOutput,
        "output-header": HtmlNavigation
      },
      props: {
        default: { source: true }
      }
    }
  ]
});
