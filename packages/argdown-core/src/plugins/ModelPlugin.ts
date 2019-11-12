import { tokenMatcher } from "chevrotain";
import * as argdownLexer from "./../lexer";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { IRuleNodeHandler, ITokenNodeHandler } from "../ArgdownTreeWalker";
import { ArgdownPluginError, checkResponseFields } from "../ArgdownPluginError";
import { IArgdownRequest, IArgdownResponse } from "../index";
import defaultsDeep from "lodash.defaultsdeep";
import last from "lodash.last";
import union from "lodash.union";
import merge from "lodash.merge";
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
  IPCSStatement,
  RangeType,
  isReconstructed,
  isRuleNode,
  isTokenNode,
  IArgumentDescription
} from "../model/model";
import { RuleNames } from "../RuleNames";
import { TokenNames } from "../TokenNames";
import {
  stringToClassName,
  isObject,
  mergeDefaults,
  ensure,
  DefaultSettings
} from "../utils";
import { other } from "../utils";
import { ISpecialCharacterDictionary, specialChars } from "./specialChars";

export interface ITagData {
  tag: string;
  cssClass?: string;
  color?: string;
  occurrenceIndex?: number;
  priority?: number;
}
export enum InterpretationModes {
  LOOSE = "loose",
  STRICT = "strict"
}

