import Vue from "vue";
import Vuex from "vuex";
import _ from "lodash";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  RegroupPlugin,
  ColorPlugin,
  HtmlExportPlugin,
  JSONExportPlugin,
  DataPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  MapPlugin,
  GroupPlugin,
  DotExportPlugin,
  StatementSelectionMode,
  LabelMode,
  tokensToString,
  astToString
} from "@argdown/core";
import axios from "axios";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const dataPlugin = new DataPlugin();
const modelPlugin = new ModelPlugin();
const regroupPlugin = new RegroupPlugin();
const colorPlugin = new ColorPlugin();

const htmlExport = new HtmlExportPlugin({
  headless: true
});
const jsonExport = new JSONExportPlugin({ removeEmbeddedRelations: true });
const preselectionPlugin = new PreselectionPlugin();
const statementSelectionPlugin = new StatementSelectionPlugin();
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
const mapPlugin = new MapPlugin();
const groupPlugin = new GroupPlugin();
const dotExport = new DotExportPlugin();
import primer from "!!raw-loader!../public/examples/argdown-primer.argdown";

app.addPlugin(parserPlugin, "parse-input");
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
app.addPlugin(regroupPlugin, "build-model");
app.addPlugin(colorPlugin, "build-model");
app.addPlugin(preselectionPlugin, "build-map");
app.addPlugin(statementSelectionPlugin, "build-map");
app.addPlugin(argumentSelectionPlugin, "build-map");
app.addPlugin(mapPlugin, "build-map");
app.addPlugin(groupPlugin, "build-map");
app.addPlugin(htmlExport, "export-html");
app.addPlugin(dotExport, "export-dot");
app.addPlugin(jsonExport, "export-json");

Vue.use(Vuex);

var examples = {
  "argdown-primer": {
    id: "argdown-primer",
    title: "Argdown Primer",
    url: "/argdown/sandbox/examples/argdown-primer.argdown",
    cachedContent: primer
  },
  test: {
    id: "test",
    title: "Second example",
    url: "/argdown/sandbox/examples/test.argdown"
  }
};

export default new Vuex.Store({
  state: {
    argdownInput: primer,
    examples: examples,
    config: {
      selection: {
        excludeDisconnected: true,
        statementSelectionMode: StatementSelectionMode.WITH_TITLE
      },
      map: {
        statementLabelMode: LabelMode.HIDE_UNTITLED,
        argumentLabelMode: LabelMode.HIDE_UNTITLED
      },
      group: {
        groupDepth: 2
      },
      dot: {
        graphVizSettings: {
          rankdir: "BT",
          concentrate: "false",
          ratio: "auto",
          size: "10,10"
        }
      },
      dagre: {
        rankDir: "BT",
        rankSep: 50,
        nodeSep: 70
      },
      model: {
        removeTagsFromText: false
      }
    },
    viewState: "default",
    showSettings: false,
    showSaveAsPngDialog: false,
    pngScale: 1
  },
  mutations: {
    setArgdownInput(state, value) {
      state.argdownInput = value;
    },
    setViewState(state, value) {
      state.viewState = value;
    },
    cacheExample(state, { id, content }) {
      var example = state.examples[id];
      if (example) {
        example.cachedContent = content;
      }
    },
    toggleSettings(state) {
      state.showSettings = !state.showSettings;
    },
    openSaveAsPngDialog(state) {
      state.showSaveAsPngDialog = true;
    },
    closeSaveAsPngDialog(state) {
      state.showSaveAsPngDialog = false;
    }
  },
  getters: {
    argdownData: state => {
      const request = _.defaultsDeep(
        { input: state.argdownInput, process: ["parse-input", "build-model"] },
        state.config
      );
      const response = app.run(request);
      return response;
    },
    examples: state => {
      return Object.values(state.examples);
    },
    html: (state, getters) => {
      const data = getters.argdownData;
      if (!data.ast) {
        return null;
      }
      const request = _.defaultsDeep(
        {
          process: ["export-html"]
        },
        data.frontMatter,
        state.config
      );
      const response = app.run(request, data);
      return response.html;
    },
    dot: (state, getters) => {
      const data = getters.argdownData;
      if (!data.ast) {
        return null;
      }
      const request = _.defaultsDeep(
        {
          process: ["build-map", "export-dot"]
        },
        data.frontMatter,
        state.config
      );
      const response = app.run(request, data);
      return response.dot;
    },
    json: (state, getters) => {
      const data = getters.argdownData;
      if (!data.ast) {
        return null;
      }
      const request = _.defaultsDeep(
        {
          process: ["build-map", "export-json"]
        },
        data.frontMatter,
        state.config
      );
      const response = app.run(request, data);
      return response.json;
    },
    parserErrors: (state, getters) => {
      return getters.argdownData.parserErrors;
    },
    lexerErrors: (state, getters) => {
      return getters.argdownData.lexerErrors;
    },
    statements: (state, getters) => {
      return getters.argdownData.statements;
    },
    arguments: (state, getters) => {
      return getters.argdownData.arguments;
    },
    relations: (state, getters) => {
      return getters.argdownData.relations;
    },
    ast: (state, getters) => {
      return astToString(getters.argdownData.ast);
    },
    tokens: (state, getters) => {
      const data = getters.argdownData;
      // eslint-disable-next-line
      return data.tokens ? tokensToString(data.tokens) : null;
    },
    map: (state, getters) => {
      const data = getters.argdownData;
      if (!data.ast) {
        return null;
      }
      const request = _.defaultsDeep(
        {
          process: ["build-map"]
        },
        data.frontMatter,
        state.config
      );
      const response = app.run(request, data);
      return response.map;
    },
    tags: (state, getters) => {
      return getters.argdownData.tags;
    }
  },
  actions: {
    loadExample({ commit, state }, payload) {
      var example = state.examples[payload.id];
      return new Promise((resolve, reject) => {
        if (!example) {
          reject("Could not find example");
        }
        if (example.cachedContent) {
          commit("setArgdownInput", example.cachedContent);
          resolve();
        }
        axios.get(example.url).then(response => {
          commit("cacheExample", { id: example.id, content: response.data });
          commit("setArgdownInput", response.data);
          resolve();
        });
      });
    }
  }
});
