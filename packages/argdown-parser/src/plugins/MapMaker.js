import {Argument} from '../model/Argument.js';

class MapMaker{
  constructor(){
    this.name = "MapMaker";
  }
  run(data){
    data.map = this.makeMap(data);
    return data;
  }
  makeMap(data){
    let map = {argumentNodes: {}, statementNodes: {}, relations: []};
    let nodeCount = 0;
    let relations = [];

    //find all statement classes that should be inserted as nodes
    let statementKeys = Object.keys(data.statements);
    for(let statementKey of statementKeys){
      let equivalenceClass = data.statements[statementKey];
      if(equivalenceClass.relations.length > 0 && (equivalenceClass.isUsedAsThesis || !equivalenceClass.isUsedInArgument)){
        let id = "n"+nodeCount;
        nodeCount++;
        map.statementNodes[statementKey] = {type:"statement", title:statementKey, id:id};

        if(!equivalenceClass.isUsedInArgument){ //if the statement is used in an argument, the relations get added in the next round
          //add all relations outgoing from this statement class, if it is not added by an argument
          for(let relation of equivalenceClass.relations){
            if(relation.from == equivalenceClass){
              relations.push(relation);
            }
          }
        }
      }
    }

    let argumentKeys = Object.keys(data.arguments);
    let statementRoles = {}; //a dictionary mapping statement titles to {premiseIn:[nodeId], conclusionIn:[nodeId]} objects

    for(let argumentKey of argumentKeys){
      let argument = data.arguments[argumentKey];
      let id = "n"+nodeCount;
      nodeCount++;
      map.argumentNodes[argumentKey] = {type:"argument", title:argument.title, id:id};
      for(let relation of argument.relations){
        if(relation.from == argument){
          relations.push(relation);
        }
      }
      for(let statement of argument.pcs){
        let roles = statementRoles[statement.title];
        if(!roles){
          roles = {premiseIn:[], conclusionIn:[]};
          statementRoles[statement.title] = roles;
        }
        if(statement.role == "premise"){
          roles.premiseIn.push(map.argumentNodes[argumentKey]);
        }else if(statement.role == "conclusion"){
          roles.conclusionIn.push(map.argumentNodes[argumentKey]);
        }
        let equivalenceClass = data.statements[statement.title];
        for(let relation of equivalenceClass.relations){
          if(statement.role == "conclusion" && relation.from == equivalenceClass){
            relations.push(relation);
          }
        }
      }
    }

    for(let relation of relations){
      let froms = [];
      let tos = [];

      let fromNode;
      if(relation.from instanceof Argument){
        fromNode = map.argumentNodes[relation.from.title];
      }else{
        fromNode = map.statementNodes[relation.from.title];
      }
      if(!fromNode){ //fromNode has to be a statement
        let roles = statementRoles[relation.from.title];
        froms = roles.conclusionIn;
      }else{
        froms.push(fromNode);
      }

      let toNode;
      if(relation.to instanceof Argument){
        toNode = map.argumentNodes[relation.to.title];
      }else{
        toNode = map.statementNodes[relation.to.title];
      }
      if(!toNode){ //fromNode has to be a statement
        let roles = statementRoles[relation.to.title];
        tos = roles.premiseIn;
      }else{
        tos.push(toNode);
      }

      for(let from of froms){
        for(let to of tos){
          map.relations.push({from:from, to:to, type:relation.type});
        }
      }
    }
    return map;
  }
}
module.exports = {
  MapMaker: MapMaker
}
