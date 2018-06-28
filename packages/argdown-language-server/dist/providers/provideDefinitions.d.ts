import { Location, Position } from "vscode-languageserver";
import { IArgdownResponse } from "@argdown/core";
export declare const provideDefinitions: (response: IArgdownResponse, uri: string, position: Position) => Location[];
