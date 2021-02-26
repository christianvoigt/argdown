import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";
import { ArgdownPluginError } from "@argdown/core";
import isSvg from "is-svg";
import imageType from "image-type";
import { imageUtils } from "./utils";
import path from "path";

export class GenerateDataUrlsPlugin implements IAsyncArgdownPlugin {
  name = "GenerateDataUrlsPlugin";
  runAsync: IAsyncRequestHandler = async (request, _response, _logger) => {
    if (
      !request.images ||
      !request.images.files ||
      !request.images.convertToDataUrls
    ) {
      return;
    }
    for (let image of Object.values(request.images!.files!)) {
      if (!image.path) {
        return;
      }
      try {
        const baseDir =
          request.inputPath && !!path.extname(request.inputPath)
            ? path.dirname(request.inputPath)
            : request.inputPath || "";
        const buffer = await imageUtils.getImage(image.path, baseDir);
        let mimeType = "";
        if (buffer) {
          if (isSvg(buffer)) {
            mimeType = "svg+xml";
          } else {
            const imageTypeResult = imageType(buffer);
            if (imageTypeResult) {
              mimeType = imageTypeResult.mime;
            } else {
              throw new Error("File is not an image.");
            }
          }
          const dataUrl = `data:${mimeType};base64,${buffer.toString(
            "base64"
          )}`;
          // const stringToReplace = new RegExp(image.path, "g");
          // response.svg = response.svg?.replace(stringToReplace, dataUrl);
          // logger.log("verbose", `dataUrl: ${dataUrl}`);
          image.dataUrl = dataUrl;
          // image.path = dataUrl;
        }
      } catch (err) {
        throw new ArgdownPluginError(
          this.name,
          "inline-image-generation-failed",
          `'Generating inline image of '${image.path}' failed. ${err.message}`
        );
      }
    }
  };
}
