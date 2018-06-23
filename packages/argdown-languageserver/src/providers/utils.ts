import { Location, Range } from "vscode-languageserver";
import {
  IAstNode,
  IEquivalenceClass,
  IArgument,
  ArgdownTypes,
  isRuleNode,
  HasLocation
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

export const generateMarkdownForStatement = (
  eqClass: IEquivalenceClass
): string => {
  let relationsStr = "";
  if (eqClass.relations) {
    for (let relation of eqClass.relations) {
      const isOutgoing = relation.to === eqClass;
      const relationSymbol = getRelationSymbol(
        relation.relationType,
        isOutgoing
      );
      const relationPartner = isOutgoing ? relation.from : relation.to;
      const relationPartnerStr =
        relationPartner.type === ArgdownTypes.ARGUMENT
          ? `<${relationPartner.title}>`
          : `[${relationPartner.title}]`;
      relationsStr += `
  ${relationSymbol} ${relationPartnerStr}`;
    }
  }
  return `
\`\`\`argdown
[${eqClass.title}]: ${IEquivalenceClass.getCanonicalMemberText(
    eqClass
  )}${relationsStr}
\`\`\``;
};
export const generateMarkdownForArgument = (argument: any): string => {
  let relationsStr = "";
  if (argument.relations) {
    for (let relation of argument.relations) {
      const isOutgoing = relation.to === argument;
      const relationSymbol = getRelationSymbol(
        relation.relationType,
        isOutgoing
      );
      const relationPartner = isOutgoing ? relation.from : relation.to;
      const relationPartnerStr =
        relationPartner.type === ArgdownTypes.ARGUMENT
          ? `<${relationPartner.title}>`
          : `[${relationPartner.title}]`;
      relationsStr += `
  ${relationSymbol} ${relationPartnerStr}`;
    }
  }
  let desc = IArgument.getCanonicalDescriptionText(argument);
  if (desc) {
    desc = ":" + desc;
  }
  return `
\`\`\`argdown
<${argument.title}>${desc}${relationsStr}
\`\`\``;
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
export const walkTree = (
  node: IAstNode,
  parentNode: any,
  childIndex: number,
  callback: (node: any, parentNode: any, childIndex: number) => void
) => {
  callback(node, parentNode, childIndex);
  if (isRuleNode(node) && node.children && node.children.length > 0) {
    for (var i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      walkTree(child, node, i, callback);
    }
  }
};
