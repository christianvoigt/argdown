import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler,
  IArgdownRequest,
  AsyncArgdownApplication,
  SaveAsFilePlugin,
  StdOutPlugin
} from "@argdown/node";
import {
  isObject,
  mergeDefaults,
  IRequestHandler,
  checkResponseFields
} from "@argdown/core";
import { from } from "svg-to-img";
import defaultsDeep from "lodash.defaultsdeep";

export interface IImageExportPluginSettings {
  format?: "png" | "jpg" | "webp";
  directory?: string;
  quality?: number;
  width?: number;
  height?: number;
  background?: string;
  encoding?: "base64" | "utf8" | "binary" | "hex";
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    /**
     * Settings for the [[ImageExportPlugin]]
     **/
    image?: IImageExportPluginSettings;
  }
  interface IArgdownResponse {
    /**
     * Data of the [[ImageExportPlugin]]
     **/
    png?: String | Buffer;
    jpg?: String | Buffer;
    webp?: String | Buffer;
  }
}
const defaultSettings: IImageExportPluginSettings = {
  format: "png",
  quality: 1,
  background: "#FFFFFF"
};
export class ImageExportPlugin implements IAsyncArgdownPlugin {
  name: string = "ImageExportPlugin";
  defaults: IImageExportPluginSettings = {};
  constructor(config?: IImageExportPluginSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
    this.name = "ImageExportPlugin";
  }
  getSettings = (request: IArgdownRequest) => {
    if (!isObject(request.image)) {
      request.image = {};
    }
    return request.image;
  };
  prepare: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, ["svg"]);
    mergeDefaults(this.getSettings(request), this.defaults);
  };

  runAsync: IAsyncRequestHandler = async (request, response) => {
    const settings = this.getSettings(request);
    if (settings.format == "png") {
      response.png = await from(response.svg!).toPng(settings);
    } else if (settings.format == "jpg") {
      response.jpg = await from(response.svg!).toJpeg(settings);
    } else if (settings.format == "webp") {
      response.webp = await from(response.svg!).toWebp(settings);
    }
  };
}
export const installImageExport = (argdown: AsyncArgdownApplication) => {
  argdown.addPlugin(new ImageExportPlugin({ format: "png" }), "export-png");
  argdown.addPlugin(new ImageExportPlugin({ format: "jpg" }), "export-jpg");
  argdown.addPlugin(new ImageExportPlugin({ format: "webp" }), "export-webp");
  argdown.addPlugin(
    new SaveAsFilePlugin({
      dataKey: "png",
      extension: ".png",
      outputDir: "./images"
    }),
    "save-as-png"
  );
  argdown.addPlugin(
    new SaveAsFilePlugin({
      dataKey: "jpg",
      extension: ".jpg",
      outputDir: "./images"
    }),
    "save-as-jpg"
  );
  argdown.addPlugin(
    new SaveAsFilePlugin({
      dataKey: "webp",
      extension: ".webp",
      outputDir: "./images"
    }),
    "save-as-webp"
  );
  argdown.addPlugin(new StdOutPlugin({ dataKey: "png" }), "stdout-png");
  argdown.addPlugin(new StdOutPlugin({ dataKey: "jpg" }), "stdout-jpg");
  argdown.addPlugin(new StdOutPlugin({ dataKey: "webp" }), "stdout-webp");
};