export interface IModelPluginSettings {
  mode?: InterpretationModes;
  removeTagsFromText?: boolean;
  transformArgumentRelations?: boolean;
  specialChars?: ISpecialCharacterDictionary;
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[ModelPlugin]]
     **/
    model?: IModelPluginSettings;
  }
  interface IArgdownResponse {
    /**
     * A dictionary of all arguments defined in the Argdown input.
     * The keys are the argument titles. The values are [[Argument]] objects.
     *
     * Provided by the [[ModelPlugin]]
     */
    arguments?: { [title: string]: IArgument };
    /**
     * A dictionary of all statement equivalence classes defined in the Argdown input.
     * The keys are statement titles. The values are [[EquivalenceClass]] objects.
     *
     * The actual [[Statement]] objects are stored in the [[EquivalenceClass.members]] array.
     *
     * Provided by the [[ModelPlugin]]
     */
    statements?: { [title: string]: IEquivalenceClass };
    /**
     * A list of all relations defined in the Argdown input.
     *
     * Provided by the [[ModelPlugin]]
     */
    relations?: IRelation[];
    /**
     * A tree structure of all sections defined in the Argdown input.
     *
     * Provided by the [[ModelPlugin]]
     */
    sections?: ISection[];
    maxSectionLevel?: number;
    /**
     * All tags used augmented by additional data
     *
     * Provided by the [[ModelPlugin]]
     *
     * Color is provided by the [[ColorPlugin]]
     */
    tags?: { [tagName: string]: ITagData };
  }
}
const defaultSettings: DefaultSettings<IModelPluginSettings> = {
  mode: InterpretationModes.LOOSE,
  removeTagsFromText: false,
  transformArgumentRelations: true,
  specialChars: ensure.object<ISpecialCharacterDictionary>(specialChars)
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
    if (!isObject(request.model)) {
      request.model = {};
    }
    return request.model;
  };
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  /**
   * Transforms outgoing relations of arguments with an assigned pcs into outgoing relations of the pcs's main conclusion.
   * Transforms incoming undercut relations of arguments with an assigned pcs into undercut relations of the pcs's last inference.
   */
  transformArgumentRelations = (response: IArgdownResponse) => {
    const newRelations: IRelation[] = [];
    for (let relation of response.relations!) {
      let addRelation = true;
      if (!relation.from) {
        throw new ArgdownPluginError(
          this.name,
          "missing-relation-source",
          "Relation without source."
        );
      }
      if (!relation.to) {
        throw new ArgdownPluginError(
          this.name,
          "missing-relation-target",
          "Relation without target."
        );
      }
      const fromIsReconstructedArgument =
        relation.from.type === ArgdownTypes.ARGUMENT &&
        isReconstructed(relation.from);
      const toIsReconstructedArgument =
        relation.to.type === ArgdownTypes.ARGUMENT &&
        isReconstructed(relation.to);

      // For reconstructed arguments: change outgoing argument relations
      // to outgoing relations of the main conclusion, removing duplicates
      if (fromIsReconstructedArgument) {
        //change relation.from to point to the argument's conclusion
        let argument = <IArgument>relation.from;

        //remove from argument
        this.removeRelationFromSource(relation);

        let conclusionStatement = argument.pcs![argument.pcs!.length - 1];
        let equivalenceClass = response.statements![conclusionStatement.title!];
        //change to relation of main conclusion
        relation.from = equivalenceClass;

        //check if this relation already exists
        let relationExists = false;
        for (let existingRelation of equivalenceClass.relations!) {
          if (
            relation.to == existingRelation.to &&
            relation.relationType === existingRelation.relationType
          ) {
            relationExists = true;
            existingRelation.occurrences.push(...relation.occurrences);
            break;
          }
        }
        if (!relationExists) {
          equivalenceClass.relations!.push(relation);
        } else {
          //remove relation from target
          this.removeRelationFromTarget(relation);
          addRelation = false;
        }
      }
      // For reconstructed arguments: change incoming undercut relations
      // to incoming relations of last inference, removing duplicates
      if (
        toIsReconstructedArgument &&
        relation.relationType === RelationType.UNDERCUT
      ) {
        let argument = <IArgument>relation.to;
        let inference = (<IConclusion>last(argument.pcs)!).inference!;
        relation.to = inference;
        // remove relation from argument
        this.removeRelationFromTarget(relation);

        let relationExists = false;
        for (let existingRelation of inference.relations!) {
          if (
            relation.from == existingRelation.from &&
            relation.relationType === existingRelation.relationType
          ) {
            relationExists = true;
            existingRelation.occurrences.push(...relation.occurrences);
            break;
          }
        }
        if (!relationExists) {
          inference.relations!.push(relation);
        } else {
          //remove relation from source
          this.removeRelationFromSource(relation);
          //remove relation from relations
          addRelation = false;
        }
      }
      if (addRelation) {
        newRelations.push(relation);
      }
    }
    response.relations = newRelations;
  };
  /**
   * Change dialectical types of statement-to-statement relations to semantic types.
   * Support relations become entails relations.
   * Attack relations become contrary relations.
   * Equivalent contrary relations are merged (e.g. [A] - [B] and [B] - [A]).
   */
  transformStatementRelations = (response: IArgdownResponse) => {
    const newRelations: IRelation[] = [];
    for (let relation of response.relations!) {
      let addRelation = true;
      const isS2SRelation =
        relation.from!.type === ArgdownTypes.EQUIVALENCE_CLASS &&
        relation.to!.type === ArgdownTypes.EQUIVALENCE_CLASS;
      if (isS2SRelation) {
        if (relation.relationType === RelationType.SUPPORT) {
          relation.relationType = RelationType.ENTAILS;
        } else if (relation.relationType === RelationType.ATTACK) {
          const relationExists = relation.from!.relations!.find(r => {
            return (
              r.relationType === RelationType.CONTRARY &&
              ((r.from === relation.from && r.to === relation.to) ||
                (r.from === relation.to && r.to === relation.from))
            );
          });
          if (relationExists !== undefined) {
            this.removeRelationFromSource(relation);
            this.removeRelationFromTarget(relation);
            addRelation = false;
          } else {
            relation.relationType = RelationType.CONTRARY;
          }
        }
      }
      if (addRelation) {
        newRelations.push(relation);
      }
    }
    response.relations = newRelations;
  };
  removeRelationFromSource = (relation: IRelation) => {
    let indexSource = relation.from!.relations!.indexOf(relation);
    relation.from!.relations!.splice(indexSource, 1);
  };
  removeRelationFromTarget = (relation: IRelation) => {
    //remove relation from target
    let indexTarget = relation.to!.relations!.indexOf(relation);
    relation.to!.relations!.splice(indexTarget, 1);
  };
  /**
   * Removes redundant ec2a attack relations that can be inferred from
   * existing ec2ec attack/contrary/contradiction relations
   */
  removeRedundantEC2ARelations = (response: IArgdownResponse) => {
    const newRelations: IRelation[] = [];
    for (let relation of response.relations!) {
      if (
        relation.from!.type !== ArgdownTypes.EQUIVALENCE_CLASS ||
        relation.relationType !== RelationType.ATTACK ||
        relation.to!.type !== ArgdownTypes.ARGUMENT
      ) {
        newRelations.push(relation);
        continue;
      }
      const argument = relation.to! as IArgument;
      if (!argument.pcs) {
        newRelations.push(relation);
        continue;
      }
      const ec = relation.from as IEquivalenceClass;
      const ec2ecRelation = ec.relations!.find(
        otherRelation =>
          other(otherRelation, ec).type === ArgdownTypes.EQUIVALENCE_CLASS &&
          ((otherRelation.relationType === RelationType.ATTACK &&
            otherRelation.from === ec) ||
            otherRelation.relationType === RelationType.CONTRADICTORY ||
            otherRelation.relationType === RelationType.CONTRARY) &&
          !!argument.pcs.find(
            s =>
              s.title === other(otherRelation, ec)!.title &&
              s.role === StatementRole.PREMISE
          )
      );
      if (ec2ecRelation) {
        // relation is redundant, we have to remove it
        this.removeRelationFromSource(relation);
        this.removeRelationFromTarget(relation);
        ec2ecRelation.occurrences.push(...relation.occurrences);
        continue;
      } else {
        newRelations.push(relation);
        continue;
      }
    }
    response.relations = newRelations;
  };
  assignSectionOfFirstMemberIfWithoutSection = (
    node: IArgument | IEquivalenceClass
  ) => {
    if (!node.section && node.members && node.members.length > 0) {
      node.section = node.members[0].section;
    }
  };
  run: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, [
      "ast",
      "statements",
      "arguments",
      "relations"
    ]);

    // If an equivalence class has no definition as a member, we use the first reference's section
    for (let ec of Object.values(response.statements!)) {
      this.assignSectionOfFirstMemberIfWithoutSection(ec);
    }
    // If an argument has neither a pcs nor a description, we use the first reference's section
    for (let argument of Object.values(response.arguments!)) {
      this.assignSectionOfFirstMemberIfWithoutSection(argument);
    }
    const settings = this.getSettings(request);
    if (settings.transformArgumentRelations) {
      this.transformArgumentRelations(response);
    }
    if (settings.mode === InterpretationModes.STRICT) {
      this.transformStatementRelations(response);
    }
    this.removeRedundantEC2ARelations(response);
    return response;
  };
  constructor(config?: IModelPluginSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
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
    let currentRelationParent:
      | IArgument
      | IStatement
      | IInference
      | null = null;
    let currentArgument: IArgument | null = null;
    let currentPCS: IArgument | null = null;
    let currentInference: IInference | null = null;
    let rangesStack: IRange[] = [];
    let relationParentsStack: RelationMember[] = [];
    let currentRelation: IRelation | null = null;
    let currentHeading: IRuleNode | null = null;
    let currentSection: ISection | null = null;
    let sectionCounter = 0;
    let tagCounter = 0;
    const getRelationMember = (
      response: IArgdownResponse,
      relationParent: IStatement | IInference | IArgument
    ): IArgument | IEquivalenceClass | IInference => {
      let target = relationParent;
      if (relationParent.type === ArgdownTypes.STATEMENT) {
        if (!relationParent.title) relationParent.title = getUniqueTitle();
        if (relationParent.role === StatementRole.ARGUMENT_DESCRIPTION) {
          return getArgument(response.arguments!, relationParent.title);
        } else {
          return getEquivalenceClass(
            response.statements!,
            relationParent.title
          );
        }
      } else {
        return <IArgument | IInference>target;
      }
    };
    const getArgument = (
      argumentsDict: { [title: string]: IArgument },
      title?: string
    ): IArgument => {
      if (title) {
        currentArgument = argumentsDict[title];
      }
      if (!title || !currentArgument) {
        currentArgument = {
          type: ArgdownTypes.ARGUMENT,
          relations: [],
          members: [],
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
    const addTags = (newTags: string[], object: { tags?: string[] }): void => {
      if (!object.tags) {
        object.tags = [];
      }
      object.tags = union(object.tags, newTags);
    };
    const onRelationExit: IRuleNodeHandler = (_request, response, node) => {
      let relation = node.relation;
      if (!node.children || node.children.length < 2) {
        throw new ArgdownPluginError(
          this.name,
          "missing-ast-node-children",
          "Relation without children."
        );
      }
      let contentNode = node.children[1] as IRuleNode;
      let content = contentNode.argument || contentNode.statement;
      if (!content) {
        throw new ArgdownPluginError(
          this.name,
          "missing-ast-node-relation-member",
          "Relation member not found."
        );
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
          if (
            relation.to === existingRelation.to &&
            relation.relationType === existingRelation.relationType
          ) {
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
            throw new ArgdownPluginError(
              this.name,
              "missing-relation-member",
              "Missing relation source or target."
            );
          }
          response.relations!.push(relation);
          relation.from.relations!.push(relation);
          relation.to!.relations!.push(relation);
        }
      }
    };

    this.tokenListeners = {
      [TokenNames.STATEMENT_DEFINITION]: (
        _request,
        _response,
        token,
        parentNode
      ) => {
        let match = statementDefinitionPattern.exec(token.image);
        if (match != null && currentStatement) {
          currentStatement.title = match[1];
          token.title = currentStatement.title;
          parentNode!.statement = currentStatement;
        }
      },
      [TokenNames.STATEMENT_REFERENCE]: (
        _request,
        _response,
        token,
        parentNode
      ) => {
        let match = statementReferencePattern.exec(token.image);
        if (match != null && currentStatement) {
          currentStatement.title = match[1];
          currentStatement.isReference = true;
          token.title = currentStatement.title;
          parentNode!.statement = currentStatement;
        }
      },
      [TokenNames.STATEMENT_MENTION]: (_request, _response, token) => {
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
      [TokenNames.ARGUMENT_REFERENCE]: (_request, _response, token) => {
        let match = argumentReferencePattern.exec(token.image);
        if (match != null && currentStatement) {
          let title = match[1];
          currentStatement.title = title;
          currentStatement.isReference = true;
          token.title = title;
        }
      },
      [TokenNames.ARGUMENT_DEFINITION]: (_request, _response, token) => {
        let match = argumentDefinitionPattern.exec(token.image);
        if (match != null && currentStatement) {
          let title = match[1];
          currentStatement.title = title;
          token.title = title;
        }
      },
      [TokenNames.ARGUMENT_MENTION]: (_request, _response, token) => {
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
      [TokenNames.LINK]: (_request, _response, token) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        let match = linkPattern.exec(token.image);
        if (!match || match.length < 3) {
          throw new ArgdownPluginError(
            this.name,
            "invalid-link",
            "Could not match link."
          );
        }
        token.url = match[2];
        token.text = match[1];
        const oldText = target.text || "";
        const newText = oldText + token.text;
        target.text = newText;
        let linkRange = <IRange>{
          type: "link",
          start: oldText.length,
          stop: newText.length - 1
        };
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
      [TokenNames.TAG]: (request, response, token) => {
        const target = currentHeading || currentStatement;
        if (!target) {
          return;
        }
        let match = tagPattern.exec(token.image);
        if (!match || match.length < 2) {
          throw new ArgdownPluginError(
            this.name,
            "invalid-tag",
            "Could not parse tag."
          );
        }
        let tag = match[1] || match[2];
        const settings = $.getSettings(request);
        token.tag = tag;
        if (!settings.removeTagsFromText) {
          const oldText = target.text || "";
          const newText = oldText + token.image;
          let tagRange: IRange = {
            type: RangeType.TAG,
            start: oldText.length,
            stop: newText.length - 1
          };
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
        if (target.tags.indexOf(tag) === -1) {
          tags.push(tag);
        }
        let tagData = response.tags![tag];
        if (!tagData) {
          tagData = {
            tag: tag,
            cssClass: stringToClassName("tag-" + tag),
            occurrenceIndex: tagCounter
          };
          response.tags![tag] = tagData;
          tagCounter++;
        }
      },
      [TokenNames.NEWLINE]: (
        _request,
        _response,
        _token,
        parentNode,
        childIndex
      ) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        const oldText = target.text || "";
        // Add empty space if not already preceded by one and if this is not the end of the string.
        if (
          childIndex !== parentNode!.children!.length - 1 &&
          oldText.charAt(oldText.length - 1) !== " "
        ) {
          target.text = oldText + " ";
        }
      }
    };
    this.ruleListeners = {
      [RuleNames.ARGDOWN + "Entry"]: (_request, response) => {
        response.statements = {};
        response.arguments = {};
        response.sections = [];
        response.relations = [];
        response.tags = {};
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
        tagCounter = 0;
      },
      [RuleNames.ARGDOWN + "Exit"]: (_req, _resp, token) => {
        const lastChild =
          token.children && token.children.length > 0
            ? token.children[token.children.length - 1]
            : null;
        while (currentSection && lastChild && lastChild.endLine) {
          currentSection.endLine = lastChild.endLine;
          currentSection.endOffset = lastChild.endOffset;
          currentSection.endColumn = lastChild.endColumn;
          currentSection = currentSection.parent || null;
        }
      },
      [RuleNames.HEADING + "Entry"]: (_request, _response, node) => {
        currentHeading = node;
        currentHeading.text = "";
        currentHeading.ranges = [];
      },
      [RuleNames.HEADING + "Exit"]: (request, response, node) => {
        if (!currentHeading) {
          throw new ArgdownPluginError(
            this.name,
            "missing-heading",
            "Missing heading."
          );
        }
        if (node.children) {
          let headingStart = node.children[0] as ITokenNode;
          currentHeading.level = headingStart.image.length - 1; //number of # - whitespace
          sectionCounter++;
          let sectionId = "s" + sectionCounter;
          const title = currentHeading.text ? currentHeading.text.trim() : "";
          let newSection: ISection = {
            type: ArgdownTypes.SECTION,
            id: sectionId,
            level: currentHeading.level,
            title: title,
            children: []
          };
          if (
            !response.maxSectionLevel ||
            currentHeading.level > response.maxSectionLevel
          ) {
            response.maxSectionLevel = currentHeading.level;
          }
          newSection.tags = currentHeading.tags;
          newSection.ranges = currentHeading.ranges;
          newSection.startLine = node.startLine;
          newSection.startColumn = node.startColumn;
          newSection.heading = currentHeading;
          newSection.data = currentHeading.data;
          const groupSettings = request.group;
          if (newSection.data) {
            if (
              newSection.data.isGroup !== undefined &&
              (!groupSettings || !groupSettings.ignoreIsGroup)
            ) {
              newSection.isGroup = newSection.data.isGroup;
            }
            if (
              newSection.data.isClosed !== undefined &&
              (!groupSettings || !groupSettings.ignoreIsClosed)
            ) {
              newSection.isClosed = newSection.data.isClosed;
            }
          }
          if (groupSettings && isObject(groupSettings.sections)) {
            const groupConfig = groupSettings.sections[newSection.title!];
            if (groupConfig) {
              newSection.isGroup = groupConfig.isGroup;
              newSection.isClosed = groupConfig.isClosed;
            } else {
              newSection.isGroup =
                newSection.isGroup === undefined ? false : newSection.isGroup;
            }
          }

          if (!currentSection) {
            response.sections!.push(newSection);
          } else {
            let previous: ISection | null = currentSection;
            while (previous && previous.level >= newSection.level) {
              previous.endOffset = newSection.startOffset! - 1;
              previous.endLine = newSection.startLine! - 1;
              previous.endColumn = 0;
              previous = previous.parent || null;
            }
            if (previous && previous.level < newSection.level) {
              previous.children.push(newSection);
              newSection.parent = previous;
            } else {
              response.sections!.push(newSection);
            }
          }
          currentSection = newSection;
          currentHeading.section = newSection;
          currentHeading = null;
        }
      },
      [RuleNames.STATEMENT + "Entry"]: (
        _request,
        _response,
        node,
        parentNode
      ) => {
        currentStatement = {
          type: ArgdownTypes.STATEMENT
        };
        if (parentNode!.name === "argdown") {
          currentStatement.role = StatementRole.TOP_LEVEL_STATEMENT;
          currentStatement.isTopLevel = true;
        } else if (currentRelation) {
          currentStatement.role = StatementRole.RELATION_STATEMENT;
        }
        currentRelationParent = currentStatement;
        node.statement = currentStatement;
      },
      [RuleNames.STATEMENT + "Exit"]: (_request, response, node) => {
        let statement = node.statement;
        if (!statement) {
          return;
        }
        statement.startLine = node.startLine;
        statement.startColumn = node.startColumn;
        statement.endLine = node.endLine;
        statement.endColumn = node.endColumn;
        statement.data = node.data;
        if (!statement.title || statement.title == "") {
          statement.title = getUniqueTitle();
        }
        let equivalenceClass = getEquivalenceClass(
          response.statements!,
          statement.title
        );
        node.equivalenceClass = equivalenceClass;
        if (statement.tags) {
          addTags(statement.tags, equivalenceClass);
        }
        if (statement.data) {
          equivalenceClass.data = merge(equivalenceClass.data, statement.data);
        }
        if (currentSection) {
          statement.section = currentSection;
        }
        equivalenceClass.members.push(statement);
        const isInGroup =
          statement.data && statement.data.isInGroup !== undefined
            ? statement.data.isInGroup
            : undefined;
        const ecTakesSection =
          isInGroup === true ||
          (!statement.isReference &&
            isInGroup === undefined &&
            equivalenceClass.section === undefined);
        if (ecTakesSection) {
          equivalenceClass.section = statement.section;
        }
        if (statement.role === StatementRole.TOP_LEVEL_STATEMENT) {
          equivalenceClass.isUsedAsTopLevelStatement = true; //members are used outside of argument reconstructions (not as premise or conclusion)
        } else if (statement.role === StatementRole.RELATION_STATEMENT) {
          equivalenceClass.isUsedAsRelationStatement = true;
        }
        currentStatement = null;
      },
      [RuleNames.ARGUMENT + "Entry"]: (
        _request,
        _response,
        node,
        parentNode
      ) => {
        const desc: IArgumentDescription = {
          type: ArgdownTypes.STATEMENT,
          role: StatementRole.ARGUMENT_DESCRIPTION,
          text: ""
        };
        currentStatement = desc;
        desc.startLine = node.startLine;
        desc.endLine = node.endLine;
        desc.startColumn = node.startColumn;
        desc.endColumn = node.endColumn;
        desc.isTopLevel = !parentNode || parentNode.name === RuleNames.ARGDOWN;
        if (currentSection) {
          currentStatement.section = currentSection;
        }
        currentRelationParent = currentStatement;
        node.statement = desc;
      },
      [RuleNames.ARGUMENT + "Exit"]: (_request, response, node) => {
        let desc = node.statement;
        if (!desc) {
          throw new ArgdownPluginError(
            this.name,
            "missing-argument-description",
            "Missing argument description."
          );
        }
        desc.startLine = node.startLine;
        desc.startColumn = node.startColumn;
        desc.endLine = node.endLine;
        desc.endColumn = node.endColumn;
        desc.data = node.data;
        if (!desc.title || desc.title == "") {
          desc.title = getUniqueTitle();
        }
        const argument = getArgument(response.arguments!, desc.title);
        node.argument = argument;
        if (desc.tags) {
          addTags(desc.tags, argument);
        }
        if (desc.data) {
          argument.data = merge(argument.data, desc.data);
        }
        if (currentSection) {
          desc.section = currentSection;
        }
        argument.members.push(<IArgumentDescription>desc);
        const isInGroup =
          desc.data && desc.data.isInGroup !== undefined
            ? desc.data.isInGroup
            : undefined;
        const argumentTakesSection =
          isInGroup === true ||
          (!desc.isReference &&
            isInGroup === undefined &&
            argument.section === undefined);
        if (argumentTakesSection) {
          argument.section = desc.section;
        }
        response.arguments![argument.title!] = argument;
        currentStatement = null;
        currentArgument = null;
      },
      [RuleNames.PCS + "Entry"]: (
        _request,
        response,
        node,
        parentNode,
        childIndex
      ) => {
        let argument = null;
        let argumentDescription: IStatement | undefined;
        if (
          childIndex !== null &&
          childIndex > 0 &&
          parentNode &&
          parentNode.children
        ) {
          let precedingSibling = parentNode.children[childIndex - 1];
          if (
            isRuleNode(precedingSibling) &&
            precedingSibling.name === RuleNames.ARGUMENT
          ) {
            argumentDescription = precedingSibling.statement;
            argument = precedingSibling.argument;
          } else if (
            isTokenNode(precedingSibling) &&
            tokenMatcher(precedingSibling, argdownLexer.Emptyline)
          ) {
            precedingSibling = parentNode.children[childIndex - 2];
            if (
              isRuleNode(precedingSibling) &&
              precedingSibling.name === RuleNames.ARGUMENT
            ) {
              argumentDescription = precedingSibling.statement;
              argument = precedingSibling.argument;
            }
          }
        }
        if (!argument) {
          argument = getArgument(response.arguments!);
        }
        if (currentSection) {
          argument.section = currentSection;
        }
        //if there is a previous reconstruction, throw an error as this might lead to chaos and confusion
        if (argument.pcs.length > 0) {
          throw new ArgdownPluginError(
            this.name,
            "multiple-pcs-assignments",
            `Multiple premise-conclusion-structures assigned to argument <${argument.title}>. You can only assign one pcs per argument.`
          );
        }
        argument.pcs = [];
        // Save pcs in description as well, since there can be more than one pcs
        if (argumentDescription) {
          (<IArgumentDescription>argumentDescription).pcs = argument.pcs;
        }
        node.argument = argument;
        currentPCS = argument;
      },
      [RuleNames.PCS + "Exit"]: (_request, response, node) => {
        const argument = node.argument;
        if (!argument) {
          throw new ArgdownPluginError(
            this.name,
            "missing-argument",
            "Missing argument."
          );
        }
        if (argument.pcs.length == 0) {
          throw new ArgdownPluginError(
            this.name,
            "missing-argument-statements",
            "Missing argument statements."
          );
        }
        const lastStatement = argument.pcs[argument.pcs.length - 1];
        if (lastStatement.role === StatementRole.INTERMEDIARY_CONCLUSION) {
          lastStatement.role = StatementRole.MAIN_CONCLUSION;
          const ec = response.statements![lastStatement.title!];
          ec.isUsedAsMainConclusion = true;
          if (
            !ec.members.find(
              s => s.role === StatementRole.INTERMEDIARY_CONCLUSION
            )
          ) {
            ec.isUsedAsIntermediaryConclusion = false;
          }
        } else {
          throw new ArgdownPluginError(
            this.name,
            "missing-main-conclusion",
            "Missing main conclusions."
          );
        }
        argument.startLine = node.startLine;
        argument.startColumn = node.startColumn;
        argument.endLine = node.endLine;
        argument.endColumn = node.endColumn;
        currentStatement = null;
        currentArgument = null;
        currentPCS = null;
      },
      [RuleNames.PCS_STATEMENT + "Exit"]: (
        _request,
        response,
        node,
        parentNode,
        childIndex
      ) => {
        if (!currentPCS) {
          throw new ArgdownPluginError(
            this.name,
            "missing-argument-reconstruction",
            "Missing argument reconstruction."
          );
        }
        if (node.children && node.children.length > 1) {
          //first node is ArgumentStatementStart
          let statementNode = node.children[1] as IRuleNode;
          let statement: IPCSStatement = <IPCSStatement>statementNode.statement;
          if (!statement) {
            throw new ArgdownPluginError(
              this.name,
              "missing-statement",
              "Missing statement."
            );
          }
          let ec = getEquivalenceClass(response.statements!, statement.title!);
          statement.role = StatementRole.PREMISE;
          statement.argumentTitle = currentPCS.title;
          if (
            childIndex !== null &&
            childIndex > 0 &&
            parentNode &&
            parentNode.children
          ) {
            let precedingSibling = parentNode.children[
              childIndex - 1
            ] as IRuleNode;
            if (precedingSibling.name === RuleNames.INFERENCE) {
              // We first assume that this is a intermediary conclusion
              // If we exit the argument we will change the role of the last statement in the pcs
              statement.role = StatementRole.INTERMEDIARY_CONCLUSION;
              const conclusion = <IConclusion>statement;
              ec.isUsedAsIntermediaryConclusion = true;
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
      [RuleNames.INFERENCE + "Entry"]: (_request, _response, node) => {
        currentInference = {
          type: ArgdownTypes.INFERENCE,
          relations: []
        };
        currentInference.relations = [];
        currentInference.inferenceRules = [];
        currentInference.startLine = node.startLine;
        currentInference.startColumn = node.startColumn;
        currentInference.endLine = node.endLine;
        currentInference.endColumn = node.endColumn;
        node.inference = currentInference!;
        currentRelationParent = currentInference;
        relationParentsStack.push(currentInference!);
      },
      [RuleNames.INFERENCE + "Exit"]: (_request, _response, node) => {
        if (!currentInference) {
          return;
        }
        currentInference.data = node.data;
      },
      [RuleNames.INFERENCE_RULES + "Exit"]: (_request, _response, node) => {
        if (!currentInference) {
          return;
        }
        if (node.children) {
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
      [RuleNames.INCOMING_SUPPORT + "Entry"]: (_request, _response, node) => {
        const target = last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.SUPPORT,
          occurrences: [node]
        };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.INCOMING_SUPPORT + "Exit"]: onRelationExit,
      [RuleNames.INCOMING_ATTACK + "Entry"]: (_request, _response, node) => {
        const target = last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.ATTACK,
          occurrences: [node]
        };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.INCOMING_ATTACK + "Exit"]: onRelationExit,
      [RuleNames.OUTGOING_SUPPORT + "Entry"]: (_request, _response, node) => {
        const target = last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.SUPPORT,
          occurrences: [node]
        };
        currentRelation.to = target;
        node.relation = currentRelation;
      },
      [RuleNames.OUTGOING_SUPPORT + "Exit"]: onRelationExit,
      [RuleNames.OUTGOING_ATTACK + "Entry"]: (_request, _response, node) => {
        const target = last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.ATTACK,
          occurrences: [node]
        };
        currentRelation.to = target;
        node.relation = currentRelation;
      },
      [RuleNames.OUTGOING_ATTACK + "Exit"]: onRelationExit,
      [RuleNames.CONTRADICTION + "Entry"]: (_request, _response, node) => {
        const target = last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.CONTRADICTORY,
          occurrences: [node]
        };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.CONTRADICTION + "Exit"]: onRelationExit,
      [RuleNames.OUTGOING_UNDERCUT + "Entry"]: (_request, _response, node) => {
        const target = last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.UNDERCUT,
          occurrences: [node]
        };
        if (target && target.type === ArgdownTypes.EQUIVALENCE_CLASS) {
          //const inference = (<Statement>currentRelationParent).inference!; // this is not working as statement has no inference yet
          if (currentInference) {
            currentRelation.to = currentInference;
          } else {
            currentRelation.to = target;
            //throw new ArgdownPluginError(this.name, "Missing inference.");
          }
        } else {
          currentRelation.to = target;
        }
        node.relation = currentRelation;
      },
      [RuleNames.OUTGOING_UNDERCUT + "Exit"]: onRelationExit,
      [RuleNames.INCOMING_UNDERCUT + "Entry"]: (_request, _response, node) => {
        const target = last(relationParentsStack);
        currentRelation = {
          type: ArgdownTypes.RELATION,
          relationType: RelationType.UNDERCUT,
          occurrences: [node]
        };
        currentRelation.from = target;
        node.relation = currentRelation;
      },
      [RuleNames.INCOMING_UNDERCUT + "Exit"]: onRelationExit,
      [RuleNames.RELATIONS + "Entry"]: (_request, response) => {
        if (!currentRelationParent) {
          throw new ArgdownPluginError(
            this.name,
            "missing-ast-node-relation-parent",
            "Parent of relation missing."
          );
        }
        relationParentsStack.push(
          getRelationMember(response, currentRelationParent)
        );
      },
      [RuleNames.RELATIONS + "Exit"]: () => {
        currentRelation = null;
        relationParentsStack.pop();
      },
      [RuleNames.FREESTYLE_TEXT + "Entry"]: (request, _response, node) => {
        const target = currentHeading ? currentHeading : currentStatement;
        node.text = "";
        const settings = $.getSettings(request);

        if (node.children) {
          for (let child of node.children) {
            if (isTokenNode(child) && child.image !== undefined) {
              if (tokenMatcher(child, argdownLexer.EscapedChar)) {
                node.text += child.image.substring(1, child.image.length);
              } else if (tokenMatcher(child, argdownLexer.SpecialChar)) {
                const specialCharTrimmed = child.image.trim();
                const specialCharInfo = settings.specialChars![
                  specialCharTrimmed
                ];
                if (specialCharInfo) {
                  const startPos = node.text ? node.text.length : 0;
                  node.text += specialCharInfo.unicode;
                  if (child.image[child.image.length - 1] == " ") {
                    node.text += " ";
                  }
                  let specialCharRange = {
                    type: RangeType.SPECIAL_CHAR,
                    start: startPos,
                    stop: startPos + specialCharInfo.unicode.length
                  };
                  rangesStack.push(specialCharRange);
                } else {
                  node.text += child.image;
                }
              } else {
                node.text += child.image;
              }
            }
          }
        }
        if (target) {
          target.text = target.text || "";
          target.text += node.text;
        }
      },
      [RuleNames.ITALIC + "Entry"]: () => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        const startPos = target.text ? target.text.length : 0;
        let italicRange = {
          type: RangeType.ITALIC,
          start: startPos,
          stop: startPos
        };
        rangesStack.push(italicRange);
        if (!target.ranges) {
          target.ranges = [];
        }
        target.ranges.push(italicRange);
      },
      [RuleNames.ITALIC + "Exit"]: (_request, _response, node) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        let italicEnd = last(node.children) as ITokenNode;
        if (italicEnd.image[italicEnd.image.length - 1] == " ") {
          target.text += " ";
          node.trailingWhitespace = " ";
        } else {
          node.trailingWhitespace = "";
        }
        let range = last(rangesStack);
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
        let boldRange: IRange = {
          type: RangeType.BOLD,
          start: text.length,
          stop: text.length
        };
        rangesStack.push(boldRange);
        if (!target.ranges) {
          target.ranges = [];
        }
        target.ranges.push(boldRange);
      },
      [RuleNames.BOLD + "Exit"]: (_request, _response, node) => {
        const target = currentHeading ? currentHeading : currentStatement;
        if (!target) {
          return;
        }
        const ruleNode = node as IRuleNode;
        let boldEnd = last(ruleNode.children) as ITokenNode;
        if (boldEnd && boldEnd.image[boldEnd.image.length - 1] == " ") {
          target.text += " ";
          ruleNode.trailingWhitespace = " ";
        } else {
          ruleNode.trailingWhitespace = "";
        }
        let range = last(rangesStack);
        if (range) {
          range.stop = target.text ? target.text.length - 1 : 0;
          rangesStack.pop();
        }
      }
    };
  }
}
const getEquivalenceClass = (
  statements: { [title: string]: IEquivalenceClass },
  title: string
): IEquivalenceClass => {
  let ec = null;
  ec = statements[title];
  if (!ec) {
    ec = IEquivalenceClass.create(title);
    statements[title] = ec;
  }
  return ec;
};
