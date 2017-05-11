import * as _ from 'lodash';

class Section{
  constructor(id, title, level){
    this.id = id;
    this.title = title;
    this.level = level;
    this.children = [];
  }
  toJSON(){
    let copy = _.clone(this);
    if(copy.parent){
      copy.parent = copy.parent.id;      
    }
    return copy;
  }
}
module.exports = {
  Section: Section
}
