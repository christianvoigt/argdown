import * as _ from 'lodash';
import {Statement} from '../model/Statement.js';
import {Argument} from '../model/Argument.js';
import {EquivalenceClass} from '../model/EquivalenceClass.js';
import {tokenMatcher} from 'chevrotain';
import {ArgdownLexer} from './../ArgdownLexer.js';

class ArgdownPreprocessor{

  constructor(){
    this.name = "ArgdownPreprocessor";
    let $ = this;

    const statementReferencePattern = /\[(.+)\]\:/;
    const statementDefinitionPattern = /\[(.+)\]/;
    const argumentReferencePattern = /\<(.+)\>/;
    const argumentDefinitionPattern = /\<(.+)\>\:/;
    const linkPattern = /\((.+)\)\[(.+)\]/;

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

    function onArgdownEntry(){
      $.statements = {};
      $.arguments = {};
      currentStatement = null;
      currentStatementOrArgument = null;
      currentArgumentReconstruction = null;
      currentInference = null;
      currentArgument = null;
      rangesStack = [];
      parentsStack = [];
      currentRelation = null;
    }
    function onStatementEntry(node){
      currentStatement = new Statement();
      currentStatementOrArgument = currentStatement;
      node.statement = currentStatement;
    }
    function onStatementExit(node){
      let statement = node.statement;
      if(!statement.title || statement.title == ''){
        statement.title = getUniqueTitle();
      }
      let equivalenceClass = getEquivalenceClass(statement.title);
      equivalenceClass.members.push(statement);
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
      if(match != null)
        currentStatement.title = match[1];
        node.statement = currentStatement;
    }
    function updateArgument(title){
      currentArgument = $.arguments[title];
      if(!currentArgument){
        currentArgument = new Argument();
        currentStatementOrArgument = currentArgument;
        currentArgument.title = title;
        //we are in the ArgumentDefinition token, parentNode is the argumentDefinition rule
        $.arguments[currentArgument.title] = currentArgument;
      }
      currentStatement = new Statement();
      currentArgument.descriptions.push(currentStatement);
    }
    function onArgumentDefinitionEntry(node, parentNode){
      let match = argumentDefinitionPattern.exec(node.image);
      if(match != null){
        let title = match[1];
        updateArgument(title);
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
    }

    function onBoldEntry(){
      let boldRange = {type:'bold', start: currentStatement.text.length};
      rangesStack.push(boldRange);
      currentStatement.ranges.push(boldRange);
    }
    function onBoldExit(){
      let range = _.last(rangesStack);
      range.stop = currentStatement.text.length - 1;
      rangesStack.pop();
    }
    function onItalicEntry(){
      let italicRange = {type:'italic', start: currentStatement.text.length};
      rangesStack.push(italicRange);
      currentStatement.ranges.push(italicRange);
    }
    function onItalicExit(){
      let range = _.last(rangesStack);
      range.stop = currentStatement.text.length - 1;
      rangesStack.pop();
    }

    function onRelationExit(node){
      let relation = node.relation;
      let target = getRelationTarget(currentStatementOrArgument);
      if(relation){
        if(relation.from)
          relation.to = target;
        else {
          relation.from = target;
        }
        relation.from.relations.push(relation);
        relation.to.relations.push(relation);
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
    function onRelationsEntry(){
      parentsStack.push(getRelationTarget(currentStatementOrArgument));
    }
    function getRelationTarget(statementOrArgument){
      let parent = statementOrArgument;
      if(statementOrArgument instanceof Statement){
        if(!statementOrArgument.title)
          statementOrArgument.title = getUniqueTitle();
        parent = getEquivalenceClass(statementOrArgument.title);
      }
      return parent;
    }
    function onRelationsExit(){
      currentRelation = null;
      parentsStack.pop();
    }

    function onArgumentEntry(node, parentNode, childIndex){
      if(childIndex > 0){
          let precedingSibling = parentNode.children[childIndex - 1];
          let argument = null;
          if(precedingSibling.name == 'argumentReference' || precedingSibling.name == 'argumentDefinition'){
            argument = precedingSibling.argument;
          }else if(tokenMatcher(precedingSibling, ArgdownLexer.Emptyline)){
            precedingSibling = parentNode.children[childIndex - 2];
            if(precedingSibling.name == 'argumentReference' || precedingSibling.name == 'argumentDefinition'){
              argument = precedingSibling.argument;
            }
          }
          if(!argument){
            argument = new Argument();
            argument.title = getUniqueTitle();
            $.arguments[argument.title] = argument;
          }
          node.argument = argument;
          currentArgumentReconstruction = argument;
      }
    }
    function onArgumentStatementExit(node, parentNode, childIndex){
      if(node.children.length > 1){
        //first node is ArgdownLexer.ArgumentStatementStart
        let statementNode = node.children[1];
        let statement = statementNode.statement;
        let argumentStatement = {role:"premise", statement:statement};
        if(childIndex > 0){
          let precedingSibling = parentNode.children[childIndex - 1];
          if(precedingSibling.name == 'inference'){
            argumentStatement.role = "conclusion";
            argumentStatement.inference = precedingSibling.inference;
          }
        }
        currentArgumentReconstruction.pcs.push(argumentStatement);
        node.argumentStatement = argumentStatement;
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
    function onHeadingEntry(node){
      let headingStart = node.children[0];
      node.heading = headingStart.image.length;
    }

    this.argdownListeners = {
      argdownEntry : onArgdownEntry,
      headingEntry : onHeadingEntry,
      statementEntry : onStatementEntry,
      statementExit : onStatementExit,
      argumentEntry : onArgumentEntry,
      argumentStatementExit : onArgumentStatementExit,
      inferenceEntry : onInferenceEntry,
      inferenceRulesExit : onInferenceRulesExit,
      metadataStatementExit : onMetadataStatementExit,
      StatementDefinitionEntry : onStatementDefinitionEntry,
      StatementReferenceEntry : onStatementReferenceEntry,
      ArgumentDefinitionEntry : onArgumentDefinitionEntry,
      ArgumentReferenceEntry : onArgumentReferenceEntry,
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
}
module.exports = {
  ArgdownPreprocessor: ArgdownPreprocessor
}
