import { IArgdownPlugin } from "@argdown/core";
import * as core from "@argdown/core";

declare module "@argdown/core" {
  interface IArgdownRequest {
    /**
     * Use the output path to set a custom path and file name for an export.
     * All export plugins will use this name and folder.
     *
     * Otherwise the new file will have the same name as the exported Argdown document (e.g. debate.argdown -> debate.svg)
     * and export plugins will use the folder in their settings.
     */
    outputPath?: string;
    /**
     * Will be added to the filename of an exported file.
     *
     * Example: If suffix is "-map1" and the input file is "my-debate.ad", by default the svg export will save a file called "my-debate-map1.svg".
     *
     * This is useful if you use several different selections in your custom processes that should not overwrite each other.
     */
    outputSuffix?: string;
    /**
     * The file or files to be loaded.
     *
     * Use a file "glob" to load more than one file (e.g. "**\/*.argdown").
     */
    inputPath?: string;
    /**
     * The root directory relative to which paths are defined.
     *
     * By default this is the current working directory.
     */
    rootPath?: string;
    /**
     * Files that should be ignored if a file glob is used in [[IArgdownRequest.inputPath]]
     */
    ignore?: string[];
    /**
     * If true, Argdown will execute the defined process each time a file has changed that is selected by [[IArgdownRequest.inputPath]]
     */
    watch?: boolean;
    /**
     * Add custom plugins to the Argdown application.
     *
     * Plugins will be removed again after the current run.
     * If you want to add plugins permanently, use [[AsyncArgdownApplication.addPlugin]].
     */
    plugins?: { processor: string; plugin: IArgdownPlugin }[];
  }
}
export interface IArgdownRequest extends core.IArgdownRequest {}
export * from "./argdown";
export * from "./IAsyncArgdownPlugin";
export * from "./AsyncArgdownApplication";
export * from "./plugins/CopyDefaultCssPlugin";
export * from "./plugins/DotToSvgExportPlugin";
export * from "./plugins/IncludePlugin";
export * from "./plugins/LoadFilePlugin";
export * from "./plugins/LogParserErrorsPlugin";
export * from "./plugins/SaveAsFilePlugin";
export * from "./plugins/StdOutPlugin";
export * from "./plugins/SvgToPdfExportPlugin";
export * from "./plugins/HighlightSourcePlugin";
export * from "./plugins/WebComponentExportPlugin";
