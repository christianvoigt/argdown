import { Arguments } from "yargs";
export declare const command = "compile [inputGlob] [outputDir]";
export declare const desc = "compile included Argdown files into main file";
export declare const builder: {};
export declare const handler: (argv: Arguments) => Promise<void>;
