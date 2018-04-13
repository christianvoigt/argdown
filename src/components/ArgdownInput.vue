<template>
  <div class="argdown-input">
    <codemirror ref="codemirror"
                :options="editorOption"
                :value="value"
                @changes="updateValue">
    </codemirror>
  </div>
</template>

<script>
import * as _ from "lodash";
import { CodeMirror, codemirror } from "vue-codemirror";
import * as argdownMode from "argdown-codemirror-mode";

import "codemirror/addon/mode/simple.js";
import "codemirror/addon/lint/lint.js";

CodeMirror.defineSimpleMode("argdown", argdownMode);

export default {
  name: "argdown-input",
  data() {
    return {
      editorOption: {
        tabSize: 4,
        mode: "argdown",
        foldGutter: true,
        styleActiveLine: true,
        lineNumbers: true,
        lint: true,
        gutters: ["CodeMirror-lint-markers"],
        line: true,
        extraKeys: {
          Tab: function(cm) {
            let spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces);
          }
        }
      }
    };
  },
  props: ["value"],
  created: function() {
    const store = this.$store;
    CodeMirror.registerHelper("lint", "argdown", function() {
      const found = [];
      const errors = store.getters.parserErrors;
      if (!errors) {
        return found;
      }
      for (let i = 0; i < errors.length; i++) {
        let error = errors[i];
        let startLine = error.token.startLine - 1;
        let endLine = error.token.endLine - 1;
        let startCol = error.token.startColumn - 1;
        let endCol = error.token.endColumn;
        found.push({
          from: CodeMirror.Pos(startLine, startCol),
          to: CodeMirror.Pos(endLine, endCol),
          message: error.message,
          severity: "error"
        });
      }
      return found;
    });
  },
  methods: {
    updateValue: function(codemirror) {
      this.debouncedChangeEmission(codemirror.doc.getValue(), this);
    },
    debouncedChangeEmission: _.debounce(function(value, component) {
      component.$emit("change", value);
    }, 100)
  },
  components: {
    codemirror
  }
};
</script>

<style lang="scss">
@import "../../node_modules/codemirror/lib/codemirror.css";
@import "../../node_modules/codemirror/theme/monokai.css";
@import "../../node_modules/codemirror/addon/lint/lint.css";
@import "../../node_modules/argdown-codemirror-mode/codemirror-argdown.css";

.input-maximized {
  .argdown-input {
    max-width: 60em;
    width: 100%;
    margin: 0 auto;
  }
}
.argdown-input {
  flex: 1;
  overflow: hidden;
  textarea {
    flex: 1;
    padding: 1em;
    width: 100%;
    height: 100%;
    font-size: 1.25em;
  }
  .vue-codemirror {
    height: 100%;
    width: 100%;
  }
  .CodeMirror {
    border: 1px solid #ccc;
    height: 100%;
    width: 100%;
    font-size: 1.25em;
    pre {
      padding: 0.1em 0.5em;
      overflow: visible;
      background-color: transparent;
    }
  }
}
</style>
