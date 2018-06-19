<template>
  <nav class="app-navigation">
    <ul class="nav-list">
      <li><router-link to="/html">HTML</router-link></li>
      <li><router-link to="/map">Map</router-link></li>
      <li><router-link to="/json">JSON</router-link></li>
      <li><router-link to="/debug">Debug</router-link></li>
      <li><a href="https://github.com/christianvoigt/argdown">View on Github</a></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "app-navigation",
  data() {
    return {
      title: "Argdown Test Environment"
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
nav {
  font-size: 1.25em;
  padding: 0.25em 0;
  a {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    padding: 0.2em 0.75em;
    border-radius: 0.4em;
    padding: 0.5em 0.75em;
    text-decoration: none;
    color: #ddd;
    &:hover {
      text-decoration: underline;
      color: #fff;
    }
  }
}
</style>
