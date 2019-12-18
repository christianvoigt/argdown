<template>
  <nav class="sub-nav">
    <ul class="nav-list">
      <li>
        <div class="dropdown">
          <button class="text-button dropdown-button">Examples</button>
          <ul class="dropdown-content">
            <li v-for="example in $store.getters.examples" :key="example.id">
              <a href="#" v-on:click.prevent="loadExample(example.id)">{{example.title}}</a>
            </li>
          </ul>
        </div>
      </li>
      <li>
        <div class="input-container argvu-font">
          <input v-model="useArgVu" v-bind:value="useArgVu" type="checkbox" id="use-argvu" />
          <label for="use-argvu">Use ArgVu font</label>
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
  },
  computed: {
    useArgVu: {
      set(value) {
        this.$store.commit("setUseArgVu", value);
      },
      get() {
        return this.$store.state.useArgVu;
      }
    }
  }
};
</script>
