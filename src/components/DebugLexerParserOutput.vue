<template>
  <div class="debug-lexer-parser-output output">
    <div class="content">
    <div v-if="$store.getters.lexerErrors && $store.getters.lexerErrors.length > 0" class="lexer-errors">
      <h2>Parser Errors ({{$store.getters.lexerErrors.length}})</h2>
          <table class='lexer-error error' v-for="(error, index) in $store.getters.lexerErrors" :key="index">
          <tr class="error-property" v-for="(key,index) in Object.keys(error)" :key="index">
            <td class="property-name">{{key}}:</td>
            <td class="property-value">{{error[key]}}</td>
          </tr>
        </table>
    </div>
    <div v-if="$store.getters.parserErrors && $store.getters.parserErrors.length > 0" class="parser-errors">
      <h2>Parser Errors ({{$store.getters.parserErrors.length}})</h2>
          <table class='parser-error error' v-for="(error,index) in $store.getters.parserErrors" :key="index">
          <tr class="error-property" v-for="(key,index) in Object.keys(error)" :key="index">
            <td class="property-name">{{key}}:</td>
            <td v-if="key == 'resyncedTokens' || key == 'context'" class="property-value">{{JSON.stringify(error[key])}}</td>
            <td v-else-if="key == 'token'" class="property-value">{{error[key] |tokenName}}</td>
            <td v-else class="property-value">{{JSON.stringify(error[key])}}</td>
          </tr>
        </table>
    </div>
    <div class="ast">
    <h2>AST</h2>
    <pre v-html="$store.getters.ast"></pre>
    </div>
    <div class="tokens">
    <h2>Tokens</h2>
    <pre v-html="$store.getters.tokens"></pre>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "debug-lexer-parser-output"
};
</script>

<style scoped>
.output .content {
  padding: 1em;
}
table.error {
  border: 1px solid red;
  padding: 1em;
  margin-bottom: 2em;
}
td {
  padding: 0.5em 1em;
  vertical-align: top;
}
.property-name {
  font-weight: bold;
}
</style>
