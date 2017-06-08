<template>
<div class="output html-output">
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
.output .content{
  padding:1em;
}
</style>
