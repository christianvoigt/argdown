import { FoldingRange } from "vscode-languageserver";
import {
  IArgdownPlugin,
  RuleNames,
  IRuleNodeHandler,
  ITokenNodeHandler,
  StatementRole,
  IArgumentDescription,
  TokenNames
} from "@argdown/core";

declare module "@argdown/core" {
  interface IArgdownResponse {
    foldingRanges?: FoldingRange[];
  }
}
export class FoldingRangesPlugin implements IArgdownPlugin {
  name = "FoldingRangesPlugin";
  tokenListeners: { [eventId: string]: ITokenNodeHandler } = {
    [TokenNames.FRONT_MATTER]: (_req, response, node) => {
      response.foldingRanges!.push(FoldingRange.create(node!.startLine! - 1, node!.endLine! - 1));
    }
  };
  ruleListeners: { [eventId: string]: IRuleNodeHandler } = {
    [RuleNames.ARGDOWN + "Entry"]: (_req, response) => {
      response.foldingRanges = [];
    },
    [RuleNames.HEADING + "Entry"]: (_req, response, node) => {
      response.foldingRanges!.push(FoldingRange.create(node.section!.startLine! - 1, node.section!.endLine! - 1));
    },
    // [RuleNames.PCS + "Entry"]: (_req, response, node) => {
    //   response.foldingRanges!.push(FoldingRange.create(node.startLine! - 1, node.endLine! - 1));
    // },
    [RuleNames.STATEMENT + "Entry"]: (_req, response, node, parentNode) => {
      if (parentNode && parentNode.name !== RuleNames.ARGDOWN) {
        return;
      }
      response.foldingRanges!.push(FoldingRange.create(node.startLine! - 1, node.endLine! - 1));
    },
    [RuleNames.ARGUMENT + "Entry"]: (_req, response, node, parentNode) => {
      if (parentNode && parentNode.name !== RuleNames.ARGDOWN) {
        return;
      }
      let endLine = node.endLine! - 1;
      if (node.statement && node.statement.role === StatementRole.ARGUMENT_DESCRIPTION) {
        const pcs = (<IArgumentDescription>node.statement).pcs;
        if (pcs && pcs.length > 0) {
          endLine = pcs[pcs.length - 1].endLine! - 1;
        }
      }
      response.foldingRanges!.push(FoldingRange.create(node.startLine! - 1, endLine));
    },
    [RuleNames.PCS_STATEMENT + "Entry"]: (_req, response, node) => {
      response.foldingRanges!.push(FoldingRange.create(node.startLine! - 1, node.endLine! - 1));
    },
    [RuleNames.INFERENCE + "Entry"]: (_req, response, node) => {
      response.foldingRanges!.push(FoldingRange.create(node.startLine! - 1, node.endLine! - 1));
    }
  };
}
