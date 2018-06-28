import { Location, Position, ReferenceContext } from "vscode-languageserver";
import { IArgdownResponse } from "@argdown/core";
export declare const provideReferences: (response: IArgdownResponse, uri: string, position: Position, context?: ReferenceContext) => Location[];
