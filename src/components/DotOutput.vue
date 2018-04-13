<template>
  <div class="dot-output output">
    <div class="content">
      <div class="dot-source">
        <pre>{{$store.getters.dot}}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "dot-output"
};
</script>

<style scoped>
.output .content {
  padding: 1em;
}
</style>
