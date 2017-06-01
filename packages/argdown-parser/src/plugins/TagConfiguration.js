import * as _ from 'lodash';

class TagConfiguration{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        //default colorScheme taken from ColorBrewer: https://bl.ocks.org/mbostock/5577023
        colorScheme: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]
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
    let previousConfig = data.config.tags != null;
    data.config.tags = data.config.tags ||[];
    if(data.config && data.config.tagColorScheme){
      this.config = {colorScheme: data.config.tagColorScheme};      
    }
    let index = 0;
    let tagList = data.tags;
    if(previousConfig){
      tagList = [];
      for(let tagData of data.config.tags){
        tagList.push(tagData.tag);
      }
    }
    for(let tag of tagList){
      let tagData = _.find(data.config.tags,{tag:tag});
      if(!tagData){
        tagData = {tag:tag};
        data.config.tags.push(tagData);
      }
      if(!tagData.color && index < this.settings.colorScheme.length){
        tagData.color = this.settings.colorScheme[index];
      }
      index++;
    }
  }
}
module.exports = {
  TagConfiguration: TagConfiguration
}
