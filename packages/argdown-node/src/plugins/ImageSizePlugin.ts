import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";
import { promisify } from "util";
import imageSize from "image-size";
import { ArgdownPluginError } from "@argdown/core";
import axios from "axios";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import { constants, promises as fs } from "fs";
import path from "path";
const imageSizeAsync = promisify(imageSize);

export class ImageSizePlugin implements IAsyncArgdownPlugin {
  name = "ImageSizePlugin";
  runAsync: IAsyncRequestHandler = async (request, _response, _logger) => {
    if (!request.images || !request.images.files) {
      return;
    }
    for (let image of Object.values(request.images!.files!)) {
      if (!image.path) {
        return;
      }
      try {
        let dimensions: ISizeCalculationResult | undefined;
        if (image.width && image.height) {
          // do not overwrite values
          continue;
        }
        if (image.path.startsWith("https:") || image.path.startsWith("http:")) {
          dimensions = await this.getSizeFromRemoteFile(image.path);
        } else {
          try {
            const baseDir =
              request.inputPath && !!path.extname(request.inputPath)
                ? path.dirname(request.inputPath)
                : request.inputPath || "";
            await fs.access(
              path.resolve(baseDir, image.path),
              constants.F_OK | constants.R_OK
            );
            dimensions = await imageSizeAsync(image.path);
          } catch (err) {
            dimensions = await this.getSizeFromRemoteFile(image.path);
          }
        }
        if (!dimensions) {
          continue;
        }
        image.width = dimensions.width;
        image.height = dimensions.height;
      } catch (err) {
        if (err instanceof Error) {
          throw new ArgdownPluginError(
            this.name,
            "image-size-failed",
            `'Getting the image size of '${image.path}' failed. ${err.message}`
          );
        }
      }
    }
  };
  getSizeFromRemoteFile = async (path: string) => {
    const response = await axios.get(path, {
      responseType: "arraybuffer"
    });
    const buffer = Buffer.from(response.data, "binary");
    return imageSize(buffer);
  };
}
