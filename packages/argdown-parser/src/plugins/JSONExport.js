import * as _ from 'lodash';
import {Argument} from '../model/Argument.js';
import {EquivalenceClass} from '../model/EquivalenceClass.js';

class JSONExport{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        spaces : 2,
        removeEmbeddedRelations: false,
        exportMap : true,
        exportSections : true,
        exportTags : true
      };
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  
  run(request, response){
    if(request.json){
      this.config = request.json;
    }else if(request.JSONExport){
      this.config = request.JSONExport;
    }
    const argdown = {
      arguments: response.arguments,
      statements: response.statements,
      relations: response.relations
    };
    if(this.settings.exportMap && response.map && response.map.nodes && response.map.edges){
      argdown.map = {
        nodes: response.map.nodes,
        edges: response.map.edges
      }
    }
    if(this.settings.exportSections && response.sections){
      argdown.sections = response.sections;
    }
    if(this.settings.exportTags && response.tags){
      argdown.tags = response.tags;
    }
    const $ = this;
    response.json = JSON.stringify(argdown, function(key, value){
      if($.settings.removeEmbeddedRelations && key == "relations" && (this instanceof Argument || this instanceof EquivalenceClass)){
        return undefined;
      }
      
      if(!$.settings.exportSections && key == "section" && (this instanceof Argument || this instanceof EquivalenceClass)){
        return undefined;
      }
      
      return value;
    }, this.settings.spaces);
    return response;
  }
  constructor(config){
    this.name = "JSONExport";
    this.config = config;    
  }
}
module.exports = {
  JSONExport: JSONExport
}
