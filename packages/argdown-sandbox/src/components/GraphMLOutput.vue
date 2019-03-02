<template>
  <div class="dot-output output">
    <div class="content">
      <div class="dot-source">
        <pre>{{$store.getters.graphml}}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "graphml-output"
};
</script>

<style scoped>
.output .content {
  padding: 1em;
}
</style>
