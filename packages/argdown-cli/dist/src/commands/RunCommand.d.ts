import { Arguments } from "yargs";
export declare const command = "run [process]";
export declare const desc = "run a process you have defined in your config file";
export declare const handler: (argv: Arguments) => Promise<void>;
