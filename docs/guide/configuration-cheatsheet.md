# Configuration Cheat Sheet

The following typescript file contains all currently supported settings together with extensive comments on their meaning. For further information on most of these configuration options, please read the guide on [creating argument maps](/creating-argument-maps).

All settings are optional (signified by the ? behind their names).

```typescript
interface IArgdownConfig {
  /**
   * The files that should be loaded
   * You can use a file glob.
   **/
  inputPath?:string;
  /**
   * Use this if you want to directly set a folder and a file name for an exported file.
   * 
   * Do not use this if you want the naming to be done dynamically. 
   **/
  outputPath?:string;
  /**
   * Will be appended to the file name of any files exported. 
   **/
  outputSuffix?:string;
  // settings for the model plugin
  model?: {
    /**
     * if true, tags will be removed from statement and description text
     **/
    removeTagsFromText?: boolean; // default: false
    /**
     * Determines how statement-to-statement relations are to be interpreted:
     * In "loose" mode, - means attack and + means support.
     * In "strict" mode, - means contrary and + means entails.
     **/
    mode?: "loose" | "strict" // loose is default mode
    /**
     * If true, outgoing relations of reconstructed arguments are transformed into outgoing relations of the pcs's main conclusion.
     * Incoming undercuts of reconstructed arguments are transformed into incoming undercuts of the pcs's last inference.
     **/
    transformArgumentRelations?: boolean; // default is true
  };
  // settings for the tag plugin
  color?: {
    /**
     * A custom color scheme or the name of a built-in one
     * 
     * colors have to be in #fffff hex format
     *
     */
    colorScheme?: string[] | string; // default is "default"
    /**
     * A custom color scheme for groups
     **/
    groupColorScheme?: string[]; 
    colorByTags?: boolean; // default is true
    colorGroupsByTags?: boolean; // default is false
    /**
     * Mapping of tags to colors. 
     * 
     * You can refer to a color scheme by index.
     * 
     * You can give tags priorities to use them for coloring even if they are not the first tags 
     * applied.
     */
    tagColors?: { [tagName:string]: string|number| {color: string|number, priority: number} };
    /**
     * Ignore color fields of data elements.
     **/
    ignoreColorData?:boolean; // default is false
    /**
     * A map from statement titles to colors
     **/
    statementColors?: {[title:string]: string|number};
    /**
     * A map from argument titles to colors
     **/
    argumentColors?: {[title:string]: string|number};
    /**
     * A map from section titles to colors
     **/
    groupColors?: {[title:string]: string|number};
  };
  // settings for the selection plugins
  selection?: {
    /**
     * Can be used to only select arguments and statements with certain tags
     */
    selectedTags?: string[];
    /**
     * Should arguments and statements without tags be excluded from the selection?
     * This is only relevant, if [[ISelectionSettings.selectedTags]] is used.
     */
    selectElementsWithoutTag?: boolean;
    /**
     *
     * A list of headings that can be used to only selected arguments and statements from certain sections in the texts.
     */
    selectedSections?: string[];
    /**
     * Should arguments and statements that are defined under no heading be excluded from the selection?
     * This is only relevant if [[ISelectionSettings.selectedSections]] is used.
     */
    selectElementsWithoutSection?: boolean;
    /**
     * Titles of statements that should be represented as nodes in the map.
     *
     * This does not automatically exclude all other statements from being put into the map as nodes.
     * It works similarly to using the isInMap:true flag for the included statements.
     * Which other statements are selected depends on the other selection methods used.
     */
    includeStatements?: string[];
    /**
     * Titles of statements that should be excluded from the map.
     */
    excludeStatements?: string[];
    /**
     * Titles of arguments that should not be in the map.
     */
    excludeArguments?: string[];
    /**
     * If true, the isInMap data flag is ignored.
     */
    ignoreIsInMap?: boolean;
    /**
     * Should disconnected nodes be excluded from the map?
     **/
    excludeDisconnected?: boolean; // default is true
    /**
     * The method by which preselected statements are selected
     *
     **/
    statementSelectionMode?:
      | "all"
      | "with-title"
      | "with-relations"
      | "with-more-than-one-relation"
      | "not-used-in-argument"; // default: "with-title"
  };
  map: {
    statementLabelMode?: "hide-untitled"| "title" | "text"; // default is "hide-untitled"
    argumentLabelMode?: "hide-untitled"| "title" | "text"; // default is "hide-untitled"
  };
  group: {
    /**
     * How many levels of groups should there be? 
     **/
    groupDepth?: number;
    /**
     * Can be used to override heading-based grouping.
     **/
    regroup?: {title: string, tags?:string[], statements?:string[], arguments?:string[], children?:[]}[];
  }
  html: {
    outputDir?: string; // default is "./html"
    /**
     * Remove sourrounding html and body tags, remove head section of HTML.
     *
     * Instead a simple div containing the argdown HTML is returned.
     */
    headless?: boolean;
    /**
     * External CSS file to include in the HTML head section.
     */
    cssFile?: string;
    /** Title of the HTML document. If not provided, the first top-level heading will be used. */
    title?: string;
    lang?: string;
    charset?: string;
    allowFileProtocol?: boolean;
    /** Optional setting to specify a custom head section. */
    head?: string;
    /** Function to test if a link is valid. */
    validateLink?: (url: string, allowFile: boolean) => boolean;
    /** Function to normalize links. */
    normalizeLink?: (url: string) => string;
    css?: string;
  }
  json: {
    outputDir?: string; // default is "./json"
    spaces?: number;
    /**
     * Should [[Argument.relations]], [[Statement.relations]] be removed from the JSON objects?
     */
    removeEmbeddedRelations?: boolean;
    /**
     * Should the JSON data include the response.map property?
     */
    exportMap?: boolean;
    /**
     * Should the JSON data include sections?
     */
    exportSections?: boolean;
    /**
     * Should the JSON data include tag data?
     */
    exportTags?: boolean;
    /**
     * Should the JSON data include metaData?
     */
    exportData?: boolean;
  }
  dot: {
    outputDir?: string; // default is "./dot"
    graphname?: string;
    lineLength?: number;
    graphVizSettings?: { [name: string]: string };
  }
  dotToSvg: {
    outputDir?: string; // default is "./svg"
    removeProlog?: boolean;
  }
  pdf: {
    outputDir?: string; // default is "./pdf"
  }
  /**
   * If an array is used: the processors that should be executed in order by the [[ArgdownApplication]]
   * during the current run.
   *
   * If a string is used: the name of the process to be found in [[IArgdownRequest.processes]] 
   * or a built-in process.
   */
  process?: string[] | string;
  /**
   * A dictionary of processes that can be run.
   *
   * Keys are the process names, values are list of IArgdownConfig-like objects.
   * 
   * There are only two differences to normal IArgdownConfig objects:
   * - the processes can not itself contain a processes field.
   * - the process field of the process has to be a name of a built-in-process or an array of processors to be run.
   */
  processes?: { [name: string]: IArgdownConfig };
  /**
   * Custom plugins that will be added before running the current process.
   * They will be removed again afterwards. 
   **/
  plugins?: [{plugin: IArgdownPlugin, processor:string}];
  /**
   * Log level for the Argdown logger
   *
   * Set to "verbose" to get lots of information about processors and plugins
   **/
  logLevel?: "error" | "warning" | "verbose"; // default is "error"
  /**
   * Should the application throw exceptions from plugins?
   */
  throwExceptions?: boolean; // default is false
  /**
   * Should exceptions thrown by plugins be logged?
   */
  logExceptions?: boolean; // default is true
  /**
   * You can add a custom logger here
   **/
  logger?: IArgdownLogger;
}
```
