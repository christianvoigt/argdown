<template>
  <div class="json-output output">
    <div class="content">
      <div class="json-source"><pre>{{$store.getters.json}}</pre></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'json-output'
}
</script>

<style scoped>
</style>
