import { TokenType, IToken, IParserErrorMessageProvider } from "chevrotain";
export declare class ArgdownErrorMessageProvider implements IParserErrorMessageProvider {
    buildMismatchTokenMessage(options: {
        expected: TokenType;
        actual: IToken;
        previous: IToken;
        ruleName: string;
    }): any;
    buildNotAllInputParsedMessage(options: {
        firstRedundant: IToken;
        ruleName: string;
    }): any;
    buildNoViableAltMessage(options: {
        expectedPathsPerAlt: TokenType[][][];
        actual: IToken[];
        previous: IToken;
        customUserDescription: string;
        ruleName: string;
    }): any;
    buildEarlyExitMessage(options: {
        expectedIterationPaths: TokenType[][];
        actual: IToken[];
        previous: IToken;
        customUserDescription: string;
        ruleName: string;
    }): string;
}
