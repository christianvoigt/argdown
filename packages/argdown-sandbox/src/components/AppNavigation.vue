<template>
  <nav class="app-navigation">
    <ul class="nav-list">
      <li><router-link to="/html">HTML</router-link></li>
      <li><router-link to="/map">Map</router-link></li>
      <li><router-link to="/json">JSON</router-link></li>
      <li><a href="/argdown/">Documentation</a></li>
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
