import { DocumentSymbol, Location, Range, SymbolKind, SymbolInformation } from "vscode-languageserver";
import Uri from "vscode-uri";
import {
  IArgdownPlugin,
  ITokenNode,
  IArgdownRequest,
  IArgdownResponse,
  TokenNames,
  RuleNames,
  ITokenNodeHandler,
  IRuleNodeHandler,
  IAstNode
} from "@argdown/core";

declare module "@argdown/core" {
  interface IArgdownResponse {
    documentSymbols?: DocumentSymbol[];
    inputUri?: string;
  }
}

export const enum ArgdownSymbolKind {
  PCS,
  ArgumentDefinition,
  StatementDefinition,
  Heading
}

export class ArgdownSymbolInformation implements DocumentSymbol {
  public name: string;
  public kind: SymbolKind;
  public location: Location;
  public argdownKind: ArgdownSymbolKind;
  public argdownId: string;
  public range: Range;
  public selectionRange: Range;
}

const addSymbol = (
  {},
  response: IArgdownResponse,
  node: IAstNode,
  name: string,
  argdownKind: ArgdownSymbolKind,
  argdownId: string,
  range: Range,
  selectionRange: Range
) => {
  const symbolInfo: ArgdownSymbolInformation = {
    name,
    kind: SymbolKind.Variable,
    argdownKind,
    argdownId,
    range,
    selectionRange,
    location: {
      uri: response.inputUri,
      range: {
        start: { line: node.startLine - 1, character: node.startColumn - 1 },
        end: { line: node.endLine - 1, character: node.endColumn }
      }
    }
  };
  response.documentSymbols.push(symbolInfo);
};
export const documentSymbolsPlugin: IArgdownPlugin = {
  name: "DocumentSymbolsPlugin",
  prepare: (request: IArgdownRequest, response: IArgdownResponse) => {
    response.inputUri = Uri.file(request.inputPath).toString();
  },
  tokenListeners: {
    [TokenNames.STATEMENT_DEFINITION]: <ITokenNodeHandler>((request, response, token) => {
      addSymbol(request, response, token, `[${token.title}]`, ArgdownSymbolKind.StatementDefinition, token.title);
    }),
    [TokenNames.ARGUMENT_DEFINITION]: <ITokenNodeHandler>((request, response, token) => {
      addSymbol(request, response, token, `<${token.title}>`, ArgdownSymbolKind.ArgumentDefinition, token.title);
    })
  },
  ruleListeners: {
    [RuleNames.ARGDOWN + "Entry"]: <IRuleNodeHandler>((_request, response) => {
      response.documentSymbols = <SymbolInformation[]>[];
    }),
    [RuleNames.PCS + "Entry"]: <IRuleNodeHandler>((request, response, node) => {
      addSymbol(request, response, node, `PCS <${node.argument.title}>`, ArgdownSymbolKind.PCS, node.argument.title);
    }),
    [RuleNames.HEADING + "Entry"]: <IRuleNodeHandler>((request, response, node) => {
      const sectionId = node.section ? node.section.id : node.text;
      addSymbol(
        request,
        response,
        node,
        `${(<ITokenNode>node.children[0]).image}${node.text}`,
        ArgdownSymbolKind.Heading,
        sectionId
      );
    })
  }
};
