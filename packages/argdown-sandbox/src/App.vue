<template>
  <div id="app" v-bind:class="viewStateClass">
    <div id="top-slot" v-if="$store.state.viewState != 'input-maximized' && $store.state.viewState != 'output-maximized' ">
      <app-header></app-header>
      <app-navigation></app-navigation>
    </div>
    <div class="main-window">
      <div id="left-slot" v-if="$store.state.viewState != 'output-maximized'">
        <div class="input-header">
          <InputNavigation/>
          <button v-if="$store.state.viewState != 'input-maximized'" class="button" v-on:click="$store.commit('setViewState','input-maximized')">
            <img class="expand icon" src="./assets/expand.svg" alt="Expand">
          </button>
          <button v-if="$store.state.viewState == 'input-maximized'" class="button" v-on:click="$store.commit('setViewState','default')">
            <img class="expand icon" src="./assets/compress.svg" alt="Compress">
          </button>
        </div>
        <argdown-input v-bind:value="$store.state.argdownInput" v-on:change="value => { $store.commit('setArgdownInput',value)}"></argdown-input>
      </div>
      <div id="right-slot" v-if="$store.state.viewState != 'input-maximized'">
        <div class="output-header">
          <div class="output-sub-menu"><router-view name="output-header"></router-view></div>
          <div class="output-view-state-buttons">
            <button v-if="$store.state.viewState != 'output-maximized'" class="button" v-on:click="$store.commit('setViewState','output-maximized')">
              <img class="expand icon" src="./assets/expand.svg" alt="Expand">
            </button>
            <button v-if="$store.state.viewState == 'output-maximized'" class="button" v-on:click="$store.commit('setViewState','default')">
              <img class="expand icon" src="./assets/compress.svg" alt="Compress">
            </button>
            <button class="button" v-on:click="$store.commit('toggleSettings')">
              <img class="toggle-settings icon" src="./assets/cog.svg" alt="Settings">
            </button>
          </div>
        </div>
        <router-view></router-view>
        <router-view name="output-footer"></router-view>
      </div>
      <settings v-if="$store.state.showSettings"></settings>
      </div>
    </div>
</template>

<script>
import AppHeader from "@/components/AppHeader";
import ArgdownInput from "@/components/ArgdownInput";
import AppNavigation from "@/components/AppNavigation";
import Settings from "@/components/Settings";
import InputNavigation from "@/components/InputNavigation";

import "../node_modules/@argdown/core/dist/src/plugins/argdown.css";

export default {
  name: "app",
  data: function() {
    return {
      argdownInput: ""
    };
  },
  computed: {
    viewStateClass: function() {
      return {
        [this.$store.state.viewState]: true,
        "show-settings": this.$store.state.showSettings
      };
    }
  },
  components: {
    AppHeader,
    ArgdownInput,
    AppNavigation,
    InputNavigation,
    Settings
  },
  created() {
    this.$store.commit("setArgdownInput", this.$store.state.argdownInput); // ensure that the initial input is parsed
  }
};
</script>

<style lang="scss">
$border-color: #eee;
$accent-color: #3e8eaf;
* {
  box-sizing: border-box;
}
html,
body {
  display: flex;
  height: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans,
    Helvetica Neue, sans-serif;
  -moz-osx-font-smoothing: grayscale;
}
h1,
h2,
h3,
h4 {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans,
    Helvetica Neue, sans-serif;
  font-weight: 500;
}
#app {
  display: flex;
  flex-direction: column;
  width: 100%;

  #top-slot {
    height: 3.5em;
    background-color: #fff;
    color: $accent-color;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    padding: 0.7rem 1.5rem;
    border-bottom: 1px solid $border-color;

    ul.nav-list li {
      a {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.9rem;
        display: inline-block;
        padding: 0.1rem 0.5rem;
        height: 1.8rem;
        text-decoration: none;
        &.router-link-active,
        &:hover {
          text-decoration: none;
          background-color: #fff;
          border-bottom: 3px solid $accent-color;
          margin-bottom: -3px;
        }
      }
    }
  }
  .main-window {
    transition: all 0.1s ease-in-out;
    transform: translateX(0px);
  }
}
ul.nav-list {
  list-style-type: none;
  padding: 0.25em 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  height: 100%;
  li {
    display: flex;
    margin: 0;
    a {
      display: flex;
      align-items: center;
      padding: 0.1em 0.75em;
      margin: 0 0.15em;
      color: #2c3e50;
      font-weight: 500;
    }
  }
}
.sub-nav {
  font-size: 0.9em;
  height: 100%;
  padding: 0;
  .nav-list {
    padding: 0;
    font-weight: 500;
    a {
      border-radius: 0.2em;
      text-decoration: none;
      &.router-link-active,
      &:hover {
        background-color: $accent-color;
        color: #fff;
      }
    }
  }
}
a.router-link-active {
  font-weight: 500;
  background-color: $accent-color;
  color: #fff;
}
button .icon {
  width: 1.5em;
  height: auto;
}
.input-header {
  color: #999;
}
.input-maximized {
  .main-window {
    #left-slot {
      align-items: center;
      width: 100%;
    }
    .input-header {
      max-width: 60em;
      width: 100%;
      margin: 0 auto;
      border-right: 0;
    }
  }
}
.output-maximized {
  .main-window {
    #right-slot {
      width: 100%;
    }
  }
}
#app.show-settings {
  .main-window {
    transform: translateX(-400px);
    .settings {
      width: 400px;
    }
  }
}
.main-window {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
  min-height: 0;
  .input-header,
  .output-header {
    height: 2em;
    padding: 0.25em 0.5em;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    h3 {
      margin: 0;
      padding: 0;
      font-size: 1em;
      display: flex;
      align-items: center;
    }
  }
  .input-header {
    border-right: 1px solid $border-color;
  }
  #left-slot {
    width: 50%;
    display: flex;
    padding: 0;
    flex-direction: column;
  }
  #right-slot {
    width: 50%;
    display: flex;
    flex-direction: column;
    .output {
      border-top: 1px solid $border-color;
      flex: 1;
      display: flex;
      flex-direction: column;
      /* Firefox bug fix styles */
      min-width: 0;
      min-height: 0;
      /* End of Firefox bug fix styles */
      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        /* Firefox bug fix styles */
        min-width: 0;
        min-height: 0;
        overflow: auto;
      }
    }
  }

  pre {
    background-color: #eee;
    padding: 1em 2em;
    overflow: auto;
  }
}
.dropdown {
  position: relative;
  .dropdown-button {
    cursor: pointer;
    color: #000;
  }
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 250px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    padding: 12px 16px;
    z-index: 1000;
  }
  &:hover {
    .dropdown-content {
      display: block;
    }
  }
}
</style>
