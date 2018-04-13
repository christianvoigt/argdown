<template>
<div class="settings">
<div class="header"><h3>Settings</h3></div>
<div class="content">
  <h4>General Settings</h4>
  <fieldset>
    <input type="checkbox" id="removeTagsFromText" v-model="$store.state.config.model.removeTagsFromText">
    <label for="removeTagsFromText">Remove tags from text</label>  
  </fieldset>
  <h4>Map Settings</h4>
  <fieldset>
  <input type="checkbox" id="excludeDisconnected" v-model="$store.state.config.map.excludeDisconnected">
  <label for="excludeDisconnected">exclude disconnected</label>  
</fieldset>
<fieldset>
  <label for="statementSelectionMode">Statement selection: </label>
  <select id="statementSelectionMode" v-model="$store.state.config.map.statementSelectionMode">
    <option disabled value="">Please select one</option>
    <option value='all'>all</option>
    <option value='titled'>titled</option>
    <option value='roots'>roots</option>
    <option value='statement-trees'>statement-trees</option>
    <option value='with-relations'>with-relations</option>
  </select>
</fieldset>
<fieldset>
  <label for="argumentLabelMode">Argument label mode: </label>  
  <select id="argumentLabelMode" v-model="$store.state.config.map.argumentLabelMode">
    <option disabled value="">Please select one</option>
    <option value='hide-untitled'>hide-untitled</option>
    <option value='title'>title</option>
    <option value='description'>description</option>
  </select>
</fieldset>
<fieldset>
  <label for="statementLabelMode">Statement label mode: </label>  
  <select id="statementLabelMode" v-model="$store.state.config.map.statementLabelMode">
    <option disabled value="">Please select one</option>
    <option value='hide-untitled'>hide-untitled</option>
    <option value='title'>title</option>
    <option value='text'>text</option>
  </select>
</fieldset>
<fieldset>
  <label for="groupDepth">Group depth: </label>
  <input id="groupDepth" type="number" v-model="$store.state.config.map.groupDepth">
</fieldset>
<h4>Dagre Settings</h4>
<fieldset>
  <label for="dagreRankDir">Rank direction: </label>
  <select id="dagreRankDir" v-model="$store.state.config.dagre.rankDir">
    <option disabled value="">Please select one</option>
    <option value='BT'>BT</option>
    <option value='TB'>TB</option>
    <option value='LR'>LR</option>
    <option value='RL'>LR</option>
  </select>
</fieldset>
<fieldset>
  <label for="dagreRankSep">Rank separation: </label>
  <input id="dagreRankSep" type="number" v-model="$store.state.config.dagre.rankSep">
</fieldset>
<fieldset>
  <label for="dagreNodeSep">Node separation: </label>
  <input id="dagreNodeSep" type="number" v-model="$store.state.config.dagre.nodeSep">
</fieldset>
<h4>Graphviz Settings</h4>
<fieldset>
  <label for="graphVizRankDir">Rank direction: </label>
  <select id="graphVizRankDir" v-model="$store.state.config.dot.graphVizSettings.rankdir">
    <option disabled value="">Please select one</option>
    <option value='BT'>BT</option>
    <option value='TB'>TB</option>
    <option value='LR'>LR</option>
    <option value='RL'>LR</option>
  </select>
</fieldset>
<fieldset>
  <label for="graphVizConcentrate">Concentrate: </label>
  <input type="checkbox" id="graphVizConcentrate" v-model="$store.state.config.dot.graphVizSettings.concentrate">
</fieldset>
<fieldset>
  <label for="graphVizRatio">Ratio: </label>
  <input id="graphVizRatio" type="text" v-model="$store.state.config.dot.graphVizSettings.ratio">
</fieldset>
<fieldset>
  <label for="graphVizSize">Size: </label>
  <input id="graphVizSize" type="text" v-model="$store.state.config.dot.graphVizSettings.size">
</fieldset>
</div>
</div>
</template>

<script>
export default {
  name: "settings"
};
</script>

<style scoped lang="scss">
.settings {
  position: fixed;
  top: 0px;
  left: 100%;
  bottom: 0px;
  background-color: #a0dde5;
  padding: 1em;
  overflow: auto;
  height: 100%;
  .header {
    padding-bottom: 1em;
    h3 {
      padding: 0;
      margin: 0;
    }
  }
  .content {
    font-size: 0.9em;
    display: flex;
    flex-direction: column;
    fieldset {
      border: 0;
    }
  }
}
</style>
