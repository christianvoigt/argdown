<template>
  <div class="map-output output">
    <div class="content">
      <div class="rendered" v-html="svg"></div>
    </div>
  </div>
</template>

<script>
import * as Viz from 'viz.js'

export default {
  name: 'map-output',
  computed: {
    svg: function () {
      return Viz(this.$store.getters.dot)
    }
  }
}
</script>

<style scoped>
</style>
