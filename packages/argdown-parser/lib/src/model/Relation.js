"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Argument = require("../model/Argument.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Relation = function () {
  function Relation(relationType) {
    _classCallCheck(this, Relation);

    this.type = relationType;
  }

  _createClass(Relation, [{
    key: "toJSON",
    value: function toJSON() {
      var rel = {
        type: this.type,
        status: this.status
      };

      if (this.from) {
        rel.from = this.from.title;
        if (this.from instanceof _Argument.Argument) {
          rel.fromType = "argument";
        } else {
          rel.fromType = "statement";
        }
      }

      if (this.to) {
        rel.to = this.to.title;
        if (this.to instanceof _Argument.Argument) {
          rel.toType = "argument";
        } else {
          rel.toType = "statement";
        }
      }

      return rel;
    }
  }]);

  return Relation;
}();

module.exports = {
  Relation: Relation
};
//# sourceMappingURL=Relation.js.map