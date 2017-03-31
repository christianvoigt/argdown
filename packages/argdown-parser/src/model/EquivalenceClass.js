class EquivalenceClass{
  constructor(){
    this.relations = [];
    this.members = [];
    this.title = "";
    this.isUsedAsPremise = false;
    this.isUsedAsConclusion = false;
    this.isUsedAsRootOfStatementTree = false;
    this.isUsedAsChildOfStatementTree = false;
  }
}
module.exports = {
  EquivalenceClass: EquivalenceClass
}
