import { Arguments } from "yargs";
import { StatementSelectionMode, LabelMode } from "@argdown/core";
export declare const command = "map [inputGlob] [outputDir]";
export declare const desc = "export Argdown input as DOT files";
export declare const builder: {
    logParserErrors: {
        alias: string;
        describe: string;
        type: string;
        default: boolean;
    };
    useHtmlLabels: {
        alias: string;
        describe: string;
        type: string;
    };
    argumentLabelMode: {
        alias: string;
        choices: (LabelMode | undefined)[];
        type: string;
        describe: string;
    };
    statementLabelMode: {
        alias: string;
        choices: (LabelMode | undefined)[];
        type: string;
        describe: string;
    };
    statementSelectionMode: {
        alias: string;
        describe: string;
        type: string;
        choices: (StatementSelectionMode | undefined)[];
    };
    graphName: {
        alias: string;
        type: string;
        describe: string;
    };
    lineLength: {
        alias: string;
        type: string;
        describe: string;
    };
    groupColors: {
        type: string;
        describe: string;
    };
    inclusive: {
        type: string;
        describe: string;
    };
    rankdir: {
        type: string;
        describe: string;
    };
    concentrate: {
        type: string;
        describe: string;
    };
    ratio: {
        type: string;
        describe: string;
    };
    size: {
        type: string;
        describe: string;
    };
    format: {
        alias: string;
        type: string;
        describe: string;
        default: string;
    };
};
export declare const handler: (argv: Arguments) => Promise<void>;
