import Uri from "vscode-uri";
import { TextDocument } from "vscode-languageserver";
import { AsyncArgdownApplication } from "@argdown/node";
export interface ExportContentArgs {
    content: string;
    target: Uri;
    process: string;
}
export interface ExportDocumentArgs {
    source: Uri;
    target: Uri;
    process: string;
}
export declare const exportContent: (argdownEngine: AsyncArgdownApplication, args: ExportContentArgs) => Promise<void>;
export declare const exportDocument: (argdownEngine: AsyncArgdownApplication, args: ExportDocumentArgs, doc: TextDocument) => Promise<void>;
