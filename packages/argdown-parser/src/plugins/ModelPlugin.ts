import * as _ from "lodash";
import { tokenMatcher, IToken } from "chevrotain";
import * as argdownLexer from "./../lexer";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IArgdownResponse } from "../IArgdownResponse";
import { IAstNodeHandler, IRuleNodeHandler, ITokenNodeHandler } from "../ArgdownTreeWalker";
import { ArgdownPluginError } from "../ArgdownPluginError";
import {
  IEquivalenceClass,
  ArgdownTypes,
  IConclusion,
  IArgument,
  RelationType,
  IStatement,
  IInference,
  IRange,
  IRelation,
  IRuleNode,
  ISection,
  RelationMember,
  StatementRole,
  ITokenNode,
  IArgumentStatement,
  RangeType
} from "../model/model";
import { createEquivalenceClass, isReconstructed, isRuleNode, isTokenNode } from "../model/model-utils";
import { RuleNames } from "../RuleNames";
import { TokenNames } from "../TokenNames";

export interface IModelPluginSettings {
  removeTagsFromText?: boolean;
}
export interface IModelPluginRequest extends IArgdownRequest {
  model?: IModelPluginSettings;
}
const isModelRequest = (r: IArgdownRequest): r is IModelPluginRequest => {
  return (<IModelPluginRequest>r).model !== undefined;
};
const defaultSettings = {
  removeTagsFromText: false
};
/**
 * The ModelPlugin builds the basic data model from the abstract syntax tree (AST) in the [[IArgdownResponse.ast]] response property that is provided by the [[ParserPlugin]].
 * This includes the following response object properties:
 *
 *  - [[IArgdownResponse.statements]]
 *  - [[IArgdownResponse.arguments]]
 *  - [[IArgdownResponse.relations]]
 *  - [[IArgdownResponse.sections]]
 *
 * Most of the other plugins depend on the data produced by this plugin. Whenever possible plugins should use the
 * data processed by this plugin instead of working with the AST nodes directly.
 *
 * depends on data from: [[ParserPlugin]]
 */
