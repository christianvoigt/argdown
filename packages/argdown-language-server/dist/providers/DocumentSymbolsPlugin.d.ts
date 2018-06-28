import { Location, SymbolKind, SymbolInformation } from "vscode-languageserver";
import { IArgdownPlugin } from "@argdown/core";
declare module "@argdown/core" {
    interface IArgdownResponse {
        documentSymbols?: SymbolInformation[];
        inputUri?: string;
    }
}
export declare const enum ArgdownSymbolKind {
    PCS = 0,
    ArgumentDefinition = 1,
    StatementDefinition = 2,
    Heading = 3
}
export declare class ArgdownSymbolInformation implements SymbolInformation {
    name: string;
    kind: SymbolKind;
    location: Location;
    argdownKind: ArgdownSymbolKind;
    argdownId: string;
}
export declare const documentSymbolsPlugin: IArgdownPlugin;
