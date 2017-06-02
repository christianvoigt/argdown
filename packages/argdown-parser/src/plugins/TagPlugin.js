import * as _ from 'lodash';
import util from './util.js';

class TagPlugin{
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
    this.name = "TagPlugin";
    this.config = config;
  }
  run(data){
    if(!data.tags){
      return;
    }
    data.config = data.config ||{};
    data.tagsDictionary = {};
    
    let tagConfigExists = data.config.tags != null;
    if(data.config && data.config.tagColorScheme){
      this.config = {colorScheme: data.config.tagColorScheme};      
    }
    let selectedTags = data.tags;
    if(tagConfigExists){
      selectedTags = [];
      for(let tagData of data.config.tags){
        selectedTags.push(tagData.tag);
      }
    }
    for(let tag of data.tags){
      let tagData = null;
      if(tagConfigExists){
        let tagConfig = _.find(data.config.tags,{tag:tag});
        tagData = _.clone(tagConfig);        
      }
      if(!tagData){
        tagData = {tag:tag};
      }
      data.tagsDictionary[tag] = tagData;
      let index = selectedTags.indexOf(tag);
      tagData.cssClass = util.getHtmlId('tag-'+tag);
      if(index > -1){
        if(!tagData.color && index < this.settings.colorScheme.length){
          tagData.color = this.settings.colorScheme[index];
        }
        tagData.cssClass += ' tag'+index;
        tagData.index = index;
      }
    }
    for(let title of Object.keys(data.statements)){
      let equivalenceClass = data.statements[title];
      if(equivalenceClass.tags){
        equivalenceClass.sortedTags = this.sortTags(equivalenceClass.tags, data);
      }
    }
    for(let title of Object.keys(data.arguments)){
      let argument = data.arguments[title];
      if(argument.tags){
        argument.sortedTags = this.sortTags(argument.tags, data);
      }
    }
  }
  sortTags(tags, data){
    const filtered = _.filter(tags, function(tag){
      return data.tagsDictionary[tag].index != null;
    });
    const sorted = _.sortBy(filtered, function(tag){
      return data.tagsDictionary[tag].index;
    });
    return sorted;
  }
}
module.exports = {
  TagPlugin: TagPlugin
}
