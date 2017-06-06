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
  getCanonicalStatement(){
    if(!this.members || this.members.length <= 0){
      return null;
    }
    return this.members[this.members.length - 1];
  }
  getCanonicalText(){
    let statement = this.getCanonicalStatement();
    if(statement){
      return statement.text;
    }else{
      return null;
    }
  }
}
module.exports = {
  EquivalenceClass: EquivalenceClass
}
