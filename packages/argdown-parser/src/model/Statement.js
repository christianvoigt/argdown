import * as _ from "lodash";

class Statement {
  constructor() {
    this.text = "";
    this.ranges = [];
  }
  toJSON() {
    let copy = _.clone(this);
    if (copy.section) {
      copy.section = copy.section.id;
    }
    return copy;
  }
}
module.exports = {
  Statement: Statement
};
