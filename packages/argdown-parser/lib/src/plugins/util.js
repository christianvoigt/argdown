"use strict";

module.exports = {
  getHtmlId: function getHtmlId(str) {
    var id = str;
    id = id.toLowerCase();
    id = id.replace(/ä/g, "ae");
    id = id.replace(/ö/g, "oe");
    id = id.replace(/ü/g, "ue");
    id = id.replace(/ß/g, "ss");
    id = id.replace(/\s/g, "-");
    id = id.replace(/[^a-z0-9\-]/g, "");
    return id;
  }
};
//# sourceMappingURL=util.js.map