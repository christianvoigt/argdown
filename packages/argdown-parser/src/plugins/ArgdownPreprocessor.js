import * as _ from 'lodash';
import {Statement} from '../model/Statement.js';
import {Argument} from '../model/Argument.js';
import {EquivalenceClass} from '../model/EquivalenceClass.js';
import {tokenMatcher} from 'chevrotain';
import {ArgdownLexer} from './../ArgdownLexer.js';

const RelationObjectTypes = Object.freeze({STATEMENT: Symbol("STATEMENT"), RECONSTRUCTED_ARGUMENT: Symbol("RECONSTRUCTED ARGUMENT"), SKETCHED_ARGUMENT: Symbol("SKETCHED ARGUMENT")});

class ArgdownPreprocessor{
  run(data){
    for(let relation of this.relations){
      let fromType = this.getElementType(relation.from);
      let toType = this.getElementType(relation.to);
      if(fromType == RelationObjectTypes.SKETCHED_ARGUMENT ||toType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT ||toType == RelationObjectTypes.SKETCHED_ARGUMENT){
        relation.status = "sketched";
      }else if(fromType == RelationObjectTypes.STATEMENT ||fromType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT){
        relation.status = "reconstructed";
        if(fromType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT){
          //change relation.from to point to the argument's conclusion
          let argument = relation.from;
          let index = _.indexOf(argument.relations, relation);
          argument.relations.splice(index, 1);

          let conclusionStatement = argument.pcs[relation.from.pcs.length - 1];
          let equivalenceClass = this.statements[conclusionStatement.title];
          relation.from = equivalenceClass;
          equivalenceClass.relations.push(relation);
        }
      }
    }


    data.relations = this.relations;
    data.statements = this.statements;
    data.arguments = this.arguments;
    return data;
  }
  getElementType(obj){
    if(obj instanceof Argument){
      if(obj.pcs && obj.pcs.length > 0){
        return RelationObjectTypes.RECONSTRUCTED_ARGUMENT;
      }else{
        return RelationObjectTypes.SKETCHED_ARGUMENT;
      }
    }else if(obj instanceof EquivalenceClass){
        return RelationObjectTypes.STATEMENT;
    }
    return null;
  }
  constructor(){
    this.name = "ArgdownPreprocessor";
    let $ = this;

    const statementReferencePattern = /\[(.+)\]/;
    const statementDefinitionPattern = /\[(.+)\]\:/;
    const statementMentionPattern = /\@\[(.+)\](\s?)/;
    const argumentReferencePattern = /\<(.+)\>/;
    const argumentDefinitionPattern = /\<(.+)\>\:/;
    const argumentMentionPattern = /\@\<(.+)\>(\s?)/;
    const linkPattern = /\[(.+)\]\((.+)\)/;

    let uniqueTitleCounter = 0;
    function getUniqueTitle(){
      uniqueTitleCounter++;
      return "Untitled "+uniqueTitleCounter;
    }
    function getEquivalenceClass(title){
      if(!title)
        return null;

      let ec = $.statements[title];
      if(!ec){
        ec = new EquivalenceClass();
        ec.title = title;
        $.statements[title] = ec;
      }
      return ec;
    }


    let currentStatement = null;
    let currentStatementOrArgument = null;
    let currentArgument = null;
    let currentArgumentReconstruction = null;
    let currentInference = null;
    let rangesStack = [];
    let parentsStack = [];
    let currentRelation = null;
    let inStatementTree = false;

    function onArgdownEntry(){
      $.statements = {};
      $.arguments = {};
      $.relations = [];
      uniqueTitleCounter = 0;
      currentStatement = null;
      currentStatementOrArgument = null;
      currentArgumentReconstruction = null;
      currentInference = null;
      currentArgument = null;
      rangesStack = [];
      parentsStack = [];
      currentRelation = null;
      inStatementTree = false;
    }
    function onStatementEntry(node, parentNode){
      currentStatement = new Statement();
      if(parentNode.name == 'argdown'){
          currentStatement.isRootOfStatementTree = true;
          inStatementTree = true;
      }else if(inStatementTree){
        currentStatement.isChildOfStatementTree = true;
      }
      currentStatementOrArgument = currentStatement;
      node.statement = currentStatement;
    }
    function onStatementExit(node){
      let statement = node.statement;
      if(!statement.title || statement.title == ''){
        statement.title = getUniqueTitle();
      }
      if(statement.isRootOfStatementTree){
        inStatementTree = false;
      }
      let equivalenceClass = getEquivalenceClass(statement.title);
      equivalenceClass.members.push(statement);
      if(statement.isRootOfStatementTree){
        equivalenceClass.isUsedAsRootOfStatementTree = true; //members are used outside of argument reconstructions (not as premise or conclusion)
      }else if(statement.isChildOfStatementTree){
        equivalenceClass.isUsedAsChildOfStatementTree = true;
      }
      currentStatement = null;
    }
    function onStatementDefinitionEntry(node){
      let match = statementDefinitionPattern.exec(node.image);
      if(match != null){
        currentStatement.title = match[1];
        node.statement = currentStatement;
      }
    }
    function onStatementReferenceEntry(node){
      let match = statementReferencePattern.exec(node.image);
      if(match != null){
        currentStatement.title = match[1];
        node.statement = currentStatement;
      }
    }
    function onStatementMentionExit(node){
      let match = statementMentionPattern.exec(node.image);
      if(match){
        node.title = match[1];
        if(node.image[node.image.length - 1] == " "){
          node.trailingWhitespace = ' ';
        }else {
          node.trailingWhitespace = '';
        }
        if(currentStatement){
          let range = {type:'statement-mention',title:node.title, start:currentStatement.text.length};
          currentStatement.text += node.image;
          range.stop = currentStatement.text.length -1;
          currentStatement.ranges.push(range);
        }
      }
    }
    function updateArgument(title){
      if(title){
        currentArgument = $.arguments[title];        
      }
      if(!title || !currentArgument){
        currentArgument = new Argument();
        if(!title){
          currentArgument.title = getUniqueTitle();
        }else {
          currentArgument.title = title;
        }
        //we are in the ArgumentDefinition token, parentNode is the argumentDefinition rule
        $.arguments[currentArgument.title] = currentArgument;
      }
      currentStatementOrArgument = currentArgument;
      return currentArgument;
    }
    function onArgumentDefinitionEntry(node, parentNode){
      let match = argumentDefinitionPattern.exec(node.image);
      if(match != null){
        let title = match[1];
        updateArgument(title);
        currentStatement = new Statement();
        currentArgument.descriptions.push(currentStatement);
        parentNode.argument = currentArgument;
      }
    }
    function onArgumentDefinitionOrReferenceExit(){
      currentStatement = null;
      currentArgument = null;
    }
    function onArgumentReferenceEntry(node, parentNode){
      let match = argumentReferencePattern.exec(node.image);
      if(match != null){
        let title = match[1];
        updateArgument(title);
        parentNode.argument = currentArgument;
      }
    }
    function onArgumentMentionExit(node){
      let match = argumentMentionPattern.exec(node.image);
      if(match){
        node.title = match[1];
        if(node.image[node.image.length - 1] == " "){
          node.trailingWhitespace = ' ';
        }else {
          node.trailingWhitespace = '';
        }
        if(currentStatement){
          let range = {type:'argument-mention',title:node.title, start:currentStatement.text.length};
          currentStatement.text += node.image;
          range.stop = currentStatement.text.length -1;
          currentStatement.ranges.push(range);
        }
      }
    }
    function onFreestyleTextEntry(node){
      node.text = "";
      for(let child of node.children){
        node.text += child.image;
      }
      if(currentStatement)
        currentStatement.text += node.text;
    }
    function onLinkEntry(node){
      let match = linkPattern.exec(node.image);
      let linkRange = {type:'link', start: currentStatement.text.length};
      node.url = match[2];
      node.text = match[1];
      currentStatement.text += node.text;
      linkRange.stop = currentStatement.text.length - 1;
      linkRange.url = node.url;
      currentStatement.ranges.push(linkRange);
      if(node.image[node.image.length - 1] == ' '){
        currentStatement.text += ' ';
        node.trailingWhitespace = ' ';
      }else{
        node.trailingWhitespace = '';
      }
    }

    function onBoldEntry(){
      let boldRange = {type:'bold', start: currentStatement.text.length};
      rangesStack.push(boldRange);
      currentStatement.ranges.push(boldRange);
    }
    function onBoldExit(node){
      let boldEnd = _.last(node.children);
      if(boldEnd.image[boldEnd.image.length - 1] == ' '){
        currentStatement.text += ' ';
        node.trailingWhitespace = ' ';
      }else{
        node.trailingWhitespace = '';
      }
      let range = _.last(rangesStack);
      range.stop = currentStatement.text.length - 1;
      rangesStack.pop();
    }
    function onItalicEntry(){
      let italicRange = {type:'italic', start: currentStatement.text.length};
      rangesStack.push(italicRange);
      currentStatement.ranges.push(italicRange);
    }
    function onItalicExit(node){
      let italicEnd = _.last(node.children);
      if(italicEnd.image[italicEnd.image.length - 1] == ' '){
        currentStatement.text += ' ';
        node.trailingWhitespace = ' ';
      }else{
        node.trailingWhitespace = '';
      }
      let range = _.last(rangesStack);
      range.stop = currentStatement.text.length - 1;
      rangesStack.pop();
    }

    function onRelationExit(node){
      let relation = node.relation;
      let contentNode = node.children[1];
      let content = contentNode.argument ||contentNode.statement;
      let target = getRelationTarget(content);
      if(relation){
        if(relation.from)
          relation.to = target;
        else {
          relation.from = target;
        }

        let relationExists = false;
        for(let existingRelation of relation.from.relations){
          if(relation.to == existingRelation.to && relation.type == existingRelation.type){
            relationExists = true;
            break;
          }
        }

        if(!relationExists){
          $.relations.push(relation);
          relation.from.relations.push(relation);
          relation.to.relations.push(relation);
        }
      }
    }
    function onIncomingSupportEntry(node){
      let target = _.last(parentsStack);
      currentRelation = {type:"support", from:target};
      node.relation = currentRelation;
    }
    function onIncomingAttackEntry(node){
      let target = _.last(parentsStack);
      currentRelation = {type:"attack", from:target};
      node.relation = currentRelation;
    }
    function onOutgoingSupportEntry(node){
      let target = _.last(parentsStack);
      currentRelation = {type:"support", to:target};
      node.relation = currentRelation;
    }
    function onOutgoingAttackEntry(node){
      let target = _.last(parentsStack);
      currentRelation = {type:"attack", to:target};
      node.relation = currentRelation;
    }
    function onContradictionEntry(node){
      let target = _.last(parentsStack);
      currentRelation = {type:"contradiction", from:target};
      node.relation = currentRelation;
    }

    function onRelationsEntry(){
      parentsStack.push(getRelationTarget(currentStatementOrArgument));
    }
    function getRelationTarget(statementOrArgument){
      let target = statementOrArgument;
      if(statementOrArgument instanceof Statement){
        if(!statementOrArgument.title)
          statementOrArgument.title = getUniqueTitle();
        target = getEquivalenceClass(statementOrArgument.title);
      }
      return target;
    }
    function onRelationsExit(){
      currentRelation = null;
      parentsStack.pop();
    }

    function onArgumentEntry(node, parentNode, childIndex){
      let argument = null;
      if(childIndex > 0){
          let precedingSibling = parentNode.children[childIndex - 1];
          if(precedingSibling.name == 'argumentReference' || precedingSibling.name == 'argumentDefinition'){
            argument = precedingSibling.argument;
          }else if(tokenMatcher(precedingSibling, ArgdownLexer.Emptyline)){
            precedingSibling = parentNode.children[childIndex - 2];
            if(precedingSibling.name == 'argumentReference' || precedingSibling.name == 'argumentDefinition'){
              argument = precedingSibling.argument;
            }
          }
        }
        if(!argument){
          argument = updateArgument();
        }
        //if there is a previous reconstruction, overwrite it
        if(argument.pcs.length > 0){
          //TODO: throw error
          argument.pcs = [];
        }
        node.argument = argument;
        currentArgumentReconstruction = argument;
    }
    function onArgumentExit(){
      currentStatement = null;
      currentArgument = null;
      currentArgumentReconstruction = null;
    }
    function onArgumentStatementExit(node, parentNode, childIndex){
      if(node.children.length > 1){
        //first node is ArgdownLexer.ArgumentStatementStart
        let statementNode = node.children[1];
        let statement = statementNode.statement;
        let ec = getEquivalenceClass(statement.title);
        statement.role = "premise";
        if(childIndex > 0){
          let precedingSibling = parentNode.children[childIndex - 1];
          if(precedingSibling.name == 'inference'){
            statement.role = "conclusion";
            ec.isUsedAsConclusion = true;
            statement.inference = precedingSibling.inference;
          }
        }
        if(statement.role == "premise"){
          ec.isUsedAsPremise = true;
        }
        currentArgumentReconstruction.pcs.push(statement);
        node.statement = statement;
        node.statementNr = currentArgumentReconstruction.pcs.length;
      }
    }
    function onInferenceEntry(node){
      currentInference = {inferenceRules:[], metaData:{}};
      node.inference = currentInference;
    }
    function onInferenceRulesExit(node){
      for(let child of node.children){
        if(child.name == 'freestyleText'){
          currentInference.inferenceRules.push(child.text.trim());
        }
      }
    }
    function onMetadataStatementExit(node){
      let key = node.children[0].text;
      let value = null;
      if(node.children.length == 2){
        value = node.children[1].text;
      }else{
        value = [];
        for(let i = 1; i < node.children.length; i++){
          value.push(node.children[i].text);
        }
      }
      currentInference.metaData[key] = value;
    }
    function onHeadingExit(node){
      let headingStart = node.children[0];
      node.heading = headingStart.image.length;
      node.text = node.children[1].text;
    }

    this.argdownListeners = {
      argdownEntry : onArgdownEntry,
      headingExit : onHeadingExit,
      statementEntry : onStatementEntry,
      statementExit : onStatementExit,
      argumentEntry : onArgumentEntry,
      argumentExist : onArgumentExit,
      argumentStatementExit : onArgumentStatementExit,
      inferenceEntry : onInferenceEntry,
      inferenceRulesExit : onInferenceRulesExit,
      metadataStatementExit : onMetadataStatementExit,
      StatementDefinitionEntry : onStatementDefinitionEntry,
      StatementReferenceEntry : onStatementReferenceEntry,
      StatementMentionExit : onStatementMentionExit,
      ArgumentDefinitionEntry : onArgumentDefinitionEntry,
      ArgumentReferenceEntry : onArgumentReferenceEntry,
      ArgumentMentionExit : onArgumentMentionExit,
      argumentDefinitionExit : onArgumentDefinitionOrReferenceExit,
      argumentReferenceExit : onArgumentDefinitionOrReferenceExit,
      incomingSupportEntry : onIncomingSupportEntry,
      incomingSupportExit : onRelationExit,
      incomingAttackEntry : onIncomingAttackEntry,
      incomingAttackExit : onRelationExit,
      outgoingSupportEntry : onOutgoingSupportEntry,
      outgoingSupportExit : onRelationExit,
      outgoingAttackEntry : onOutgoingAttackEntry,
      outgoingAttackExit : onRelationExit,
      contradictionEntry : onContradictionEntry,
      contradictionExit : onRelationExit,
      relationsEntry : onRelationsEntry,
      relationsExist : onRelationsExit,
      freestyleTextEntry : onFreestyleTextEntry,
      italicEntry : onItalicEntry,
      italicExit : onItalicExit,
      boldEntry : onBoldEntry,
      boldExit : onBoldExit,
      LinkEntry : onLinkEntry
    }
  }
  logRelations(data){
    for(let statementKey of Object.keys(data.statements)){
      let statement = data.statements[statementKey];
      for(let relation of statement.relations){
        if(relation.from == statement){
          console.log("Relation from: "+relation.from.title+" to: "+relation.to.title+" type: "+relation.type);
        }
      }
    }
    for(let argumentKey of Object.keys(data.arguments)){
      let argument = data.arguments[argumentKey];
      for(let relation of argument.relations){
        if(relation.from == argument){
          console.log("Relation from: "+relation.from.title+" to: "+relation.to.title+" type: "+relation.type);
        }
      }
    }
  }
}
module.exports = {
  ArgdownPreprocessor: ArgdownPreprocessor,
  RelationObjectTypes : RelationObjectTypes
}
