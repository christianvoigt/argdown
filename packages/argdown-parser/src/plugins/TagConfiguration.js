import * as _ from 'lodash';

class TagConfiguration{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        //default colorScheme taken from ColorBrewer Paired: https://bl.ocks.org/mbostock/5577023
        colorScheme: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);    
  }
  constructor(config){
    this.name = "TagConfiguration";
    this.config = config;
  }
  run(data){
    if(!data.tags){
      return;
    }
    data.config = data.config ||{};
    data.config.tags = data.config.tags ||{};
    this.config = data.config.tagColor;
    let index = 0;
    for(let tag of data.tags){
      const tagData = data.config.tags[tag]||{};
      data.config.tags[tag] = tagData;
      if(!tagData.color && index < this.settings.colorScheme.length){
        tagData.color = this.settings.colorScheme[index];
      }
      tagData.index = index;
      index++;
    }
  }
}
module.exports = {
  TagConfiguration: TagConfiguration
}
