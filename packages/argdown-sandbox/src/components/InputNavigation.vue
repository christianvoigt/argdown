<template>
  <nav class="sub-nav">
    <ul class="nav-list">
      <li>
        <div class="dropdown">
          <button class="text-button dropdown-button">Examples</button>
          <ul class="dropdown-content">
            <li v-for="example in $store.getters.examples" :key="example.id">
              <a href="#" v-on:click.prevent="loadExample(example.id)">{{
                example.title
              }}</a>
            </li>
          </ul>
        </div>
      </li>
      <li>
        <button class="text-button" v-on:click="copyLink">Copy link</button>
      </li>
      <li>
        <div class="input-container argvu-font">
          <input
            v-model="useArgVu"
            v-bind:value="useArgVu"
            type="checkbox"
            id="use-argvu"
          />
          <label for="use-argvu">Use ArgVu font</label>
        </div>
      </li>
    </ul>
    <modal v-show="isModalVisible" @close="closeModal">
      <div slot="header">Successfully copied shareable link</div>
      <div slot="body">
        <input type="text" v-bind:value="link" style="width: 100%" /><br />
        <p>Show other people your Argdown code directly in the Sandbox!</p>
      </div>
    </modal>
  </nav>
</template>
<script>
import modal from "./modal.vue";
export default {
  name: "input-navigation",
  components: {
    modal: modal,
  },
  methods: {
    loadExample: function (example) {
      this.$store.dispatch("loadExample", { id: example }).then(() => {
        // do stuff
      });
    },
    copyLink: function () {
      const input = encodeURIComponent(this.$store.state.argdownInput);
      const link = `https://argdown.org/sandbox/map/?argdown=${input}`;
      navigator.clipboard.writeText(link);
      this.link = link;
      this.showModal();
    },
    showModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
  },
  data: () => {
    return {
      isModalVisible: false,
      link: "",
    };
  },
  computed: {
    useArgVu: {
      set(value) {
        this.$store.commit("setUseArgVu", value);
      },
      get() {
        return this.$store.state.useArgVu;
      },
    },
  },
};
</script>
