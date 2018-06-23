import { IArgdownPlugin, IArgdownRequest, IArgdownResponse, IArgdownLogger } from "@argdown/core";
import { isFunction } from "util";
export interface IAsyncRequestHandler {
  (request: IArgdownRequest, response: IArgdownResponse, logger: IArgdownLogger): Promise<void>;
}
export interface IAsyncArgdownPlugin extends IArgdownPlugin {
  runAsync: IAsyncRequestHandler;
}
export const isAsyncPlugin = (plugin: IArgdownPlugin): plugin is IAsyncArgdownPlugin => {
  return isFunction((<any>plugin).runAsync);
};
