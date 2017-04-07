<template>
<div class="map-settings" v-bind:class="{ active: isActive }">
<div class="header" v-on:click="isActive = !isActive"><h3>Settings</h3></div>
<div class="content">
  <fieldset>
  <input type="checkbox" id="excludeDisconnected" v-model="$store.state.excludeDisconnected">
  <label for="excludeDisconnected">exclude disconnected</label>  
</fieldset>
<fieldset>
  <label for="statementSelectionMode">Statement selection: </label>  
  <select id="statementSelectionMode" v-model="$store.state.statementSelectionMode">
    <option disabled value="">Please select one</option>
    <option value='all'>all</option>
    <option value='titled'>titled</option>
    <option value='roots'>roots</option>
    <option value='statement-trees'>statement-trees</option>
    <option value='with-relations'>with-relations</option>
  </select>
</fieldset>
</div>
</div>
</template>

<script>
export default {
  name: 'map-settings',
  data: function () {
    return {
      isActive: false
    }
  }
}
</script>

<style scoped lang="scss">
.map-settings{
  position:fixed;
  bottom:0px;
  right:0px;
  height:80px;
  transform:translateY(100%);
  transition: all 0.1s ease-in-out;
  background-color:powderblue;
  margin-right: 50px;
  width: 500px;
  border-radius: 1em 0 0 0;
  padding:1em 2em;
  
  &.active{
    transform:translateY(0%);
  }
  .content{
    font-size:0.9em;
    display:flex;
    flex-direction:row;
    fieldset{
      width:50%;
      border:0;
    }
  }
  .header{
    cursor: pointer;
    background-color:powderblue;
    border-radius:1em;
    position:absolute;
    top:-2em;
    right:0px;
    height:3em;
    padding: 0.4em 1em 1em 1em;
    font-size:0.9em;
    h3{
      font-size:1em;
      padding:0;
      margin:0;
    }
  }
}
</style>
