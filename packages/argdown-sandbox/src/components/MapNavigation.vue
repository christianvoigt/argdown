<template>
  <nav class="sub-nav">
    <ul class="nav-list">
      <li>
        <router-link to="/map/" exact>Viz Js Map</router-link>
      </li>
      <li>
        <router-link to="/map/dagre-d3">Dagre D3 Map</router-link>
      </li>
      <li>
        <router-link to="/map/dot">Dot Source</router-link>
      </li>
      <li>
        <router-link to="/map/graphml">GraphML Source</router-link>
      </li>
      <!-- <li><router-link to="/map/graphml">GraphML Source</router-link></li> -->
      <li class="save-map" v-if="$route.name == 'map-viz-js' ||$route.name == 'map-dagre-d3'">
        save map as
        <a class="save-as-svg" v-on:click.stop.prevent="saveAsSvg" href>svg</a>
        <a
          class="save as png"
          v-on:click.stop.prevent="$store.commit('openSaveAsPngDialog')"
          href
        >png</a>
      </li>
    </ul>
    <div class="save-as-png-dialog" v-if="$store.state.showSaveAsPngDialog">
      <h3>PNG Export</h3>
      <label for="save-as-png-scale">Scale</label>
      <input v-model="$store.state.pngScale" type="number" min="0" max="100" id="save-as-png-scale">
      <div class="submit-cancel">
        <button type="button" v-on:click.prevent.stop="saveAsPng">Create PNG</button>
        <button type="button" v-on:click.prevent.stop="$store.commit('closeSaveAsPngDialog')">Cancel</button>
      </div>
    </div>
  </nav>
</template>
<style lang="scss" scoped>
.save-map {
  border-left: 1px solid #eee;
  color: #999;
  padding-left: 1em;
  display: flex;
  align-items: center;
}
.save-as-png-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  width: 300px;
  background-color: #fff;
  border: 2px solid #264260;
  border-radius: 5px;
  padding: 0.5em 2em 0.5em 2em;
  font-size: 1.2em;
  h3 {
    padding-bottom: 1.5em;
  }
  label {
    margin-right: 0 1em;
  }
  input {
    margin: 0 1em;
    font-size: 1em;
    padding: 0.25em;
  }
  .submit-cancel {
    display: flex;
    justify-content: space-between;
  }
  button {
    font-size: 1em;
    margin-top: 1em;
    padding: 0.5em 1em;
  }
}
</style>

<script>
import { EventBus } from "../event-bus.js";

export default {
  methods: {
    saveAsSvg: function() {
      EventBus.$emit("save-map-as-svg");
    },
    saveAsPng: function() {
      EventBus.$emit("save-map-as-png");
      this.$store.commit("closeSaveAsPngDialog");
    }
  }
};
</script>
