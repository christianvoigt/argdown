import { DocumentSymbol, Range, SymbolKind } from "vscode-languageserver";
// import Uri from "vscode-uri";
import {
  IArgdownPlugin,
  IRuleNodeHandler,
  ArgdownTypes,
  RuleNames,
  IAstNode,
  isRuleNode,
  isTokenNode,
  tokenMatcher,
  ArgumentReference,
  ArgumentDefinition,
  IArgdownResponse,
  IRuleNode
} from "@argdown/core";

declare module "@argdown/core" {
  interface IArgdownResponse {
    documentSymbols?: DocumentSymbol[];
    inputUri?: string;
  }
}

export class ArgdownSymbol extends DocumentSymbol {
  public argdownType?: ArgdownTypes;
  public argdownId?: string;
  public level?: number;
}

const getRange = (node: IAstNode): Range => {
  return {
    start: { line: node.startLine! - 1, character: node.startColumn! - 1 },
    end: { line: node.endLine! - 1, character: node.endColumn! }
  };
};

const addSymbol = (response: IArgdownResponse, symbol: ArgdownSymbol, parentsStack: ArgdownSymbol[]) => {
  if (parentsStack.length === 0) {
    response.documentSymbols!.push(symbol);
  } else {
    const parent = parentsStack[parentsStack.length - 1];
    let children = parent.children;
    if (!children) {
      children = [];
      parent.children = children;
    }
    children.push(symbol);
  }
};

const onRelationEntry = (parentsStack: ArgdownSymbol[], node: IRuleNode, relationSymbol: string) => {
  const symbol = new ArgdownSymbol();
  symbol.kind = SymbolKind.Variable;
  symbol.range = getRange(node);
  symbol.selectionRange = symbol.range;
  let relationMemberTitle = "";
  if (node.children && node.children.length > 1) {
    const secondChild = node.children![1];
    const firstGrandChild =
      isRuleNode(secondChild) && secondChild.children && secondChild.children.length > 0
        ? secondChild.children[0]
        : null;
    if (firstGrandChild) {
      symbol.selectionRange = getRange(firstGrandChild);
    }
    if (isRuleNode(secondChild)) {
      if (secondChild.argument) {
        relationMemberTitle = `<${secondChild.argument.title}>`;
      } else if (secondChild.statement) {
        relationMemberTitle = `[${secondChild.statement!.title}]`;
      }
    }
  }
  symbol.name = `${relationSymbol} ${relationMemberTitle}`;
  parentsStack.push(symbol);
};
const onRelationExit = (response: IArgdownResponse, parentsStack: ArgdownSymbol[]) => {
  const symbol = parentsStack.pop();
  addSymbol(response, symbol!, parentsStack);
};

