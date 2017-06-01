<template>
  <div class="argdown-input">
    <codemirror ref="codemirror"
                :options="editorOption"
                :code="value"
                @change="updateValue">
    </codemirror>
  </div>
</template>

<script>
import * as _ from 'lodash'
import { codemirror, CodeMirror } from 'vue-codemirror'
import * as argdownMode from 'argdown-codemirror-mode'

require('codemirror/addon/mode/simple.js')
require('../../node_modules/argdown-codemirror-mode/codemirror-argdown.css')

CodeMirror.defineSimpleMode('argdown', argdownMode)

export default {
  name: 'argdown-input',
  data () {
    return {
      editorOption: {
        tabSize: 4,
        mode: 'argdown',
        foldGutter: true,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        extraKeys: {
          Tab: function (cm) {
            let spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
            cm.replaceSelection(spaces)
          }
        }
      }
    }
  },
  props: ['value'],
  methods: {
    updateValue: function (value) {
      this.debouncedChangeEmission(value, this)
    },
    debouncedChangeEmission: _.debounce(function (value, component) {
      component.$emit('change', value)
    }, 100)
  },
  components: {
    codemirror
  }
}
</script>

<style lang="scss">
.argdown-input{
  flex:1;
  overflow:hidden;
  textarea{
    flex:1;
    padding:1em;
    width:100%;
    height:100%;
    font-size:1.25em;
  }
  .CodeMirror{
    border:1px solid #ccc;
    height: 100%;
    width:100%;
    font-size:1.25em;
  }
}
</style>
