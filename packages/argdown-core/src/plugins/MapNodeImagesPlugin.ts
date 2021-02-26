import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { checkResponseFields } from "../ArgdownPluginError";
import { mergeDefaults, isObject, DefaultSettings, ensure } from "../utils";
import { IArgdownRequest, IArgdownResponse } from "../index";
import { IMapNode, ArgdownTypes, HasData } from "../model/model";
import defaultsDeep from "lodash.defaultsdeep";

/**
 * The settings for the [[MapNodeImagesPlugin]].
 */
export interface IImagesSettings {
  useData?: boolean;
  useTags?: boolean;
  convertToDataUrls?: boolean;
  files?: {
    [id: string]: {
      path: string;
      width?: number;
      height?: number;
      dataUrl?: string;
    };
  };
}
declare module "../index" {
  interface IArgdownRequest {
    /**
     * Settings for the [[MapPlugin]]
     **/
    images?: IImagesSettings;
  }
}
const defaultSettings: DefaultSettings<IImagesSettings> = {
  useData: true,
  useTags: true,
  convertToDataUrls: false,
  files: ensure.object({})
};

/**
 * The MapNodeImagesPlugin adds image ids or urls to map nodes. This image data can come from
 *
 *    a) "images" lists in argument or statement metadata
 *    b) tag configuration data
 *
 * If there is no entry in "images/files" for the used string,
 * this plugin creates one and assumes that the string is the image file's url.
 *
 * This allows the user to either create a central list of image files with short ids
 * or simply directly write the image url into the items metadata.
 *
 * This plugin depends on the results from the [[MapPlugin]].
 */
export class MapNodeImagesPlugin implements IArgdownPlugin {
  name = "MapNodeImagesPlugin";
  defaults: IImagesSettings;
  constructor(config?: IImagesSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): IImagesSettings => {
    if (!isObject(request.images)) {
      request.images = {};
    }
    return request.images;
  };
  prepare: IRequestHandler = (request, _) => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, [
      "statements",
      "arguments",
      "relations",
      "map"
    ]);
    const settings = this.getSettings(request);
    for (let node of response.map!.nodes) {
      if (settings.useData) {
        node.images = this.getImagesFromData(response, node);
      }
      if (settings.useTags) {
        const fromTags = this.getImagesFromTags(settings, node);
        if (fromTags) {
          node.images = node.images || [];
          node.images.push(...fromTags);
        }
      }
      if (!node.images) {
        continue;
      }
      // if this image does not already have an entry in the settings, create one
      settings.files = node.images.reduce((files, currImg) => {
        if (!files[currImg]) {
          files[currImg] = { path: currImg }; // assume that this is a path/url
        }
        return files;
      }, settings.files!);
    }
    return response;
  };
  getImagesFromData = (response: IArgdownResponse, node: IMapNode) => {
    let dataOwner: HasData | null = null;
    if (node.type == ArgdownTypes.ARGUMENT_MAP_NODE) {
      dataOwner = response.arguments![node.title!];
    } else if (node.type == ArgdownTypes.STATEMENT_MAP_NODE) {
      dataOwner = response.statements![node.title!];
    }
    if (
      dataOwner &&
      dataOwner.data &&
      dataOwner.data["images"] &&
      Array.isArray(dataOwner.data["images"])
    ) {
      return [...dataOwner.data["images"]];
    }
    return undefined;
  };
  getImagesFromTags = (settings: IImagesSettings, node: IMapNode) => {
    if (!settings.files || !node.tags) {
      return undefined;
    }
    return node.tags.reduce((images, currTag) => {
      const fileData = settings.files![currTag];
      if (fileData) {
        images.push(currTag);
      }
      return images;
    }, [] as string[]);
  };
}
