import { IArgdownPlugin } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IArgdownResponse } from "../IArgdownResponse";
import { IArgdownLogger } from "../IArgdownLogger";
/**
 * The ParserPlugin is the most basic building block of an ArgdownApplication.
 * It takes a string provided in [[IArgdownRequest.input]]
 * and scans it for tokens. The resulting tokens list is added to the [[IArgdownResponse.tokens]] response property.
 * The tokens are parsed into an abstract syntax tree (AST).
 * The AST is added to the [[IArgdownResponse.ast]] response property.
 *
 * The AST is then used by the [[ModelPlugin]] to build the basic data model used by most other plugins.
 *
 * Lexer errors are added to [[IArgdownResponse.lexerErrors]] response property. Parser errors are added to the [[IArgdownResponse.parserErrors]] response property.
 * These errors can be used to build an Argdown linter.
 */
export declare class ParserPlugin implements IArgdownPlugin {
    name: string;
    run(request: IArgdownRequest, response: IArgdownResponse, logger: IArgdownLogger): IArgdownResponse;
}
