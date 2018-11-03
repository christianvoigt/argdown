import { IArgdownLogger } from "./IArgdownLogger";
import { IRuleNodeHandler, ITokenNodeHandler } from "./ArgdownTreeWalker";
import { IArgdownRequest, IArgdownResponse } from "./index";

/**
 *
 * @param request the request should contain the input and all configuration settings
 *
 * @param response the response should contain any data produced or transformed by plugins
 *
 * @param logger an application-wide logger that should be used instead of `console.log()`
 */
export interface IRequestHandler {
  (request: IArgdownRequest, response: IArgdownResponse, logger: IArgdownLogger): void;
}
/**
 * A plugin that can be added to an [[ArgdownApplication]] with `app.AddPlugin(plugin, processorId)`.
 *
 * Can walk the Argdown AST by using `tokenListeners` and `ruleListeners`. Should use the `run` method for everything else.
 *
 * Plugins should avoid keeping any local mutable state. Instead they should use
 * the provided request object for configuration and the provided response object for returning any produced or transformed data.
 * The only exceptions are I/O operations (e.g. loading or saving files).
 *
 * See the [guide on writing custom plugins](https://argdown.org/guide/writing-custom-plugins.html) for more information.
 *
 * @example
 * ```typescript
 *
 * import {IArgdownRequest, IArgdownResponse, IArgdownPlugin, IRequestHandler, IRuleTokenHandler, ArgdownPluginError, RuleNames} from "@argdown/core";
 *
 * export interface IGreetingSettings{
 *  addHello?:boolean;
 * }
 * // We augment the request and response types from @argdown/core
 * // to add our plugin settings and data:
 * declare module "@argdown/core"{
 *  interface IArgdownRequest{
 *    greeting?:IGreetingSettings;
 *  }
 *  interface IArgdownResponse{
 *    greeting:string;
 *  }
 * }
 *
 * export class GreetingPlugin implements IArgdownPlugin{
 *  name = "GreetingPlugin";
 *  prepare:IRequestHandler = (request, response)=>{
 *    // check if requirements are met
 *    if(!response.ast){
 *      throw new ArgdownPluginError(this.name, "No ast found in response.");
 *    }
 *    // create default settings
 *    if(!request.greeting){
 *      request.greeting = {};
 *    }
 *    if(request.greeting.sayHello === undefined){
 *      request.greeting.sayHello = true;
 *    }
 *  };
 *  run:IRequestHandler = (request, response)=>{
 *    if(request.greeting && request.greeting.addHello){
 *      // adding data to response object
 *      response.greeting = "Hallo World!";
 *    }
 *  };
 *  ruleListeners = {
 *    [RuleNames.STATEMENT + "Entry"]: (request, response, node, parentNode, childIndex, logger)=>{
 *      // use the logger parameter instead of console.log
 *      logger.log("verbose", `Statement: ${node.statement.text}`);
 *    }
 *  }
 * }
 * ```
 */
export interface IArgdownPlugin {
  /** The name of the plugin */
  name: string;
  /**
   * Called each time the plugin's processor is run,
   * before any other method of this plugin is called.
   * Use this to add default settings to the request and to check that all required data is present in the response.
   * If not, throw an [[ArgdownPluginError]] to cancel the the current processor's execution.
   */
  prepare?: IRequestHandler;
  /**
   * Use this method to do the main work outside of the Argdown AST.
   * This is the last method to be called by the [[ArgdownApplication]].
   */
  run?: IRequestHandler;
  /**
   * A map of [[IRuleNode]] event listeners to be added to [[IArgdownPlugin.ruleListeners]].
   * You can use ruleListeners to visit every rule node in the Argdown AST.
   *
   * The listeners will be called by the ArgdownTreeWalker event emitter before the [[run]] method and after the [[prepare]] method.
   * The tree walker visits the nodes depth first and emits
   * `[RuleNames.RULE_NAME + "Entry"]` and `[RuleNames.RULE_NAME + "Exit"]` events for every [[IRuleNode]] encountered.
   *
   * The eventId has to be a [[RuleNames]] member plus either "Entry" or "Exit".
   * @example
   * ```javascript
   * [RuleNames.RELATIONS + "Exit"]: ()=>...
   * ```
   */
  ruleListeners?: { [eventId: string]: IRuleNodeHandler };
  /**
   * A map of [[ITokenNode]] event listeners.
   * You can use tokenListeners to visit every token node in the Argdown abstract syntax tree.
   *
   * The listeners will be called by the ArgdownTreeWalker event emitter before the [[run]] method and after the [[prepare]] method.
   *
   * The tree walker visits the nodes depth first and emits
   * `[TokenNames.TOKEN_NAME]` events for every [[ITokenNode]] encountered.
   *
   * The eventId has to be a [[TokenNames]] member.
   *
   * @example
   * ```javascript
   * [TokenNames.STATEMENT_DEFINITION]: ()=>...
   * ```
   *
   */
  tokenListeners?: { [eventId: string]: ITokenNodeHandler };
}
