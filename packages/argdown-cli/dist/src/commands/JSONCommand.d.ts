import { Arguments } from "yargs";
export declare const command = "json [inputGlob] [outputDir]";
export declare const desc = "export Argdown input as JSON files";
export declare const builder: {
    logParserErrors: {
        alias: string;
        describe: string;
        type: string;
        default: boolean;
    };
    spaces: {
        alias: string;
        describe: string;
        type: string;
    };
    removeMap: {
        describe: string;
        type: string;
    };
    removeEmbeddedRelations: {
        describe: string;
        type: string;
    };
};
export declare const handler: (argv: Arguments) => Promise<void>;
