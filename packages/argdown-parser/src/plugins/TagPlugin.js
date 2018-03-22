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
  run(request, response){
    if(!response.tags || !response.statements || !response.arguments){
      return;
    }
    response.tagsDictionary = {};
    
    let tagConfigExists = request.tags != null;
    if(request.tagColorScheme){
      this.config = {colorScheme: request.tagColorScheme};      
    }
    let selectedTags = response.tags;
    if(tagConfigExists){
      selectedTags = [];
      for(let tagData of request.tags){
        selectedTags.push(tagData.tag);
      }
    }
    for(let tag of response.tags){
      let tagData = null;
      if(tagConfigExists){
        let tagConfig = _.find(request.tags,{tag:tag});
        tagData = _.clone(tagConfig);        
      }
      if(!tagData){
        tagData = {tag:tag};
      }
      response.tagsDictionary[tag] = tagData;
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
    for(let title of Object.keys(response.statements)){
      let equivalenceClass = response.statements[title];
      if(equivalenceClass.tags){
        equivalenceClass.sortedTags = this.sortTags(equivalenceClass.tags, response);
      }
    }
    for(let title of Object.keys(response.arguments)){
      let argument = response.arguments[title];
      if(argument.tags){
        argument.sortedTags = this.sortTags(argument.tags, response);
      }
    }
  }
  sortTags(tags, response){
    const filtered = _.filter(tags, function(tag){
      return response.tagsDictionary[tag].index != null;
    });
    const sorted = _.sortBy(filtered, function(tag){
      return response.tagsDictionary[tag].index;
    });
    return sorted;
  }
}
module.exports = {
  TagPlugin: TagPlugin
}