export class ModelPlugin implements IArgdownPlugin {
  name: string = "ModelPlugin";
  defaults: IModelPluginSettings = {};
  ruleListeners: { [eventId: string]: IRuleNodeHandler };
  tokenListeners: { [eventId: string]: ITokenNodeHandler };
  getSettings = (request: IArgdownRequest) => {
    const r = <IModelPluginRequest>request;
    if (!r.model) {
      r.model = {};
    }
    return r.model;
  };
  prepare: IRequestHandler = (request, response, logger) => {
    _.defaultsDeep(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response, logger) => {
    if (!response.ast) {
      throw new ArgdownPluginError(this.name, "No AST field in response.");
    }
    if (!response.statements) {
      throw new ArgdownPluginError(this.name, "No statements field in response.");
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(this.name, "No arguments field in response.");
    }
    if (!response.relations) {
      throw new ArgdownPluginError(this.name, "No relations field in response.");
    }
    for (let relation of response.relations) {
      if (!relation.from) {
        throw new ArgdownPluginError(this.name, "Relation without source.");
      }
      if (!relation.to) {
        throw new ArgdownPluginError(this.name, "Relation without target.");
      }
      const fromIsReconstructedArgument =
        relation.from.type === ArgdownTypes.ARGUMENT && isReconstructed(relation.from);
      const toIsReconstructedArgument = relation.to.type === ArgdownTypes.ARGUMENT && isReconstructed(relation.to);

      // For reconstructed arguments: change outgoing argument relations
      // to outgoing relations of the main conclusion, removing duplicates
      if (fromIsReconstructedArgument) {
        //change relation.from to point to the argument's conclusion
        let argument = <IArgument>relation.from;

        //remove from argument
        let index = _.indexOf(argument.relations, relation);
        argument.relations!.splice(index, 1);

        let conclusionStatement = argument.pcs![argument.pcs!.length - 1];
        let equivalenceClass = response.statements[conclusionStatement.title!];
        //change to relation of main conclusion
        relation.from = equivalenceClass;

        //check if this relation already exists
        let relationExists = false;
        for (let existingRelation of equivalenceClass.relations!) {
          if (relation.to == existingRelation.to && relation.type === existingRelation.type) {
            relationExists = true;
            existingRelation.occurrences.push(...relation.occurrences)
            break;
          }
        }
        if (!relationExists) {
          equivalenceClass.relations!.push(relation);
        } else {
          //remove relation from target
          let index = _.indexOf(relation.to.relations, relation);
          relation.to.relations!.splice(index, 1);
          //remove relation from relations
          index = _.indexOf(response.relations, relation);
          response.relations.splice(index, 1);
        }
      }
      // For reconstructed arguments: change incoming undercut relations
      // to incoming relations of last inference, removing duplicates
      if (toIsReconstructedArgument) {
        let argument = <IArgument>relation.to;
        let inference = (<IConclusion>_.last(argument.pcs)!).inference!;
        relation.to = inference;
        // remove relation from argument
        let index = _.indexOf(argument.relations, relation);
        argument.relations!.splice(index, 1);

        let relationExists = false;
        for (let existingRelation of inference.relations!) {
          if (relation.from == existingRelation.from && relation.type === existingRelation.type) {
            relationExists = true;
            existingRelation.occurrences.push(...relation.occurrences);
            break;
          }
        }
        if (!relationExists) {
          inference.relations!.push(relation);
        } else {
          //remove relation from source
          let index = _.indexOf(relation.from.relations, relation);
          relation.from.relations!.splice(index, 1);
          //remove relation from relations
          index = _.indexOf(response.relations, relation);
          response.relations.splice(index, 1);
        }
      }
    }
    //Change dialectical types of statement-to-statement relations to semantic types
    //Doing this in a separate loop makes it easier to identify duplicates in the previous loop,
    //even though it is less efficient.
    for (let relation of response.relations) {
      if (relation.from!.type === ArgdownTypes.ARGUMENT || relation.to!.type === ArgdownTypes.ARGUMENT) {
        continue;
      }
      if (relation.relationType === RelationType.SUPPORT) {
        relation.relationType = RelationType.ENTAILS;
      } else if (relation.relationType === RelationType.ATTACK) {
        relation.relationType = RelationType.CONTRARY;
      }
    }
    return response;
  };
  constructor(config?: IModelPluginSettings) {
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

    let currentStatement: IStatement | null = null;
    let currentRelationParent: IArgument | IStatement | IInference | null = null;
    let currentArgument: IArgument | null = null;
    let currentPCS: IArgument | null = null;
    let currentInference: IInference | null = null;
    let rangesStack: IRange[] = [];
    let relationParentsStack: RelationMember[] = [];
    let currentRelation: IRelation | null = null;
    let currentHeading: IRuleNode | null = null;
    let currentSection: ISection | null = null;
    let sectionCounter = 0;
    const getRelationMember = (
      response: IArgdownResponse,
      relationParent: IStatement | IArgument | IInference
    ): IArgument | IEquivalenceClass | IInference => {
      let target = relationParent;
      if (relationParent.type === ArgdownTypes.STATEMENT) {
        if (!relationParent.title) relationParent.title = getUniqueTitle();
        return getEquivalenceClass(response.statements!, relationParent.title);
      } else {
        return <IArgument | IInference>target;
      }
    };
    const updateArgument = (argumentsDict: { [title: string]: IArgument }, title?: string): IArgument => {
      if (title) {
        currentArgument = argumentsDict[title];
      }
      if (!title || !currentArgument) {
        currentArgument = {
          type: ArgdownTypes.ARGUMENT,
          title,
          relations: [],
          descriptions: [],
          pcs: []
        };
        if (!title) {
          currentArgument.title = getUniqueTitle();
        } else {
          currentArgument.title = title;
        }
        argumentsDict[currentArgument.title] = currentArgument;
      }
      currentRelationParent = currentArgument;
      return currentArgument;
    };
    const addTags = (tags: string[], object: { tags?: string[] }): void => {
      if (!object.tags) {
        object.tags = [];
      }
      object.tags = _.union(object.tags, tags);
    };
    const onRelationExit: IRuleNodeHandler = (request, response, node, {}, {}, logger) => {
      let relation = node.relation;
      if (!node.children || node.children.length < 2) {
        throw new ArgdownPluginError(this.name, "Relation without children.");
      }
      let contentNode = node.children[1] as IRuleNode;
      let content = contentNode.argument || contentNode.statement;
      if (!content) {
        throw new ArgdownPluginError(this.name, "Relation member not found.");
      }
      let target = getRelationMember(response, content);
      if (relation) {
        if (relation.from) {
          relation.to = target;
        } else {
          relation.from = target;
        }
        let relationExists = false;
        const relationSource = relation.from;
        for (let existingRelation of relationSource.relations!) {
          if (relation.to === existingRelation.to && relation.type === existingRelation.type) {
            relationExists = true;
            existingRelation.occurrences.push(...relation.occurrences);
            break;
          } else if (
            relation.relationType === RelationType.CONTRADICTORY &&
            relation.relationType === existingRelation.relationType &&
            relation.from === existingRelation.to &&
            relation.to === existingRelation.from
          ) {
            relationExists = true;
            existingRelation.occurrences.push(...relation.occurrences);
            break;
          }
        }
        if (!relationExists) {
          if (!relation.from || !relation.to) {
            throw new ArgdownPluginError(this.name, "Missing relation source or target.");
          }
          response.relations!.push(relation);
          relation.from.relations!.push(relation);
          relation.to!.relations!.push(relation);
        }
      }
    };

    this.tokenListeners = {
      [TokenNames.STATEMENT_DEFINITION]: ({}, {}, token, parentNode) => {
        let match = statementDefinitionPattern.exec(token.image);
        if (match != null && currentStatement) {
          currentStatement.title = match[1];
          token.title = currentStatement.title;
          parentNode!.statement = currentStatement;
        }
      },
      [TokenNames.STATEMENT_REFERENCE]: (request, response, token, parentNode) => {
        let match = statementReferencePattern.exec(token.image);
        if (match != null && currentStatement) {
          currentStatement.title = match[1];
          currentStatement.isReference = true;
          token.title = currentStatement.title;
          parentNode!.statement = currentStatement;
        }
      },
      [TokenNames.STATEMENT_MENTION]: ({}, {}, token) => {
        let match = statementMentionPattern.exec(token.image);
        if (match) {
          token.title = match[1];
          if (token.image[token.image.length - 1] == " ") {
            token.trailingWhitespace = " ";
          } else {
            token.trailingWhitespace = "";
          }
          const target = currentHeading || currentStatement;
          if (target) {
            const previousText = target.text || "";
            const newText = previousText + token.image;
            target.text = newText;
            if (!target.ranges) {
              target.ranges = [];
            }
            let range: IRange = {
              type: RangeType.STATEMENT_MENTION,
              title: token.title,
              start: previousText.length,
              stop: newText.length - 1
            };
            target.ranges.push(range);
          }
        }
      },
      [TokenNames.ARGUMENT_DEFINITION]: ({}, response, token, parentNode) => {
        let match = argumentDefinitionPattern.exec(token.image);
        if (match != null) {
          let title = match[1];
          updateArgument(response.arguments!, title);
          currentStatement = {
            type: ArgdownTypes.STATEMENT,
            text: ""
          };
          currentStatement.startLine = token.startLine;
          currentStatement.endLine = token.endLine;
          currentStatement.startColumn = token.startColumn;
          currentStatement.endColumn = token.endColumn;
          currentStatement.role = StatementRole.ARGUMENT_DESCRIPTION;
          if (currentSection) {
            currentStatement.section = currentSection;
          }
          currentArgument!.descriptions.push(currentStatement);
          if(currentArgument!.section === undefined){
            currentArgument!.section = currentStatement.section;
          }
          token.title = title;
          parentNode!.argument = currentArgument!;
        }
      },
      [TokenNames.ARGUMENT_REFERENCE]: (request, response, token, parentNode) => {
        let match = argumentReferencePattern.exec(token.image);
        if (match != null) {
          let title = match[1];
          updateArgument(response.arguments!, title);
          token.title = title;
          parentNode!.argument = currentArgument!;
        }
      },
      [TokenNames.ARGUMENT_MENTION]: ({}, {}, token) => {
        const target = currentHeading ? currentHeading : currentStatement;
        let match = argumentMentionPattern.exec(token.image);
        if (match) {
          token.title = match[1];
          if (token.image[token.image.length - 1] == " ") {
            token.trailingWhitespace = " ";
          } else {
            token.trailingWhitespace = "";
          }
          if (target) {
            const previousText = target.text || "";
            const newText = previousText + token.image;
            target.text = newText;
            if (!target.ranges) {
              target.ranges = [];
            }
            let range: IRange = {
              type: RangeType.ARGUMENT_MENTION,
              title: token.title,
              start: previousText.length,
              stop: newText.length - 1
            };
            target.ranges.push(range);
          }
        }
      },
      [TokenNames.LINK]: ({}, {}, token, {}, {}, logger) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        let match = linkPattern.exec(token.image);
        if (!match || match.length < 3) {
          throw new ArgdownPluginError(this.name, "Could not match link.");
        }
        token.url = match[2];
        token.text = match[1];
        const oldText = target.text || "";
        const newText = oldText + token.text;
        target.text = newText;
        let linkRange = <IRange>{ type: "link", start: oldText.length, stop: newText.length - 1 };
        linkRange.url = token.url;
        if (!target.ranges) {
          target.ranges = [];
        }
        target.ranges.push(linkRange);
        if (token.image[token.image.length - 1] == " ") {
          target.text += " ";
          token.trailingWhitespace = " ";
        } else {
          token.trailingWhitespace = "";
        }
      },
      [TokenNames.TAG]: (request, response, token, {}, {}, logger) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        let match = tagPattern.exec(token.image);
        if (!match || match.length < 2) {
          throw new ArgdownPluginError(this.name, "Could not parse tag.");
        }
        let tag = match[1] || match[2];
        const settings = $.getSettings(request);
        token.tag = tag;
        if (!settings.removeTagsFromText) {
          const oldText = target.text || "";
          const newText = oldText + token.image;
          let tagRange: IRange = { type: RangeType.TAG, start: oldText.length, stop: newText.length - 1 };
          token.text = token.image;
          target.text = newText;
          tagRange.tag = token.tag;
          if (!target.ranges) {
            target.ranges = [];
          }
          target.ranges.push(tagRange);
        }
        target.tags = target.tags || [];
        let tags = target.tags;
        if (target.tags.indexOf(tag) == -1) {
          tags.push(tag);
        }
        if (response.tags!.indexOf(tag) == -1) {
          response.tags!.push(tag);
        }
      }
    };
    this.ruleListeners = {
      [RuleNames.ARGDOWN + "Entry"]: ({}, response) => {
        response.statements = {};
        response.arguments = {};
        response.sections = [];
        response.relations = [];
        response.tags = [];
        uniqueTitleCounter = 0;
        currentHeading = null;
        currentSection = null;
        currentRelationParent = null;
        currentPCS = null;
        currentInference = null;
        currentArgument = null;
        rangesStack = [];
        relationParentsStack = [];
        currentRelation = null;
        sectionCounter = 0;
      },
      [RuleNames.HEADING + "Entry"]: ({}, {}, node) => {
        currentHeading = node;
        currentHeading.text = "";
        currentHeading.ranges = [];
      },
      [RuleNames.HEADING + "Exit"]: ({}, response, node, {}, {}, logger) => {
        if (!currentHeading) {
          throw new ArgdownPluginError(this.name, "Missing heading.");
        }
        if (node.children) {
          let headingStart = node.children[0] as ITokenNode;
          currentHeading.level = headingStart.image.length - 1; //number of # - whitespace
          sectionCounter++;
          let sectionId = "s" + sectionCounter;
          let newSection: ISection = {
            type: ArgdownTypes.SECTION,
            id: sectionId,
            level: currentHeading.level,
            title: currentHeading.text || "",
            children: []
          };
          newSection.tags = currentHeading.tags;
          newSection.ranges = currentHeading.ranges;
          newSection.startLine = node.startLine;
          newSection.startColumn = node.startColumn;
          newSection.heading = currentHeading;
          newSection.metaData = currentHeading.metaData;

          if (newSection.level > 1 && currentSection) {
            let parentSection = currentSection;
            while (parentSection.parent && parentSection.level >= newSection.level) {
              parentSection = parentSection.parent;
            }
            parentSection.children.push(newSection);
            newSection.parent = parentSection;
          } else {
            response.sections!.push(newSection);
          }
          currentSection = newSection;
          currentHeading.section = newSection;
          currentHeading = null;
        }
      },
      [RuleNames.STATEMENT + "Entry"]: ({}, {}, node, parentNode) => {
        currentStatement = {
          type: ArgdownTypes.STATEMENT
        };
        if (parentNode!.name === "argdown") {
          currentStatement.role = StatementRole.TOP_LEVEL_STATEMENT;
        } else if (currentRelation) {
          currentStatement.role = StatementRole.RELATION_STATEMENT;
        }
        currentRelationParent = currentStatement;
        node.statement = currentStatement;
      },
      [RuleNames.STATEMENT + "Exit"]: ({}, response, node) => {
        let statement = node.statement;
        if (!statement) {
          return;
        }
        statement.startLine = node.startLine;
        statement.startColumn = node.startColumn;
        statement.endLine = node.endLine;
        statement.endColumn = node.endColumn;
        statement.metaData = node.metaData;
        if (!statement.title || statement.title == "") {
          statement.title = getUniqueTitle();
        }
        let equivalenceClass = getEquivalenceClass(response.statements!, statement.title);
        node.equivalenceClass = equivalenceClass;
        if (statement.tags) {
          addTags(statement.tags, equivalenceClass);
        }
        if (statement.metaData) {
          equivalenceClass.metaData = _.merge(equivalenceClass.metaData, statement.metaData);
        }
        if (currentSection) {
          statement.section = currentSection;
        }
        equivalenceClass.members.push(statement);
        if(equivalenceClass.section === undefined && !statement.isReference){
          equivalenceClass.section = statement.section;
        }
        if (statement.role === StatementRole.TOP_LEVEL_STATEMENT) {
          equivalenceClass.isUsedAsTopLevelStatement = true; //members are used outside of argument reconstructions (not as premise or conclusion)
        } else if (statement.role === StatementRole.RELATION_STATEMENT) {
          equivalenceClass.isUsedAsRelationStatement = true;
        }
        currentStatement = null;
      },
      [RuleNames.PCS + "Entry"]: (request, response, node, parentNode, childIndex, logger) => {
        let argument = null;
        if (childIndex !== null && childIndex > 0 && parentNode && parentNode.children) {
          const precedingSibling = parentNode.children[childIndex - 1];
          if (
            isRuleNode(precedingSibling) &&
            (precedingSibling.name === RuleNames.ARGUMENT_REFERENCE ||
              precedingSibling.name === RuleNames.ARGUMENT_DEFINITION)
          ) {
            argument = precedingSibling.argument;
          } else if (isTokenNode(precedingSibling) && tokenMatcher(precedingSibling, argdownLexer.Emptyline)) {
            const precedingSibling2 = parentNode.children[childIndex - 2];
            if (
              isRuleNode(precedingSibling2) &&
              (precedingSibling2.name === RuleNames.ARGUMENT_REFERENCE ||
                precedingSibling2.name === RuleNames.ARGUMENT_DEFINITION)
            ) {
              argument = precedingSibling2.argument;
            }
          }
        }
        if (!argument) {
          argument = updateArgument(response.arguments!);
        }
        if (currentSection) {
          argument.section = currentSection;
        }
        //if there is a previous reconstruction, overwrite it
        if (!argument.pcs) {
          argument.pcs = [];
        }
        if (argument.pcs.length > 0) {
          logger.log("warning", "[ModelPlugin]: Overwriting duplicate pcs: " + argument.title);
          argument.pcs = [];
        }
        node.argument = argument;
        currentPCS = argument;
      },
      [RuleNames.PCS + "Exit"]: ({}, response, node, {}, {}, logger) => {
        const argument = node.argument;
        if (!argument) {
          throw new ArgdownPluginError(this.name, "Missing argument.");
        }
        if(argument.pcs.length == 0){
          throw new ArgdownPluginError(this.name, "Missing argument statements.");
        }
        const lastStatement = argument.pcs[argument.pcs.length - 1];
        if(lastStatement.role === StatementRole.PRELIMINARY_CONCLUSION){
          lastStatement.role = StatementRole.MAIN_CONCLUSION;
          const ec = response.statements![lastStatement.title!];
          ec.isUsedAsMainConclusion = true;
          if(!ec.members.find(s => s.role === StatementRole.PRELIMINARY_CONCLUSION)){
            ec.isUsedAsPreliminaryConclusion = false;
          }
        }else{
          throw new ArgdownPluginError(this.name, "Missing main conclusions.");
        }
        argument.startLine = node.startLine;
        argument.startColumn = node.startColumn;
        argument.endLine = node.endLine;
        argument.endColumn = node.endColumn;
        currentStatement = null;
        currentArgument = null;
        currentPCS = null;
      },
      [RuleNames.ARGUMENT_STATEMENT + "Exit"]: (request, response, node, parentNode, childIndex, logger) => {
        if (!currentPCS) {
          throw new ArgdownPluginError(this.name, "Missing argument reconstruction.");
        }
        if (node.children && node.children.length > 1) {
          //first node is ArgumentStatementStart
          let statementNode = node.children[1] as IRuleNode;
          let statement = statementNode.statement;
          if (!statement) {
            throw new ArgdownPluginError(this.name, "Missing statement.");
          }
          let ec = getEquivalenceClass(response.statements!, statement.title!);
          statement.role = StatementRole.PREMISE;
          (<IArgumentStatement>statement).argumentTitle = currentPCS.title;
          if (childIndex !== null && childIndex > 0 && parentNode && parentNode.children) {
            let precedingSibling = parentNode.children[childIndex - 1] as IRuleNode;
            if (precedingSibling.name === RuleNames.INFERENCE) {
              // We first assume that this is a preliminary conclusion
              // If we exit the argument we will change the role of the last statement in the pcs
              statement.role = StatementRole.PRELIMINARY_CONCLUSION;
              const conclusion = <IConclusion>statement;
              ec.isUsedAsPreliminaryConclusion = true;
              conclusion.inference = precedingSibling.inference;
              conclusion.inference!.conclusionIndex = currentPCS.pcs!.length;
              conclusion.inference!.argumentTitle = currentPCS.title;
            }
          }
          if (statement.role == StatementRole.PREMISE) {
            ec.isUsedAsPremise = true;
          }
          currentPCS.pcs!.push(statement);
          node.statement = statement;
          node.statementNr = currentPCS.pcs!.length;
        }
      },
      [RuleNames.INFERENCE + "Entry"]: ({}, {}, node) => {
        currentInference = {
          type: ArgdownTypes.INFERENCE,
          relations: []
        };
        currentInference.relations = [];
        currentInference.inferenceRules = [];
        currentInference.metaData = {};
        currentInference.startLine = node.startLine;
        currentInference.startColumn = node.startColumn;
        currentInference.endLine = node.endLine;
        currentInference.endColumn = node.endColumn;
        node.inference = currentInference!;
        currentRelationParent = currentInference;
        relationParentsStack.push(currentInference!);
      },
      [RuleNames.INFERENCE_RULES + "Exit"]: (request, response, node) => {
        if (node.children && currentInference !== null) {
          for (let child of node.children) {
            if (isRuleNode(child) && child.name == RuleNames.FREESTYLE_TEXT) {
              if (!currentInference.inferenceRules) {
                currentInference.inferenceRules = [];
              }
              const text = child.text ? child.text.trim() : "";
              currentInference.inferenceRules.push(text);
            }
          }
        }
      },
      [RuleNames.ARGUMENT_DEFINITION + "Exit"]: ({}, {}, node) => {
        if (node.argument) {
          let description = _.last(node.argument.descriptions);
          if (description && description.tags) {
            addTags(description.tags, node.argument);
          }
          node.argument.metaData = _.merge(node.argument.metaData, node.metaData);
        }
        currentStatement = null;
        currentArgument = null;
      },
      [RuleNames.ARGUMENT_REFERENCE + "Exit"]: (request, response, node) => {
        const ruleNode = node as IRuleNode;
        if (ruleNode.argument) {
          ruleNode.argument.metaData = _.merge(ruleNode.argument.metaData, node.metaData);
        }
        currentStatement = null;
        currentArgument = null;
      },
      [RuleNames.INCOMING_SUPPORT + "Entry"]: (request, response, node) => {
        const target = _.last(relationParentsStack);
        currentRelation = { type: ArgdownTypes.RELATION, relationType: RelationType.SUPPORT, occurrences: [node] };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.INCOMING_SUPPORT + "Exit"]: onRelationExit,
      [RuleNames.INCOMING_ATTACK + "Entry"]: (request, response, node) => {
        const target = _.last(relationParentsStack);
        currentRelation = { type: ArgdownTypes.RELATION, relationType: RelationType.ATTACK, occurrences: [node] };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.INCOMING_ATTACK + "Exit"]: onRelationExit,
      [RuleNames.OUTGOING_SUPPORT + "Entry"]: (request, response, node) => {
        const target = _.last(relationParentsStack);
        currentRelation = { type: ArgdownTypes.RELATION, relationType: RelationType.SUPPORT, occurrences: [node] };
        currentRelation.to = target;
        node.relation = currentRelation;
      },
      [RuleNames.OUTGOING_SUPPORT + "Exit"]: onRelationExit,
      [RuleNames.OUTGOING_ATTACK + "Entry"]: ({}, {}, node) => {
        const target = _.last(relationParentsStack);
        currentRelation = { type: ArgdownTypes.RELATION, relationType: RelationType.ATTACK, occurrences: [node] };
        currentRelation.to = target;
        node.relation = currentRelation;
      },
      [RuleNames.OUTGOING_ATTACK + "Exit"]: onRelationExit,
      [RuleNames.CONTRADICTION + "Entry"]: (request, response, node) => {
        const target = _.last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.CONTRADICTORY,
          occurrences: [node]
        };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.CONTRADICTION + "Exit"]: onRelationExit,
      [RuleNames.OUTGOING_UNDERCUT + "Entry"]: ({}, {}, node) => {
        const target = _.last(relationParentsStack);
        currentRelation = { type: ArgdownTypes.RELATION, relationType: RelationType.UNDERCUT, occurrences: [node] };
        if (currentRelationParent && currentRelationParent.type === ArgdownTypes.STATEMENT) {
          //const inference = (<Statement>currentRelationParent).inference!; // this is not working as statement has no inference yet
          if (currentInference) {
            currentRelation.to = currentInference;
          } else {
            throw new ArgdownPluginError(this.name, "Missing inference.");
          }
        } else {
          currentRelation.to = target;
        }
        node.relation = currentRelation;
      },
      [RuleNames.OUTGOING_UNDERCUT + "Exit"]: onRelationExit,
      [RuleNames.INCOMING_UNDERCUT + "Entry"]: ({}, {}, node) => {
        const target = _.last(relationParentsStack);
        currentRelation = { type: ArgdownTypes.RELATION, relationType: RelationType.UNDERCUT, occurrences: [node] };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.INCOMING_UNDERCUT + "Exit"]: onRelationExit,
      [RuleNames.RELATIONS + "Entry"]: ({}, response, {}, {}, {}, logger) => {
        if (!currentRelationParent) {
          throw new ArgdownPluginError(this.name, "Parent of relation missing.");
        }
        relationParentsStack.push(getRelationMember(response, currentRelationParent));
      },
      [RuleNames.RELATIONS + "Exit"]: () => {
        currentRelation = null;
        relationParentsStack.pop();
      },
      [RuleNames.FREESTYLE_TEXT + "Entry"]: (request, response, node) => {
        const target = currentHeading ? currentHeading : currentStatement;
        node.text = "";
        if (node.children) {
          for (let child of node.children) {
            if (isTokenNode(child) && child.image !== undefined) {
              if (tokenMatcher(child, argdownLexer.EscapedChar)) {
                node.text += child.image.substring(1, child.image.length);
              } else {
                node.text += child.image;
              }
            }
          }
        }
        if (target) {
          target.text = target.text || "";
          target.text += node.text;
        }
      },
      [RuleNames.ITALIC + "Entry"]: () => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        const startPos = target.text ? target.text.length : 0;
        let italicRange = { type: RangeType.ITALIC, start: startPos, stop: startPos };
        rangesStack.push(italicRange);
        if (!target.ranges) {
          target.ranges = [];
        }
        target.ranges.push(italicRange);
      },
      [RuleNames.ITALIC + "Exit"]: ({}, {}, node) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        let italicEnd = _.last(node.children) as ITokenNode;
        if (italicEnd.image[italicEnd.image.length - 1] == " ") {
          target.text += " ";
          node.trailingWhitespace = " ";
        } else {
          node.trailingWhitespace = "";
        }
        let range = _.last(rangesStack);
        if (range) {
          range.stop = target.text ? target.text.length - 1 : 0;
          rangesStack.pop();
        }
      },
      [RuleNames.BOLD + "Entry"]: () => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        const text = target.text || "";
        let boldRange: IRange = { type: RangeType.BOLD, start: text.length, stop: text.length };
        rangesStack.push(boldRange);
        if (!target.ranges) {
          target.ranges = [];
        }
        target.ranges.push(boldRange);
      },
      [RuleNames.BOLD + "Exit"]: (request, response, node) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        const ruleNode = node as IRuleNode;
        let boldEnd = _.last(ruleNode.children) as ITokenNode;
        if (boldEnd && boldEnd.image[boldEnd.image.length - 1] == " ") {
          target.text += " ";
          ruleNode.trailingWhitespace = " ";
        } else {
          ruleNode.trailingWhitespace = "";
        }
        let range = _.last(rangesStack);
        if (range) {
          range.stop = target.text ? target.text.length - 1 : 0;
          rangesStack.pop();
        }
      }
    };
  }
}
const getEquivalenceClass = (statements: { [title: string]: IEquivalenceClass }, title: string): IEquivalenceClass => {
  let ec = null;
  ec = statements[title];
  if (!ec) {
    ec = createEquivalenceClass(title);
    statements[title] = ec;
  }
  return ec;
};
