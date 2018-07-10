<template>
    <nav class="sub-nav">
    <ul class="nav-list">
    <li>
    <div class="dropdown"><a href="#" class="dropdown-button">Examples</a>
    <ul class="dropdown-content">
        <li v-for="example in $store.getters.examples" :key="example.id"><a href="#" v-on:click.prevent="loadExample(example.id)">{{example.title}}</a></li>
    </ul>
    </div>
    </li>
    </ul>
    </nav>
</template>
<script>
export default {
  name: "input-navigation",
  methods: {
    loadExample: function(example) {
      this.$store.dispatch("loadExample", { id: example }).then(() => {
        // do stuff
      });
    }
  }
};
</script>
