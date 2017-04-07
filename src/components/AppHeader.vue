<template>
  <header class="app-header">
    <img class="logo" src="../assets/argdown-mark.svg" alt="Argdown - argumentation analysis syntax">
    <h1>{{ title }}</h1>
  </header>
</template>

<script>
export default {
  name: 'app-header',
  data () {
    return {
      title: 'Argdown Editor'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
header{
  display:flex;
  flex-direction: row;
  align-items: center;
  padding-bottom:1.35em;
}
.logo{
  display:block;
  padding-right:1em;
  width:150px;
  height:auto;
}
h1{
  font-size:3em;
  padding:0;
  margin:0;
}
</style>
