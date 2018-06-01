import * as _ from "lodash";

class Section {
  constructor(id, level, title, ranges, tags) {
    this.id = id;
    this.title = title;
    this.ranges = ranges;
    this.level = level;
    this.children = [];
    this.tags = tags;
  }
  toJSON() {
    let copy = _.clone(this);
    if (copy.parent) {
      copy.parent = copy.parent.id;
    }
    if (copy.heading) {
      delete copy.heading;
    }
    return copy;
  }
}
module.exports = {
  Section: Section
};
