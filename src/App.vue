<template>
  <div id="app">
    <div class="main-window">
      <div class="left">
        <app-header></app-header>
        <argdown-input v-bind:value="$store.state.argdownInput" v-on:change="value => { $store.commit('setArgdownInput',value)}"></argdown-input>
      </div>
      <div class="right">
        <output-navigation></output-navigation>
        <router-view name="output-header"></router-view>
        <router-view></router-view>
        <router-view name="output-footer"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader'
import ArgdownInput from '@/components/ArgdownInput'
import OutputNavigation from '@/components/OutputNavigation'

require('../node_modules/argdown-parser/lib/src/plugins/argdown.css')

export default {
  name: 'app',
  data: function () {
    return {
      argdownInput: ''
    }
  },
  components: {
    AppHeader,
    ArgdownInput,
    OutputNavigation
  },
  created () {
    this.$store.commit('setArgdownInput', this.$store.state.argdownInput)// ensure that the initial input is parsed
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Raleway:400');
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700');

* { box-sizing: border-box; }
html,body{
  display:flex;
  height: 100%;
  margin:0;
  padding:0;
  width:100%;
}
#app {
  font-family:'Source Sans Pro', Arial, sans-serif;
  display:flex;
  flex-direction:column;
  width:100%;
  h1,h2,h3,h4{
    font-family: 'Raleway', Arial, sans-serif;
  }
  .argdown{
    h1,h2,h3{
      font-family: 'Raleway', Arial, sans-serif;
    }
  }
}
.main-window{
  display:flex;
  flex-direction:row;
  flex:1;
  min-width: 0;
  min-height: 0;  
  .left{
    width:50%;
    display:flex;
    padding:1em;
    flex-direction:column;
  }
  .right{
    width:50%;
    display:flex;
    padding:1em 1em 0 1em;
    flex-direction:column;
    .output{
      flex:1;
      display:flex;
      flex-direction:column;
      /* Firefox bug fix styles */
      min-width:0;
      min-height:0;
      /* End of Firefox bug fix styles */      
      .content{
        flex:1;
        display:flex;
        flex-direction:column;
        /* Firefox bug fix styles */
        min-width:0;
        min-height:0;
        overflow:auto;
      }
    }
  }
  ul.nav-list {
    list-style-type: none;
    padding: 0;
    margin:0.25em 0;
    li {
      display: inline-block;
      margin: 0;
      a{
        display:block;
        padding:0.2em 0.75em;
        border-radius: 0.4em;
        &:hover{
          background-color:powderblue;
        }
      }
    }
  }
  .sub-nav{
    font-size:0.9em;
    padding-bottom:0.5em;
  }  
  pre{
    background-color:#eee;
    padding:1em 2em;
    overflow:auto;
  }
  .router-link-active{
    font-weight:bold;
    background-color:skyblue;
  }
}
</style>
