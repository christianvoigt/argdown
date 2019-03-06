import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IArgdownRequest, ISelectionSettings } from "../index";
import { IEquivalenceClass, IArgument, ArgdownTypes } from "../model/model";
import { mergeDefaults, isObject } from "../utils";
export interface ISelection {
  statements: IEquivalenceClass[];
  arguments: IArgument[];
}
import defaultsDeep from "lodash.defaultsdeep";

declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[PreselectionPlugin]]
     **/
    selection?: ISelectionSettings;
  }
  interface IArgdownResponse {
    /**
     * Argument map data provided by the [[PreselectionPlugin]] and other plugins providing further selection methods.
     *
     */
    selection?: ISelection;
  }
}
const defaultSettings: ISelectionSettings = {
  selectElementsWithoutSection: false,
  selectElementsWithoutTag: false,
  ignoreIsInMap: false
};

/**
 * Creates the selection response field and populates it with statements and arguments filtered by:
 *
 * - selected tags
 * - selected sections
 * - isInMap flags
 * - excluded statements
 * - excluded arguments
 *
 * This plugin should be run before any other selection plugins and before the [[MapPlugin]].
 **/
export class PreselectionPlugin implements IArgdownPlugin {
  name = "PreselectionPlugin";
  defaults: ISelectionSettings;
  constructor(config?: ISelectionSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): ISelectionSettings => {
    if (isObject(request.selection)) {
      return request.selection;
    } else {
      request.selection = {};
      return request.selection;
    }
  };
  prepare: IRequestHandler = (request, response) => {
    if (!response.statements) {
      throw new ArgdownPluginError(
        this.name,
        "No statements field in response."
      );
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(
        this.name,
        "No arguments field in response."
      );
    }
    if (!response.relations) {
      throw new ArgdownPluginError(
        this.name,
        "No relations field in response."
      );
    }
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);
    const selection: ISelection = { statements: [], arguments: [] };

    selection.statements = Object.keys(response.statements!)
      .map<IEquivalenceClass>(title => response.statements![title])
      .filter(isPreselected(settings));
    selection.arguments = Object.keys(response.arguments!)
      .map<IArgument>(title => response.arguments![title])
      .filter(isPreselected(settings));
    response.selection = selection;
  };
}

const isPreselected = (settings: ISelectionSettings) => (
  el: IEquivalenceClass | IArgument
) => {
  const isInMap =
    settings.ignoreIsInMap ||
    (!el.data || el.data.isInMap === undefined || el.data.isInMap === true);
  if (!isInMap) {
    return false;
  }
  let includeElement = false;
  if (el.type === ArgdownTypes.ARGUMENT) {
    includeElement =
      !settings.excludeArguments ||
      settings.excludeArguments.indexOf(el.title!) === -1;
  } else {
    includeElement =
      !settings.excludeStatements ||
      settings.excludeStatements.indexOf(el.title!) === -1;
  }
  if (!includeElement) {
    return false;
  }

  const sectionSelected =
    !settings.selectedSections ||
    (!el.section && settings.selectElementsWithoutSection === true) ||
    (el.section && settings.selectedSections.indexOf(el.section!.title!) > -1);
  if (!sectionSelected) {
    return false;
  }
  const tagSelected =
    !settings.selectedTags ||
    (settings.selectElementsWithoutTag === true &&
      (!el.tags || el.tags.length === 0)) ||
    (el.tags && el.tags.find(t => settings.selectedTags!.indexOf(t) > -1));
  return tagSelected;
};
