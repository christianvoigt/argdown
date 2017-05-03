import * as _ from 'lodash';
import {Relation} from '../model/Relation.js';
import {Argument} from '../model/Argument.js';
import {Statement} from '../model/EquivalenceClass.js';

class JSONExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      spaces : 2,
      removeEmbeddedRelations: false
    });
  }
  
  run(data){
    const argdown = {
      arguments: data.arguments,
      statements: data.statements,
      relations: data.relations
    };
    const $ = this;
    data.json = JSON.stringify(argdown, function(key, value){
      if($.settings.removeEmbeddedRelations && key == "relations" && (this instanceof Argument || this instanceof EquivalenceClass)){
        return undefined;
      }
      if(this instanceof Relation){
        if(value && (key == "from" || key == "to")){
          return this[key].title;
        }else{
          return value;
        }
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
