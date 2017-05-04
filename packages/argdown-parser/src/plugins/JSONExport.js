import * as _ from 'lodash';
import {Relation} from '../model/Relation.js';
import {Argument} from '../model/Argument.js';
import {EquivalenceClass} from '../model/EquivalenceClass.js';

class JSONExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      spaces : 2,
      removeEmbeddedRelations: false,
      exportMap : true
    });
  }
  
  run(data){
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
    const $ = this;
    data.json = JSON.stringify(argdown, function(key, value){
      if($.settings.removeEmbeddedRelations && key == "relations" && (this instanceof Argument || this instanceof EquivalenceClass)){
        return undefined;
      }else{
        return value;
      }
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
