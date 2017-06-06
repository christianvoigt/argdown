import * as _ from 'lodash';

class Argument{
  constructor(){
    this.relations = [];
    //Premise Conclusion Structure (PCS)
    this.pcs = [];
    this.descriptions = [];
  }
  toJSON(){
    let copy = _.clone(this);
    if(copy.section){
      copy.section = copy.section.id;      
    }
    return copy;
  }
  getCanonicalDescription(){
    if(!this.descriptions || this.descriptions.length <= 0){
      return null;
    }
    return this.descriptions[this.descriptions.length - 1];
  }
}
module.exports = {
  Argument: Argument
}
