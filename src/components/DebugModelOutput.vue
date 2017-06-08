<template>
  <div class="output debug-model-output">
    <div class="content">
  <h3>Statements</h3>
  <table>
  <tr class="statement" v-for="key in Object.keys($store.getters.statements)">
    <td class="title"><b>title: </b> "{{$store.getters.statements[key].title}}": </td><td class="relations"><b>relations: </b> {{($store.getters.statements[key].relations)? $store.getters.statements[key].relations.length : 0}}</td>
  </tr>
  </table>
  <h3>Arguments</h3>
  <table>
  <tr class="argument" v-for="key in Object.keys($store.getters.arguments)">
    <td class="title"><b>title: </b>"{{$store.getters.arguments[key].title}}"</td><td class="relations"><b>relations:</b> {{($store.getters.arguments[key].relations)? $store.getters.arguments[key].relations.length : 0}}</td>
  </td>
  </tr>
  </table>
  <h3>Relations</h3>
  <table>
  <tr class="relation" v-for="relation in $store.getters.relations">
    <td class="from"><b>from:</b> "{{relation.from.title}}"</td><td class="to"> <b>to:</b> "{{relation.to.title}}", </td><td class="type"> <b>type:</b> "{{relation.type}}"</td><td class="status"> <b>status:</b> "{{relation.status}}"</td>
  </tr>
  </table>
</div>
</div>
</template>

<script>
export default {
  name: 'debug-model-output'
}
</script>

<style scoped>
.output .content{
  padding:1em;
}
</style>
