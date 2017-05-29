import * as _ from 'lodash';
import {Argument} from '../model/Argument.js';
import {EquivalenceClass} from '../model/EquivalenceClass.js';

class JSONExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      spaces : 2,
      removeEmbeddedRelations: false,
      exportMap : true,
      exportSections : true
    });
  }
  
  run(data){
    if(data.config){
      if(data.config.json){
        this.config = data.config.json;
      }else if(data.config.JSONExport){
        this.config = data.config.JSONExport;
      }
    }
    const argdown = {
      arguments: data.arguments,
      statements: data.statements,
      relations: data.relations
    };
    if(this.settings.exportMap && data.map && data.map.nodes && data.map.edges){
      argdown.map = {
        nodes: data.map.nodes,
        edges: data.map.edges
      }
    }
    if(this.settings.exportSections && data.sections){
      argdown.sections = data.sections;
    }
    const $ = this;
    data.json = JSON.stringify(argdown, function(key, value){
      if($.settings.removeEmbeddedRelations && key == "relations" && (this instanceof Argument || this instanceof EquivalenceClass)){
        return undefined;
      }
      
      if(!$.settings.exportSections && key == "section" && (this instanceof Argument || this instanceof EquivalenceClass)){
        return undefined;
      }
      
      return value;
    }, this.settings.spaces);
    return data;
  }
  constructor(config){
    this.name = "JSONExport";
    this.config = config;    
  }
}
module.exports = {
  JSONExport: JSONExport
}
