import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { checkResponseFields } from "../ArgdownPluginError";
import { stringifyArgdownData } from "../model/toJSON";
import { ArgdownTypes } from "../model/model";
import { IArgdownRequest } from "../index";
import defaultsDeep from "lodash.defaultsdeep";
import { mergeDefaults, isObject } from "../utils";

/**
 * Settings used by the JSONExportPlugin
 */
export interface IJSONSettings {
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
  outputDir?: string; // default is "./json"
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[JSONExportPlugin]]
     */
    json?: IJSONSettings;
  }
  interface IArgdownResponse {
    /**
     * JSON data
     *
     * Provided by the [[JSONExportPlugin]]
     */
    json?: string;
  }
}
const defaultSettings: IJSONSettings = {
  spaces: 2,
  removeEmbeddedRelations: false,
  exportMap: true,
  exportSections: true,
  exportTags: true,
  exportData: true
};
/**
 * Exports data in the response object to JSON.
 * The result ist stored in the [[IJSONResponse.json]] response object property.
 *
 * Note: The [[IArgdownResponse.ast]] object is not exported to JSON.
 *
 * Depends on data from: [[ModelPlugin]]
 * Can use data from: [[TagPlugin]], [[DataPlugin]], [[MapPlugin]]
 */
export class JSONExportPlugin implements IArgdownPlugin {
  name = "JSONExportPlugin";
  defaults: IJSONSettings;
  constructor(config?: IJSONSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest) {
    if (isObject(request.json)) {
      return request.json;
    } else {
      request.json = {};
      return request.json;
    }
  }
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, [
      "statements",
      "arguments",
      "relations"
    ]);

    const argdown: any = {
      arguments: response.arguments,
      statements: response.statements,
      relations: response.relations
    };
    const settings = this.getSettings(request);
    const mapResponse = response as { map?: { nodes?: any[]; edges?: any[] } };
    if (
      settings.exportMap &&
      mapResponse.map &&
      mapResponse.map.nodes &&
      mapResponse.map.edges
    ) {
      argdown.map = {
        nodes: mapResponse.map.nodes,
        edges: mapResponse.map.edges
      };
    }
    if (settings.exportSections && response.sections) {
      argdown.sections = response.sections;
    }
    if (settings.exportTags && response.tags) {
      argdown.tags = response.tags;
    }
    response.json = stringifyArgdownData(
      argdown,
      function(this: any, key, value) {
        if (!settings.exportData && key === "data") {
          return undefined;
        }
        if (
          settings.removeEmbeddedRelations &&
          key === "relations" &&
          value.type &&
          this &&
          (this.type === ArgdownTypes.ARGUMENT ||
            this.types === ArgdownTypes.EQUIVALENCE_CLASS)
        ) {
          return undefined;
        }

        if (
          !settings.exportSections &&
          key === "section" &&
          this &&
          this.type &&
          (this.type === ArgdownTypes.ARGUMENT ||
            this.types === ArgdownTypes.EQUIVALENCE_CLASS)
        ) {
          return undefined;
        }

        return value;
      },
      settings.spaces
    );
    return response;
  };
}
