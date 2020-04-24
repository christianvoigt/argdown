import { IRequestHandler, IArgdownPlugin } from "../IArgdownPlugin";
import { mergeDefaults, DefaultSettings, ensure, isObject } from "../utils";
import { checkResponseFields } from "../ArgdownPluginError";
import { IArgdownRequest } from "..";
import defaultsDeep from "lodash.defaultsdeep";

/**
 * Settings used by the WebComponentExportPlugin
 */
export interface IWebComponentExportSettings {
  width?: string;
  height?: string;
  initialView?: "map" | "source";
  withoutZoom?:boolean;
  withoutMaximize?:boolean;
  withoutLogo?:boolean;
  withoutHeader?:boolean;
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
declare module "../index" {
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
 * Generates the web component html that makes it possible to embed Argdown maps into html files.
 * The result ist stored in the [[IArgdownResponse.webComponent]] response object property.
 *
 * Depends on data from: [[DotToSvgExportPlugin]] or [[SyncDotSvgExportPlugin]] and [[HighlightSourcePlugin]]
 */
export class WebComponentExportPlugin implements IArgdownPlugin {
  name = "WebComponentExportPlugin";
  defaults: IWebComponentExportSettings;
  constructor(config?: IWebComponentExportSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
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
    let style = "";
    if(settings.width !==undefined){
      style += `width: ${settings.width};`;
    } 
    if(settings.height !== undefined){
      style += `height: ${settings.height};`;      
    }
    if(style !== ""){
      style = `style="${style}"`;
    }
    let withoutZoom = "";
    if(settings.withoutZoom){
      withoutZoom = `without-zoom="true"`;
    }
    let withoutMaximize = "";
    if(settings.withoutMaximize){
      withoutMaximize = `without-maximize="true"`;
    }
    let withoutLogo = "";
    if(settings.withoutLogo){
      withoutLogo = `without-logo="true"`;
    }
    let withoutHeader = "";
    if(settings.withoutHeader){
      withoutHeader = `without-header="true"`;
    }
    response.webComponent = `<argdown-map ${style} ${withoutZoom} ${withoutMaximize} ${withoutLogo} ${withoutHeader} initial-view="${settings.initialView}">${source}${map}</argdown-map>`;
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
