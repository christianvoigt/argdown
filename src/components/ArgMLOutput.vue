<template>
  <div class="dot-output output">
    <div class="content">
      <pre>{{$store.getters.argml}}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'argml-output'
}
</script>

<style scoped>
</style>
