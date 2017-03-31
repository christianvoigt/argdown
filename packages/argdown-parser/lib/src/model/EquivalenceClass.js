"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EquivalenceClass = function EquivalenceClass() {
  _classCallCheck(this, EquivalenceClass);

  this.relations = [];
  this.members = [];
  this.title = "";
  this.isUsedAsPremise = false;
  this.isUsedAsConclusion = false;
  this.isUsedAsRootOfStatementTree = false;
  this.isUsedAsChildOfStatementTree = false;
};

module.exports = {
  EquivalenceClass: EquivalenceClass
};
//# sourceMappingURL=EquivalenceClass.js.map