export class DocumentSymbolPlugin implements IArgdownPlugin {
  name = "DocumentSymbolPlugin";
  ruleListeners: { [eventId: string]: IRuleNodeHandler };
  constructor() {
    let parentsStack: ArgdownSymbol[] = [];
    let inRelations = 0;
    let inPcs = false;
    this.ruleListeners = {
      [RuleNames.ARGDOWN + "Entry"]: (_request, response) => {
        response.documentSymbols = [];
        parentsStack = [];
        inRelations = 0;
        inPcs = false;
      },
      [RuleNames.ARGDOWN + "Exit"]: (_request, response) => {
        while (parentsStack.length > 0) {
          const symbol = parentsStack.pop();
          addSymbol(response, symbol!, parentsStack);
        }
      },
      [RuleNames.RELATIONS + "Entry"]: () => {
        inRelations++;
      },
      [RuleNames.RELATIONS + "Exit"]: () => {
        inRelations--;
      },
      [RuleNames.HEADING + "Exit"]: (_request, response, node) => {
        let parent = parentsStack.length > 0 ? parentsStack[parentsStack.length - 1] : null;
        const level = node.section!.level;
        while (parent && parent.argdownType === ArgdownTypes.SECTION && parent.level! >= level) {
          parentsStack.pop();
          addSymbol(response, parent!, parentsStack);
          parent = parentsStack.length > 0 ? parentsStack[parentsStack.length - 1] : null;
        }
        const symbol = new ArgdownSymbol();
        let hashChars = "";
        for (let i = 0; i < level; i++) {
          hashChars += "#";
        }
        symbol.name = `${hashChars} ${node.text}`;
        symbol.argdownType = ArgdownTypes.SECTION;
        symbol.level = level;
        symbol.range = Range.create(
          node.section!.startLine! - 1,
          node.section!.startColumn! - 1,
          node.section!.endLine! - 1,
          node.section!.endColumn!
        );
        symbol.selectionRange = getRange(node);
        symbol.kind = SymbolKind.Variable;
        parentsStack.push(symbol);
      },
      [RuleNames.STATEMENT + "Entry"]: (_request, _response, node) => {
        if (inRelations > 0 || inPcs) {
          return;
        }
        const symbol = new ArgdownSymbol();
        symbol.name = `[${node.statement!.title}]`;
        symbol.range = getRange(node);
        const firstChild = node.children && node.children.length > 0 ? node.children[0] : null;
        if (
          firstChild &&
          isRuleNode(firstChild) &&
          (firstChild.name === RuleNames.STATEMENT_DEFINITION || firstChild.name === RuleNames.STATEMENT_REFERENCE)
        ) {
          symbol.selectionRange = getRange(firstChild);
        } else {
          symbol.selectionRange = symbol.range;
        }
        symbol.kind = SymbolKind.Variable;
        parentsStack.push(symbol);
      },
      [RuleNames.STATEMENT + "Exit"]: (_request, response) => {
        if (inRelations > 0 || inPcs) {
          return;
        }
        const symbol = parentsStack.pop();
        addSymbol(response, symbol!, parentsStack);
      },
      [RuleNames.ARGUMENT + "Entry"]: (_request, _response, node) => {
        if (inRelations > 0 || inPcs) {
          return;
        }
        const symbol = new ArgdownSymbol();
        symbol.name = `<${node.argument!.title}>`;
        symbol.range = getRange(node);
        const firstChild = node.children && node.children.length > 0 ? node.children[0] : null;
        if (
          firstChild &&
          isTokenNode(firstChild) &&
          (tokenMatcher(firstChild, ArgumentDefinition) || tokenMatcher(firstChild, ArgumentReference))
        ) {
          symbol.selectionRange = getRange(firstChild);
        } else {
          symbol.selectionRange = symbol.range;
        }
        symbol.kind = SymbolKind.Variable;
        parentsStack.push(symbol);
      },
      [RuleNames.ARGUMENT + "Exit"]: (_request, response) => {
        if (inRelations > 0 || inPcs) {
          return;
        }
        const symbol = parentsStack.pop();
        addSymbol(response, symbol!, parentsStack);
      },
      [RuleNames.PCS + "Entry"]: (_request, _response, node) => {
        inPcs = true;
        const symbol = new ArgdownSymbol();
        symbol.name = `PCS <${node.argument!.title}>`;
        symbol.range = getRange(node);
        const firstChild = node.children && node.children.length > 0 ? node.children[0] : null;
        if (
          firstChild &&
          isTokenNode(firstChild) &&
          (tokenMatcher(firstChild, ArgumentDefinition) || tokenMatcher(firstChild, ArgumentReference))
        ) {
          symbol.selectionRange = getRange(firstChild);
        } else {
          symbol.selectionRange = symbol.range;
        }
        symbol.kind = SymbolKind.Variable;
        parentsStack.push(symbol);
      },
      [RuleNames.PCS + "Exit"]: (_request, response) => {
        inPcs = false;
        const symbol = parentsStack.pop();
        addSymbol(response, symbol!, parentsStack);
      },
      [RuleNames.PCS_STATEMENT + "Entry"]: (_request, _response, node) => {
        const symbol = new ArgdownSymbol();
        symbol.name = `(${node.statementNr}) [${node.statement!.title}]`;
        symbol.range = getRange(node);
        const firstChild = node.children && node.children.length > 0 ? node.children[0] : null;
        if (
          firstChild &&
          isRuleNode(firstChild) &&
          (firstChild.name === RuleNames.STATEMENT_DEFINITION || firstChild.name === RuleNames.STATEMENT_REFERENCE)
        ) {
          symbol.selectionRange = getRange(firstChild);
        } else {
          symbol.selectionRange = symbol.range;
        }
        symbol.kind = SymbolKind.Variable;
        parentsStack.push(symbol);
      },
      [RuleNames.PCS_STATEMENT + "Exit"]: (_request, response) => {
        const symbol = parentsStack.pop();
        addSymbol(response, symbol!, parentsStack);
      },
      [RuleNames.INFERENCE + "Entry"]: (_request, _response, node) => {
        const symbol = new ArgdownSymbol();
        symbol.name = `----`;
        symbol.range = getRange(node);
        const firstChild = node.children && node.children.length > 0 ? node.children[0] : null;
        if (
          firstChild &&
          isRuleNode(firstChild) &&
          (firstChild.name === RuleNames.STATEMENT_DEFINITION || firstChild.name === RuleNames.STATEMENT_REFERENCE)
        ) {
          symbol.selectionRange = getRange(firstChild);
        } else {
          symbol.selectionRange = symbol.range;
        }
        symbol.kind = SymbolKind.Variable;
        parentsStack.push(symbol);
      },
      [RuleNames.INFERENCE + "Exit"]: (_request, response) => {
        const symbol = parentsStack.pop();
        addSymbol(response, symbol!, parentsStack);
      },
      [RuleNames.INCOMING_ATTACK + "Entry"]: (_req, _resp, node) => {
        onRelationEntry(parentsStack, node, "->");
      },
      [RuleNames.INCOMING_ATTACK + "Exit"]: (_req, resp) => {
        onRelationExit(resp, parentsStack);
      },
      [RuleNames.INCOMING_SUPPORT + "Entry"]: (_req, _resp, node) => {
        onRelationEntry(parentsStack, node, "+>");
      },
      [RuleNames.INCOMING_SUPPORT + "Exit"]: (_req, resp) => {
        onRelationExit(resp, parentsStack);
      },
      [RuleNames.INCOMING_UNDERCUT + "Entry"]: (_req, _resp, node) => {
        onRelationEntry(parentsStack, node, "_>");
      },
      [RuleNames.INCOMING_UNDERCUT + "Exit"]: (_req, resp) => {
        onRelationExit(resp, parentsStack);
      },
      [RuleNames.OUTGOING_ATTACK + "Entry"]: (_req, _resp, node) => {
        onRelationEntry(parentsStack, node, "<-");
      },
      [RuleNames.OUTGOING_ATTACK + "Exit"]: (_req, resp) => {
        onRelationExit(resp, parentsStack);
      },
      [RuleNames.OUTGOING_SUPPORT + "Entry"]: (_req, _resp, node) => {
        onRelationEntry(parentsStack, node, "<+");
      },
      [RuleNames.OUTGOING_SUPPORT + "Exit"]: (_req, resp) => {
        onRelationExit(resp, parentsStack);
      },
      [RuleNames.OUTGOING_UNDERCUT + "Entry"]: (_req, _resp, node) => {
        onRelationEntry(parentsStack, node, "<_");
      },
      [RuleNames.OUTGOING_UNDERCUT + "Exit"]: (_req, resp) => {
        onRelationExit(resp, parentsStack);
      },
      [RuleNames.CONTRADICTION + "Entry"]: (_req, _resp, node) => {
        onRelationEntry(parentsStack, node, "><");
      },
      [RuleNames.CONTRADICTION + "Exit"]: (_req, resp) => {
        onRelationExit(resp, parentsStack);
      }
    };
  }
}
