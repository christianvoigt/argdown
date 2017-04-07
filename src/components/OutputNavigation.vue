<template>
  <nav class="output-navigation">
    <ul class="nav-list">
      <li><router-link to="/html">Html</router-link></li>
      <li><router-link to="/map">Map</router-link></li>
      <li><router-link to="/debug">Debug</router-link></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'output-navigation',
  data () {
    return {
      title: 'Argdown Test Environment'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
nav{
  font-size:1.5em;
  a{
    display:block;
    padding:0.5em 0.75em;
    text-decoration:none;
    &:hover{
      text-decoration:underline;
    }
  }
}
</style>
