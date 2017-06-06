"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EquivalenceClass = function () {
  function EquivalenceClass() {
    _classCallCheck(this, EquivalenceClass);

    this.relations = [];
    this.members = [];
    this.title = "";
    this.isUsedAsPremise = false;
    this.isUsedAsConclusion = false;
    this.isUsedAsRootOfStatementTree = false;
    this.isUsedAsChildOfStatementTree = false;
  }

  _createClass(EquivalenceClass, [{
    key: "getCanonicalStatement",
    value: function getCanonicalStatement() {
      if (!this.members || this.members.length <= 0) {
        return null;
      }
      return this.members[this.members.length - 1];
    }
  }, {
    key: "getCanonicalText",
    value: function getCanonicalText() {
      var statement = this.getCanonicalStatement();
      if (statement) {
        return statement.text;
      } else {
        return null;
      }
    }
  }]);

  return EquivalenceClass;
}();

module.exports = {
  EquivalenceClass: EquivalenceClass
};
//# sourceMappingURL=EquivalenceClass.js.map