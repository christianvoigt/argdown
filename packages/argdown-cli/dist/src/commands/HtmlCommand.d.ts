import { Arguments } from "yargs";
export declare const command = "html [inputGlob] [outputDir]";
export declare const desc = "export Argdown input as HTML files";
export declare const builder: {
    logParserErrors: {
        alias: string;
        describe: string;
        type: string;
        default: boolean;
    };
    headless: {
        alias: string;
        describe: string;
        type: string;
    };
    head: {
        alias: string;
        describe: string;
        type: string;
    };
    css: {
        alias: string;
        describe: string;
        type: string;
    };
    title: {
        alias: string;
        describe: string;
        type: string;
    };
    lang: {
        alias: string;
        describe: string;
        type: string;
    };
    charset: {
        alias: string;
        describe: string;
        type: string;
    };
};
export declare const handler: (argv: Arguments) => Promise<void>;
