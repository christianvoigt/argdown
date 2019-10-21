import { EventEmitter } from "eventemitter3";
import {
  IAstNode,
  IRuleNode,
  ITokenNode,
  isRuleNode,
  isTokenNode
} from "./model/model";
import { IArgdownLogger } from "./IArgdownLogger";
import { IArgdownRequest, IArgdownResponse } from "./index";
export interface IAstNodeHandler {
  (
    request: IArgdownRequest,
    response: IArgdownResponse,
    node: IAstNode,
    parentNode: IRuleNode | null,
    childIndex: number | null,
    logger: IArgdownLogger
  ): void;
}
/**
 * Interface for listeners of [rule.name]Entry and [rule.name]Exit events emitted by [[ArgdownTreeWalker]]
 *
 * @param request the request should contain the input and all configuration settings
 *
 * @param response the response should contain any data produced or transformed by plugins
 *
 * @param logger an application-wide logger that should be used instead of `console.log()`
 */
export interface IRuleNodeHandler {
  (
    request: IArgdownRequest,
    response: IArgdownResponse,
    node: IRuleNode,
    parentNode: IRuleNode | null,
    childIndex: number | null,
    logger: IArgdownLogger
  ): void;
}
/**
 * Interface for listeners of [token.tokenType.name] events emitted by [[ArgdownTreeWalker]]
 */
export interface ITokenNodeHandler {
  (
    request: IArgdownRequest,
    response: IArgdownResponse,
    token: ITokenNode,
    parentNode: IRuleNode | null,
    childIndex: number | null,
    logger: IArgdownLogger
  ): void;
}
/**
 * Event emitter that visits every node in an Argdown Ast structure
 * and emits events for every rule entered and exited
 * and every token visited.
 */
export class ArgdownTreeWalker extends EventEmitter {
  walk(
    request: IArgdownRequest,
    response: IArgdownResponse,
    logger: IArgdownLogger
  ): void {
    if (response.ast) {
      this.visitNode(request, response, response.ast, null, null, logger);
    }
  }
  private visitNode: IAstNodeHandler = (
    request,
    response,
    node,
    parentNode,
    childIndex,
    logger
  ) => {
    if (node) {
      if (isRuleNode(node)) {
        this.emit(
          node.name + "Entry",
          request,
          response,
          node,
          parentNode,
          childIndex,
          logger
        );
        if (node.children && node.children.length > 0) {
          for (var i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            this.visitNode(request, response, child, node, i, logger);
          }
        }
        this.emit(
          node.name + "Exit",
          request,
          response,
          node,
          parentNode,
          childIndex,
          logger
        );
      } else if (isTokenNode(node)) {
        this.emit(
          node.tokenType!.name!,
          request,
          response,
          node,
          parentNode,
          childIndex,
          logger
        );
      }
    }
  };
}
