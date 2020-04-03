import {
  IArgdownPlugin,
  IRequestHandler,
  checkResponseFields,
  IArgdownRequest,
  mergeDefaults,
  isObject,
  ensure,
  DefaultSettings
} from "@argdown/core";
import * as _ from "lodash";

/**
 * Settings used by the WebComponentExportPlugin
 */
export interface IWebComponentExportSettings {
  initialView?: "map" | "source";
  views?: {
    map?: boolean;
    source?: boolean;
  };
  useArgVu?: boolean;
  createFigure?: boolean;
  figureCaption?: string;
  addWebComponentScript?: boolean;
  addGlobalStyles?: boolean;
  addWebComponentPolyfill?: boolean;
  webComponentScriptUrl?: string;
  noModuleScriptUrl?: string;
  globalStylesUrl?: string;
  webComponentPolyfill?: string;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    /**
     * Settings for the [[WebComponentExportPlugin]]
     */
    webComponent?: IWebComponentExportSettings;
  }
  interface IArgdownResponse {
    /**
     * JSON data
     *
     * Provided by the [[WebComponentExportPlugin]]
     */
    webComponent?: string;
  }
}
const defaultSettings: DefaultSettings<IWebComponentExportSettings> = {
  initialView: "map",
  views: ensure.object({
    map: true,
    source: true
  }),
  createFigure: true,
  useArgVu: false,
  addGlobalStyles: true,
  addWebComponentScript: true,
  addWebComponentPolyfill: true
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
export class WebComponentExportPlugin implements IArgdownPlugin {
  name = "WebComponentExportPlugin";
  defaults: IWebComponentExportSettings;
  constructor(config?: IWebComponentExportSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest) {
    if (isObject(request.webComponent)) {
      return request.webComponent;
    } else {
      request.webComponent = {};
      return request.webComponent;
    }
  }
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);

    const requiredResponseFields: string[] = [];
    if (settings?.views?.source) {
      requiredResponseFields.push("highlightedSource");
    }
    if (settings?.views?.map) {
      requiredResponseFields.push("svg");
    }
    checkResponseFields(this, response, requiredResponseFields);

    const map = settings?.views?.map
      ? `<div slot="map">${response.svg}</div>`
      : "";
    const source = settings?.views?.source
      ? `<div slot="source" class="${settings.useArgVu ? "argvu" : ""}">${
          response.highlightedSource
        }</div>`
      : "";
    response.webComponent = `<argdown-map initial-view="${settings.initialView}">${source}${map}</argdown-map>`;
    if (settings?.createFigure) {
      let figureCaption =
        settings.figureCaption || this.createFigureCaption(request);
      if (figureCaption && figureCaption !== "") {
        figureCaption = `<figcaption>${figureCaption}</figcaption>`;
      }
      response.webComponent = `<figure role="group" class="argdown-figure">${response.webComponent}${figureCaption}</figure>`;
    }
    if (settings.addWebComponentScript) {
      response.webComponent = `<script src="${settings.noModuleScriptUrl}" type="module"></script>
          <script type="text/javascript" nomodule src="${settings.noModuleScriptUrl}"></script>${response.webComponent}`;
    }
    if (settings.addWebComponentPolyfill) {
      response.webComponent = `<script src="${settings.webComponentPolyfill}" type="module"></script>${response.webComponent}`;
    }
    if (settings.addGlobalStyles) {
      response.webComponent = `<link rel="stylesheet" type="text/css" href="${settings.globalStylesUrl}">${response.webComponent}`;
    }
    return response;
  };
  createFigureCaption = (request: IArgdownRequest) => {
    if (request.title) {
      let caption = request.title;
      if (request.subTitle) {
        caption = `${request.title} — ${request.subTitle}`;
      }
      if (request.abstract) {
        caption = `${caption}: ${request.abstract}`;
      }
      return caption;
    } else if (request.abstract) {
      return request.abstract;
    }
    return "";
  };
}
