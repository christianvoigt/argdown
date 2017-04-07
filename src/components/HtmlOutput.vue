<template>
  <div class="output html-output">
  <nav class="sub-nav">
    <ul class="nav-list">
      <li><router-link to="/html" exact>Rendered</router-link></li>
      <li><router-link to="/html/source" exact>Source</router-link></li>
    </ul>
  </nav>
  <div class="content">
    <div v-if="source" class="source"><pre>{{html}}</pre></div>
    <div v-else class="rendered" v-html="html"></div>
  </div>
</div>
</template>

<script>

export default {
  name: 'html-output',
  props: ['source'],
  computed: {
    html: function () {
      return this.$store.getters.html
    }
  }
}
</script>

<style scoped>
</style>
