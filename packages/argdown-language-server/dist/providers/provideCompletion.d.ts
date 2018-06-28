import { CompletionItem, Position } from "vscode-languageserver";
import { IArgdownResponse } from "@argdown/core";
export declare const provideCompletion: (response: IArgdownResponse, char: string, position: Position, text: string, offset: number) => CompletionItem[];
