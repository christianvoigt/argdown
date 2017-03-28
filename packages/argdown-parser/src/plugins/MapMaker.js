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
    let map = {nodes: [], edges: []};
    let nodeCount = 0;
    let edgeCount = 0;
    let relations = [];
    let statementNodes = {};
    let argumentNodes = {};

    //find all statement classes that should be inserted as nodes
    let statementKeys = Object.keys(data.statements);
    for(let statementKey of statementKeys){
      let equivalenceClass = data.statements[statementKey];
      if(equivalenceClass.relations.length > 0 && (equivalenceClass.isUsedAsThesis || !equivalenceClass.isUsedInArgument)){
        let id = "n"+nodeCount;
        nodeCount++;
        let node = {type:"statement", title:statementKey, id:id};
        statementNodes[statementKey] = node;
        map.nodes.push(node)

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
      let node = {type:"argument", title:argument.title, id:id};
      argumentNodes[argumentKey] = node;
      map.nodes.push(node);
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
          roles.premiseIn.push(argumentNodes[argumentKey]);
        }else if(statement.role == "conclusion" && statement == argument.pcs[argument.pcs.length - 1]){
          let equivalenceClass = data.statements[statement.title];
          roles.conclusionIn.push(argumentNodes[argumentKey]);
          for(let relation of equivalenceClass.relations){
            if(relation.from == equivalenceClass){
              relations.push(relation);
            }
          }
        }
      }
    }

    for(let relation of relations){
      let froms = [];
      let tos = [];

      //sketched: relations from thesis to thesis and relations from argument to argument
      //reconstructed: relation from conclusion to premises or conclusion to thesis

      let fromNode;
      let fromStatement;
      if(relation.from instanceof Argument){
        fromNode = argumentNodes[relation.from.title];
      }else{
        fromNode = statementNodes[relation.from.title];
        fromStatement = data.statements[relation.from.title];
      }
      if(!fromNode){ //fromNode has to be a statement
        let roles = statementRoles[relation.from.title];
        fromStatement = data.statements[relation.from.title];
        froms = roles.conclusionIn;
      }else{
        froms.push(fromNode);
      }

      let toNode;
      let toStatement;
      if(relation.to instanceof Argument){
        toNode = argumentNodes[relation.to.title];
      }else{
        toNode = statementNodes[relation.to.title];
      }
      if(!toNode){ //fromNode has to be a statement
        let roles = statementRoles[relation.to.title];
        toStatement = data.statements[relation.to.title];
        tos = roles.premiseIn;
      }else{
        tos.push(toNode);
      }

      for(let from of froms){
        for(let to of tos){
          let edgeId = 'e'+edgeCount;
          edgeCount++;
          map.edges.push({
            id:edgeId,
            from:from, //node
            to:to, //node
            fromStatement: fromStatement, //statement
            toStatement: toStatement, //statement
            type:relation.type
          });
        }
      }
    }
    return map;
  }
}
module.exports = {
  MapMaker: MapMaker
}
