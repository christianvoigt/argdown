<template>
  <div class="output debug-model-output">
    <div class="content">
  <h3>Statements</h3>
  <table v-if="$store.getters.statements">
  <tr class="statement" v-for="(key,index) in Object.keys($store.getters.statements)" :key="index">
    <td class="title"><b>title: </b> "{{$store.getters.statements[key].title}}": </td><td class="relations"><b>relations: </b> {{($store.getters.statements[key].relations)? $store.getters.statements[key].relations.length : 0}}</td>
  </tr>
  </table>
  <h3>Arguments</h3>
  <table v-if="$store.getters.arguments">
  <tr class="argument" v-for="(key,index) in Object.keys($store.getters.arguments)" :key="index">
    <td class="title"><b>title: </b>"{{$store.getters.arguments[key].title}}"</td><td class="relations"><b>relations:</b> {{($store.getters.arguments[key].relations)? $store.getters.arguments[key].relations.length : 0}}</td>
  </tr>
  </table>
  <h3>Relations</h3>
  <table v-if="$store.getters.relations">
  <tr class="relation" v-for="(relation,index) in $store.getters.relations" :key="index">
    <td class="from"><b>from:</b> "{{relation.from.title}}"</td><td class="to"> <b>to:</b> "{{relation.to.title}}", </td><td class="type"> <b>type:</b> "{{relation.type}}"</td><td class="status"> <b>status:</b> "{{relation.status}}"</td>
  </tr>
  </table>
</div>
</div>
</template>

<script>
export default {
  name: "debug-model-output"
};
</script>

<style scoped>
.output .content {
  padding: 1em;
}
</style>
