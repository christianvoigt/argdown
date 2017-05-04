import {Argument} from '../model/Argument.js';

class Relation{
  constructor(relationType){
    this.type = relationType;
  }
  toJSON(){
    let rel = {
      type: this.type,
      status: this.status
    }
    
    if(this.from){
      rel.from = this.from.title;
      if(this.from instanceof Argument){
        rel.fromType = "argument";
      }else{
        rel.fromType = "statement";
      }
    }
    
    if(this.to){
      rel.to = this.to.title;
      if(this.to instanceof Argument){
        rel.toType = "argument";
      }else{
        rel.toType = "statement";
      }      
    }
    
    return rel;
  }
}
module.exports = {
  Relation: Relation
}
