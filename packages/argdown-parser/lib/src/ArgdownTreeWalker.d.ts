import { EventEmitter } from "eventemitter3";
import { IAstNode, IRuleNode, ITokenNode } from "./model/model";
import { IArgdownRequest } from "./IArgdownRequest";
import { IArgdownResponse } from "./IArgdownResponse";
import { IArgdownLogger } from "./IArgdownLogger";
export interface IAstNodeHandler {
    (request: IArgdownRequest, response: IArgdownResponse, node: IAstNode, parentNode: IRuleNode | null, childIndex: number | null, logger: IArgdownLogger): void;
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
    (request: IArgdownRequest, response: IArgdownResponse, node: IRuleNode, parentNode: IRuleNode | null, childIndex: number | null, logger: IArgdownLogger): void;
}
/**
 * Interface for listeners of [token.tokenType.tokenName] events emitted by [[ArgdownTreeWalker]]
 */
export interface ITokenNodeHandler {
    (request: IArgdownRequest, response: IArgdownResponse, token: ITokenNode, parentNode: IRuleNode | null, childIndex: number | null, logger: IArgdownLogger): void;
}
/**
 * Event emitter that visits every node in an Argdown Ast structure
 * and emits events for every rule entered and exited
 * and every token visited.
 */
export declare class ArgdownTreeWalker extends EventEmitter {
    walk(request: IArgdownRequest, response: IArgdownResponse, logger: IArgdownLogger): void;
    private visitNode;
}
