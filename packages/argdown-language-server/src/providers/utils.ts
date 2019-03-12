import { Location, Range } from "vscode-languageserver";
import {
  IAstNode,
  IEquivalenceClass,
  IArgument,
  ArgdownTypes,
  isRuleNode,
  HasLocation,
  IArgdownResponse,
  RelationMember,
  IRelation,
  RelationType,
  deriveImplicitRelations
} from "@argdown/core";

export const createLocation = (uri: string, el: HasLocation): Location => {
  return Location.create(uri, createRange(el));
};

/**
 *  Creates a range from an Argdown node, statement or argument
 * Chevrotain locations have to be transformed to VS Code locations
 **/
export const createRange = (el: HasLocation): Range => {
  return Range.create(
    (el.startLine || 1) - 1,
    (el.startColumn || 1) - 1,
    (el.endLine || 1) - 1,
    el.endColumn || 1
  );
};
const relationSymbols: { [key: string]: string } = {
  support: "+",
  attack: "-",
  entails: "+",
  contrary: "-",
  undercut: "_",
  contradictory: "><"
};
const getRelationSymbol = (
  relationType: string,
  isOutgoing: boolean
): string => {
  let symbol = relationSymbols[relationType];
  if (relationType !== "contradictory") {
    if (isOutgoing) {
      symbol = `<${symbol}`;
    } else {
      symbol = `${symbol}>`;
    }
  }
  return symbol;
};
const generateArgdownRelationString = function(
  relationType: RelationType,
  isOutgoing: boolean,
  title: string,
  type: ArgdownTypes
) {
  let relationPartnerStr =
    type === ArgdownTypes.ARGUMENT ? `<${title}>` : `[${title}]`;
  const relationSymbol = getRelationSymbol(relationType, isOutgoing);
  return `
  ${relationSymbol} ${relationPartnerStr}`;
};
const generateArgdownRelationStringFromRelation = function(
  relation: IRelation,
  member: RelationMember
) {
  const isOutgoing = relation.to === member;
  const otherRelationMember = isOutgoing ? relation.from! : relation.to!;
  return generateArgdownRelationString(
    relation.relationType,
    isOutgoing,
    otherRelationMember.title!,
    otherRelationMember.type
  );
};
const caveat = `

// Additional implicit relations may be derivable from relation combination.`;
export const generateMarkdownForStatement = (
  eqClass: IEquivalenceClass,
  response: IArgdownResponse
): string => {
  const explicitRelations = eqClass.relations || [];
  const implicitRelations = deriveImplicitRelations(
    eqClass,
    response.statements!,
    response.arguments!
  );
  let explicitRelationsStr = "";
  for (let relation of explicitRelations) {
    if (relation.to!.type === ArgdownTypes.INFERENCE) {
      //we can not refer directly to inferences, only to arguments (undercuts will only appear in implicit relations)
      continue;
    }
    explicitRelationsStr += generateArgdownRelationStringFromRelation(
      relation,
      eqClass
    );
  }
  let implicitRelationsStr = "";
  if (implicitRelations.length > 0) {
    implicitRelationsStr = "\n  // implicit relations derived from pcs";
    for (let relation of implicitRelations) {
      if (relation.to!.type === ArgdownTypes.INFERENCE) {
        //we can not refer directly to inferences, only to arguments (undercuts will only appear in implicit relations)
        continue;
      }

      implicitRelationsStr += generateArgdownRelationStringFromRelation(
        relation,
        eqClass
      );
    }
  }

  let text = IEquivalenceClass.getCanonicalMemberText(eqClass);
  if (text) {
    text = ": " + text;
  } else {
    text = "";
  }
  return `
\`\`\`argdown
[${eqClass.title}]${text}${explicitRelationsStr}${implicitRelationsStr}${caveat}
\`\`\``;
};

export const generateMarkdownForArgument = (
  argument: IArgument,
  response: IArgdownResponse
): string => {
  const explicitRelations = argument.relations || [];
  const implicitRelations = deriveImplicitRelations(
    argument,
    response.statements!,
    response.arguments!
  );
  let explicitRelationsStr = "";
  for (let relation of explicitRelations) {
    if (relation.to!.type === ArgdownTypes.INFERENCE) {
      //we can not refer directly to inferences, only to arguments (undercuts will only appear in implicit relations)
      continue;
    }
    explicitRelationsStr += generateArgdownRelationStringFromRelation(
      relation,
      argument
    );
  }
  let implicitRelationsStr = "";
  if (implicitRelations.length > 0) {
    implicitRelationsStr = " \n // implicit relations derived from pcs";
    for (let relation of implicitRelations) {
      if (relation.to!.type === ArgdownTypes.INFERENCE) {
        //we can not refer directly to inferences, only to arguments (undercuts will only appear in implicit relations)
        continue;
      }

      implicitRelationsStr += generateArgdownRelationStringFromRelation(
        relation,
        argument
      );
    }
  }
  let desc = IArgument.getCanonicalMemberText(argument);
  if (desc) {
    desc = ": " + desc;
  } else {
    desc = "";
  }
  return `
\`\`\`argdown
<${
    argument.title
  }>${desc}${explicitRelationsStr}${implicitRelationsStr}${caveat}
\`\`\``;
};

export const walkTree = (
  node: IAstNode,
  parentNode: any,
  childIndex: number,
  callback: (node: any, parentNode: any, childIndex: number) => void
) => {
  if (node) {
    callback(node, parentNode, childIndex);
    if (isRuleNode(node) && node.children && node.children.length > 0) {
      for (var i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        walkTree(child, node, i, callback);
      }
    }
  }
};
