<template>
  <div class="dot-output output">
    <div class="content">
      <pre>{{$store.getters.dot}}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dot-output'
}
</script>

<style scoped>
</style>
