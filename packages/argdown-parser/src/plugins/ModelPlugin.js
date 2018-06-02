import * as _ from "lodash";
import { Statement } from "../model/Statement.js";
import { Argument } from "../model/Argument.js";
import { Relation } from "../model/Relation.js";
import { Section } from "../model/Section.js";
import { EquivalenceClass } from "../model/EquivalenceClass.js";
import { tokenMatcher } from "chevrotain";
import { ArgdownLexer } from "./../ArgdownLexer.js";

const RelationObjectTypes = Object.freeze({
  STATEMENT: Symbol("STATEMENT"),
  RECONSTRUCTED_ARGUMENT: Symbol("RECONSTRUCTED ARGUMENT"),
  SKETCHED_ARGUMENT: Symbol("SKETCHED ARGUMENT")
});

class ModelPlugin {
  getSettings(request) {
    if (!request.model) {
      request.model = {};
    }
    return request.model;
  }
  prepare(request) {
    _.defaultsDeep(this.getSettings(request), this.defaults);
  }
  run(request, response) {
    if (response.relations) {
      for (let relation of response.relations) {
        let fromType = this.getElementType(relation.from);
        let toType = this.getElementType(relation.to);

        // For reconstructed arguments: change outgoing argument relations
        // to outgoing relations of the main conclusion, removing duplicates
        if (fromType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT) {
          //change relation.from to point to the argument's conclusion
          let argument = relation.from;

          //remove from argument
          let index = _.indexOf(argument.relations, relation);
          argument.relations.splice(index, 1);

          let conclusionStatement = argument.pcs[relation.from.pcs.length - 1];
          let equivalenceClass = response.statements[conclusionStatement.title];
          //change to relation of main conclusion
          relation.from = equivalenceClass;

          //check if this relation already exists
          let relationExists = false;
          for (let existingRelation of equivalenceClass.relations) {
            if (
              relation.to == existingRelation.to &&
              relation.type == existingRelation.type
            ) {
              relationExists = true;
              break;
            }
          }
          if (!relationExists) {
            equivalenceClass.relations.push(relation);
          } else {
            //remove relation from target
            let index = _.indexOf(relation.to.relations, relation);
            relation.to.relations.splice(index, 1);
            //remove relation from relations
            index = _.indexOf(response.relations, relation);
            response.relations.splice(index, 1);
          }
        }
        //Add relation status: "Reconstructed" for statement-to-statement relations, "sketched" for all others
        if (
          fromType == RelationObjectTypes.SKETCHED_ARGUMENT ||
          toType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT ||
          toType == RelationObjectTypes.SKETCHED_ARGUMENT
        ) {
          relation.status = "sketched";
        } else if (
          fromType == RelationObjectTypes.STATEMENT ||
          fromType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT
        ) {
          relation.status = "reconstructed";
        }
      }
      //Change dialectical types of statement-to-statement relations to semantic types
      //Doing this in a separate loop makes it easier to identify duplicates in the previous loop,
      //even though it is less efficient.
      for (let relation of response.relations) {
        if (relation.status == "sketched") {
          continue;
        }
        if (relation.type == "support") {
          relation.type = "entails";
        } else if (relation.type == "attack") {
          relation.type = "contrary";
        }
      }
    }

    return response;
  }
  getElementType(obj) {
    if (obj instanceof Argument) {
      if (obj.pcs && obj.pcs.length > 0) {
        return RelationObjectTypes.RECONSTRUCTED_ARGUMENT;
      } else {
        return RelationObjectTypes.SKETCHED_ARGUMENT;
      }
    } else if (obj instanceof EquivalenceClass) {
      return RelationObjectTypes.STATEMENT;
    }
    return null;
  }
  constructor(config) {
    let defaultSettings = {
      removeTagsFromText: false
    };
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
    this.name = "ModelPlugin";
    let $ = this;

    const statementReferencePattern = /\[(.+)\]/;
    const statementDefinitionPattern = /\[(.+)\]\:/;
    const statementMentionPattern = /\@\[(.+)\](\s?)/;
    const argumentReferencePattern = /\<(.+)\>/;
    const argumentDefinitionPattern = /\<(.+)\>\:/;
    const argumentMentionPattern = /\@\<(.+)\>(\s?)/;
    // const statementReferenceByNumberPattern = /\<(.+)\>\((.+)\)/;
    // const statementDefinitionByNumberPattern = /\<(.+)\>\((.+)\)\:/;
    // const statementMentionByNumberPattern = /\@\<(.+)\>\((.+)\)/;
    const linkPattern = /\[(.+)\]\((.+)\)/;
    const tagPattern = /#(?:\(([^\)]+)\)|([a-zA-z0-9-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+))/;

    let uniqueTitleCounter = 0;
    function getUniqueTitle() {
      uniqueTitleCounter++;
      return "Untitled " + uniqueTitleCounter;
    }
    function getEquivalenceClass(response, title) {
      if (!title) {
        return null;
      }
      let ec = null;
      ec = response.statements[title];
      if (!ec) {
        ec = new EquivalenceClass();
        ec.title = title;
        response.statements[title] = ec;
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
    let currentHeading = null;
    let currentSection = null;
    let sectionCounter = 0;

    function onArgdownEntry(request, response) {
      if (request.model) {
        $.config = request.model;
      }
      response.statements = {};
      response.arguments = {};
      response.sections = [];
      response.relations = [];
      response.tags = [];
      uniqueTitleCounter = 0;
      currentHeading = null;
      currentSection = null;
      currentStatementOrArgument = null;
      currentArgumentReconstruction = null;
      currentInference = null;
      currentArgument = null;
      rangesStack = [];
      parentsStack = [];
      currentRelation = null;
      inStatementTree = false;
      sectionCounter = 0;
    }
    function onStatementEntry(request, response, node, parentNode) {
      currentStatement = new Statement();
      if (parentNode.name == "argdown") {
        currentStatement.isRootOfStatementTree = true;
        inStatementTree = true;
      } else if (inStatementTree) {
        currentStatement.isChildOfStatementTree = true;
      }
      currentStatementOrArgument = currentStatement;
      node.statement = currentStatement;
    }
    function onStatementExit(request, response, node) {
      let statement = node.statement;
      statement.startLine = node.startLine;
      statement.startColumn = node.startColumn;
      statement.endLine = node.endLine;
      statement.endColumn = node.endColumn;
      if (!statement.title || statement.title == "") {
        statement.title = getUniqueTitle();
      }
      if (statement.isRootOfStatementTree) {
        inStatementTree = false;
      }
      // //If we are in an argument reconstruction, we have to get argument title and statement number
      // //getEquivalenceClass will look for equivalenceClasses that were already defined by using a reference to this argumentStatement

      // if (currentArgumentReconstruction && !currentRelation) {
      //   node.argumentTitle = currentArgumentReconstruction.title;
      //   node.statementNumber = currentArgumentReconstruction.pcs.length + 1;
      // }
      let equivalenceClass = getEquivalenceClass(response, statement.title);
      node.equivalenceClass = equivalenceClass;
      if (statement.tags) {
        addTags(statement.tags, equivalenceClass);
      }
      if (!_.isEmpty(statement.text)) {
        if (currentSection) {
          statement.section = currentSection;
        }
        equivalenceClass.members.push(statement);
      }
      if (statement.isRootOfStatementTree) {
        equivalenceClass.isUsedAsRootOfStatementTree = true; //members are used outside of argument reconstructions (not as premise or conclusion)
      } else if (statement.isChildOfStatementTree) {
        equivalenceClass.isUsedAsChildOfStatementTree = true;
      }
      currentStatement = null;
    }
    function onStatementDefinitionEntry(request, response, node, parentNode) {
      let match = statementDefinitionPattern.exec(node.image);
      if (match != null) {
        currentStatement.title = match[1];
        node.title = currentStatement.title;
        parentNode.statement = currentStatement;
      }
    }
    // function onStatementDefinitionByNumberEntry(node){
    //   let match = statementDefinitionByNumberPattern.exec(node.image);
    //   if (match != null) {
    //     node.statementUsedInArgument = match[1];
    //     node.statementNumber = match[2];
    //     node.statement = currentStatement;
    //   }
    // }
    function onStatementReferenceEntry(request, response, node, parentNode) {
      let match = statementReferencePattern.exec(node.image);
      if (match != null) {
        currentStatement.title = match[1];
        node.title = currentStatement.title;
        parentNode.statement = currentStatement;
      }
    }
    // function onStatementReferenceByNumberEntry(node) {
    //   let match = statementReferenceByNumberPattern.exec(node.image);
    //   if (match != null) {
    //     node.statementUsedInArgument = match[1];
    //     node.statementNumber = match[2];
    //     node.statement = currentStatement;
    //   }
    // }
    function onStatementMentionExit(request, response, node) {
      const target = currentHeading ? currentHeading : currentStatement;
      let match = statementMentionPattern.exec(node.image);
      if (match) {
        node.title = match[1];
        if (node.image[node.image.length - 1] == " ") {
          node.trailingWhitespace = " ";
        } else {
          node.trailingWhitespace = "";
        }
        if (target) {
          let range = {
            type: "statement-mention",
            title: node.title,
            start: target.text.length
          };
          target.text += node.image;
          range.stop = target.text.length - 1;
          target.ranges.push(range);
        }
      }
    }
    // function onStatementMentionByNumberExit(node) {
    //   const target = (currentHeading) ? currentHeading : currentStatement;
    //   let match = statementMentionByNumberPattern.exec(node.image);
    //   if (match) {
    //     node.argumentTitle = match[1];
    //     node.statementNumber = match[2];
    //     if (node.image[node.image.length - 1] == " ") {
    //       node.trailingWhitespace = ' ';
    //     } else {
    //       node.trailingWhitespace = '';
    //     }
    //     if (target) {
    //       let range = { type: 'statement-mention-by-number', argumentTitle: node.title, statementNumber: node.statementNumber, start: target.text.length };
    //       target.text += node.image;
    //       range.stop = target.text.length - 1;
    //       target.ranges.push(range);
    //     }
    //   }
    // }
    function updateArgument(response, title) {
      if (title) {
        currentArgument = response.arguments[title];
      }
      if (!title || !currentArgument) {
        currentArgument = new Argument();
        if (!title) {
          currentArgument.title = getUniqueTitle();
        } else {
          currentArgument.title = title;
        }
        response.arguments[currentArgument.title] = currentArgument;
      }
      currentStatementOrArgument = currentArgument;
      return currentArgument;
    }
    function addTags(tags, object) {
      if (!object.tags) {
        object.tags = [];
      }
      object.tags = _.union(object.tags, tags);
    }
    function onArgumentDefinitionEntry(request, response, node, parentNode) {
      let match = argumentDefinitionPattern.exec(node.image);
      if (match != null) {
        let title = match[1];
        updateArgument(response, title);
        currentStatement = new Statement();
        currentStatement.startLine = node.startLine;
        currentStatement.endLine = node.endLine;
        currentStatement.startColumn = node.startColumn;
        currentStatement.endColumn = node.endColumn;
        currentStatement.role = "argument-description";
        if (currentSection) {
          currentStatement.section = currentSection;
        }
        currentArgument.descriptions.push(currentStatement);
        node.title = title;
        parentNode.argument = currentArgument;
      }
    }
    function onArgumentDefinitionExit(request, response, node) {
      if (node.argument) {
        let description = _.last(node.argument.descriptions);
        if (description.tags) {
          addTags(description.tags, node.argument);
        }
      }
      currentStatement = null;
      currentArgument = null;
    }
    function onArgumentReferenceEntry(request, response, node, parentNode) {
      let match = argumentReferencePattern.exec(node.image);
      if (match != null) {
        let title = match[1];
        updateArgument(response, title);
        node.title = title;
        parentNode.argument = currentArgument;
      }
    }
    function onArgumentReferenceExit() {
      currentStatement = null;
      currentArgument = null;
    }
    function onArgumentMentionExit(request, response, node) {
      const target = currentHeading ? currentHeading : currentStatement;
      let match = argumentMentionPattern.exec(node.image);
      if (match) {
        node.title = match[1];
        if (node.image[node.image.length - 1] == " ") {
          node.trailingWhitespace = " ";
        } else {
          node.trailingWhitespace = "";
        }
        if (target) {
          let range = {
            type: "argument-mention",
            title: node.title,
            start: target.text.length
          };
          target.text += node.image;
          range.stop = target.text.length - 1;
          target.ranges.push(range);
        }
      }
    }
    function onFreestyleTextEntry(request, response, node) {
      const target = currentHeading ? currentHeading : currentStatement;
      node.text = "";
      for (let child of node.children) {
        if (tokenMatcher(child, ArgdownLexer.EscapedChar)) {
          node.text += child.image.substring(1, child.image.length);
        } else {
          node.text += child.image;
        }
      }
      if (target) {
        target.text += node.text;
      }
    }
    function onLinkEntry(request, response, node) {
      const target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      let match = linkPattern.exec(node.image);
      let linkRange = { type: "link", start: target.text.length };
      node.url = match[2];
      node.text = match[1];
      target.text += node.text;
      linkRange.stop = target.text.length - 1;
      linkRange.url = node.url;
      target.ranges.push(linkRange);
      if (node.image[node.image.length - 1] == " ") {
        target.text += " ";
        node.trailingWhitespace = " ";
      } else {
        node.trailingWhitespace = "";
      }
    }
    function onTagEntry(request, response, node) {
      const target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      let match = tagPattern.exec(node.image);
      let tag = match[1] || match[2];
      const settings = $.getSettings(request);
      node.tag = tag;
      if (!settings.removeTagsFromText) {
        let tagRange = { type: "tag", start: target.text.length };
        node.text = node.image;
        target.text += node.text;
        tagRange.stop = target.text.length - 1;
        tagRange.tag = node.tag;
        target.ranges.push(tagRange);
      }
      target.tags = target.tags || [];
      let tags = target.tags;
      if (target.tags.indexOf(tag) == -1) {
        tags.push(tag);
      }
      if (response.tags.indexOf(tag) == -1) {
        response.tags.push(tag);
      }
    }
    function onBoldEntry() {
      const target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      let boldRange = { type: "bold", start: target.text.length };
      rangesStack.push(boldRange);
      target.ranges.push(boldRange);
    }
    function onBoldExit(request, response, node) {
      const target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      let boldEnd = _.last(node.children);
      if (boldEnd.image[boldEnd.image.length - 1] == " ") {
        target.text += " ";
        node.trailingWhitespace = " ";
      } else {
        node.trailingWhitespace = "";
      }
      let range = _.last(rangesStack);
      range.stop = target.text.length - 1;
      rangesStack.pop();
    }
    function onItalicEntry() {
      const target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      let italicRange = { type: "italic", start: target.text.length };
      rangesStack.push(italicRange);
      target.ranges.push(italicRange);
    }
    function onItalicExit(request, response, node) {
      const target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      let italicEnd = _.last(node.children);
      if (italicEnd.image[italicEnd.image.length - 1] == " ") {
        target.text += " ";
        node.trailingWhitespace = " ";
      } else {
        node.trailingWhitespace = "";
      }
      let range = _.last(rangesStack);
      range.stop = target.text.length - 1;
      rangesStack.pop();
    }

    function onRelationExit(request, response, node) {
      let relation = node.relation;
      let contentNode = node.children[1];
      let content = contentNode.argument || contentNode.statement;
      let target = getRelationTarget(response, content);
      if (relation) {
        if (relation.from) {
          relation.to = target;
        } else {
          relation.from = target;
        }
        let relationExists = false;
        for (let existingRelation of relation.from.relations) {
          if (
            relation.to == existingRelation.to &&
            relation.type == existingRelation.type
          ) {
            relationExists = true;
            break;
          } else if (
            relation.type == "contradictory" &&
            relation.type == existingRelation.type &&
            relation.from == existingRelation.to &&
            relation.to == existingRelation.from
          ) {
            relationExists = true;
            break;
          }
        }
        if (!relationExists) {
          response.relations.push(relation);
          relation.from.relations.push(relation);
          relation.to.relations.push(relation);
        }
      }
    }
    function onIncomingSupportEntry(request, response, node) {
      let target = _.last(parentsStack);
      currentRelation = new Relation("support", node);
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onIncomingAttackEntry(request, response, node) {
      let target = _.last(parentsStack);
      currentRelation = new Relation("attack");
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onOutgoingSupportEntry(request, response, node) {
      let target = _.last(parentsStack);
      currentRelation = new Relation("support");
      currentRelation.to = target;
      node.relation = currentRelation;
    }
    function onOutgoingAttackEntry(request, response, node) {
      let target = _.last(parentsStack);
      currentRelation = new Relation("attack");
      currentRelation.to = target;
      node.relation = currentRelation;
    }
    function onContradictionEntry(request, response, node) {
      let target = _.last(parentsStack);
      currentRelation = new Relation("contradictory");
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onIncomingUndercutEntry(request, response, node) {
      let target = _.last(parentsStack);
      currentRelation = new Relation("undercut");
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onOutgoingUndercutEntry(request, response, node) {
      let target = _.last(parentsStack);
      currentRelation = new Relation("undercut");
      currentRelation.to = target;
      node.relation = currentRelation;
    }

    function onRelationsEntry(request, response) {
      parentsStack.push(
        getRelationTarget(response, currentStatementOrArgument)
      );
    }
    function getRelationTarget(response, statementOrArgument) {
      let target = statementOrArgument;
      if (statementOrArgument instanceof Statement) {
        if (!statementOrArgument.title)
          statementOrArgument.title = getUniqueTitle();
        target = getEquivalenceClass(response, statementOrArgument.title);
      }
      return target;
    }
    function onRelationsExit() {
      currentRelation = null;
      parentsStack.pop();
    }

    function onArgumentEntry(request, response, node, parentNode, childIndex) {
      let argument = null;
      if (childIndex > 0) {
        let precedingSibling = parentNode.children[childIndex - 1];
        if (
          precedingSibling.name == "argumentReference" ||
          precedingSibling.name == "argumentDefinition"
        ) {
          argument = precedingSibling.argument;
        } else if (tokenMatcher(precedingSibling, ArgdownLexer.Emptyline)) {
          precedingSibling = parentNode.children[childIndex - 2];
          if (
            precedingSibling.name == "argumentReference" ||
            precedingSibling.name == "argumentDefinition"
          ) {
            argument = precedingSibling.argument;
          }
        }
      }
      if (!argument) {
        argument = updateArgument(response);
      }
      if (currentSection) {
        argument.section = currentSection;
      }
      //if there is a previous reconstruction, overwrite it
      if (argument.pcs.length > 0) {
        //TODO: throw error
        argument.pcs = [];
      }
      node.argument = argument;
      currentArgumentReconstruction = argument;
    }
    function onArgumentExit(request, response, node) {
      const argument = node.argument;
      argument.startLine = node.startLine;
      argument.startColumn = node.startColumn;
      argument.endLine = node.endLine;
      argument.endColumn = node.endColumn;
      currentStatement = null;
      currentArgument = null;
      currentArgumentReconstruction = null;
    }
    function onArgumentStatementExit(
      request,
      response,
      node,
      parentNode,
      childIndex
    ) {
      if (node.children.length > 1) {
        //first node is ArgdownLexer.ArgumentStatementStart
        let statementNode = node.children[1];
        let statement = statementNode.statement;
        let ec = getEquivalenceClass(response, statement.title);
        statement.role = "premise";
        if (childIndex > 0) {
          let precedingSibling = parentNode.children[childIndex - 1];
          if (precedingSibling.name == "inference") {
            statement.role = "conclusion";
            ec.isUsedAsConclusion = true;
            statement.inference = precedingSibling.inference;
          }
        }
        if (statement.role == "premise") {
          ec.isUsedAsPremise = true;
        }
        currentArgumentReconstruction.pcs.push(statement);
        node.statement = statement;
        node.statementNr = currentArgumentReconstruction.pcs.length;
      }
    }
    function onInferenceEntry(request, response, node) {
      currentInference = {
        inferenceRules: [],
        metaData: {},
        startLine: node.startLine,
        startColumn: node.startColumn,
        endLine: node.endLine,
        endColumn: node.endColumn
      };
      node.inference = currentInference;
    }
    function onInferenceRulesExit(request, response, node) {
      for (let child of node.children) {
        if (child.name == "freestyleText") {
          currentInference.inferenceRules.push(child.text.trim());
        }
      }
    }
    function onMetadataStatementExit(request, response, node) {
      let key = node.children[0].text;
      let value = null;
      if (node.children.length == 2) {
        value = node.children[1].text;
      } else {
        value = [];
        for (let i = 1; i < node.children.length; i++) {
          value.push(node.children[i].text);
        }
      }
      currentInference.metaData[key] = value;
    }
    function onHeadingEntry(request, response, node) {
      currentHeading = node;
      currentHeading.text = "";
      currentHeading.ranges = [];
    }
    function onHeadingExit(request, response, node) {
      let headingStart = node.children[0];
      currentHeading.level = headingStart.image.length - 1; //number of # - whitespace
      sectionCounter++;
      let sectionId = "s" + sectionCounter;
      let newSection = new Section(
        sectionId,
        currentHeading.level,
        currentHeading.text,
        currentHeading.ranges,
        currentHeading.tags
      );
      newSection.startLine = node.startLine;
      newSection.startColumn = node.startColumn;
      newSection.heading = currentHeading;

      if (newSection.level > 1 && currentSection) {
        let parentSection = currentSection;
        while (
          parentSection.parent &&
          parentSection.level >= newSection.level
        ) {
          parentSection = parentSection.parent;
        }
        parentSection.children.push(newSection);
        newSection.parent = parentSection;
      } else {
        response.sections.push(newSection);
      }
      currentSection = newSection;
      currentHeading.section = newSection;
      currentHeading = null;
    }

    this.argdownListeners = {
      argdownEntry: onArgdownEntry,
      headingEntry: onHeadingEntry,
      headingExit: onHeadingExit,
      statementEntry: onStatementEntry,
      statementExit: onStatementExit,
      argumentEntry: onArgumentEntry,
      argumentExist: onArgumentExit,
      argumentStatementExit: onArgumentStatementExit,
      inferenceEntry: onInferenceEntry,
      inferenceRulesExit: onInferenceRulesExit,
      metadataStatementExit: onMetadataStatementExit,
      StatementDefinitionEntry: onStatementDefinitionEntry,
      // StatementDefinitionByNumberEntry : onStatementDefinitionByNumberEntry,
      StatementReferenceEntry: onStatementReferenceEntry,
      // StatementReferenceByNumberEntry : onStatementReferenceByNumberEntry,
      StatementMentionExit: onStatementMentionExit,
      // StatementMentionByNumberExit : onStatementMentionByNumberExit,
      ArgumentDefinitionEntry: onArgumentDefinitionEntry,
      ArgumentReferenceEntry: onArgumentReferenceEntry,
      ArgumentMentionExit: onArgumentMentionExit,
      argumentDefinitionExit: onArgumentDefinitionExit,
      argumentReferenceExit: onArgumentReferenceExit,
      incomingSupportEntry: onIncomingSupportEntry,
      incomingSupportExit: onRelationExit,
      incomingAttackEntry: onIncomingAttackEntry,
      incomingAttackExit: onRelationExit,
      outgoingSupportEntry: onOutgoingSupportEntry,
      outgoingSupportExit: onRelationExit,
      outgoingAttackEntry: onOutgoingAttackEntry,
      outgoingAttackExit: onRelationExit,
      contradictionEntry: onContradictionEntry,
      contradictionExit: onRelationExit,
      outgoingUndercutEntry: onOutgoingUndercutEntry,
      outgoingUndercutExit: onRelationExit,
      incomingUndercutEntry: onIncomingUndercutEntry,
      incomingUndercutExit: onRelationExit,
      relationsEntry: onRelationsEntry,
      relationsExit: onRelationsExit,
      freestyleTextEntry: onFreestyleTextEntry,
      italicEntry: onItalicEntry,
      italicExit: onItalicExit,
      boldEntry: onBoldEntry,
      boldExit: onBoldExit,
      LinkEntry: onLinkEntry,
      TagEntry: onTagEntry
    };
  }
  logRelations(response) {
    for (let statementKey of Object.keys(response.statements)) {
      let statement = response.statements[statementKey];
      for (let relation of statement.relations) {
        if (relation.from == statement) {
          console.log(
            "Relation from: " +
              relation.from.title +
              " to: " +
              relation.to.title +
              " type: " +
              relation.type
          );
        }
      }
    }
    for (let argumentKey of Object.keys(response.arguments)) {
      let argument = response.arguments[argumentKey];
      for (let relation of argument.relations) {
        if (relation.from == argument) {
          console.log(
            "Relation from: " +
              relation.from.title +
              " to: " +
              relation.to.title +
              " type: " +
              relation.type
          );
        }
      }
    }
  }
}
module.exports = {
  ModelPlugin: ModelPlugin,
  RelationObjectTypes: RelationObjectTypes
};
