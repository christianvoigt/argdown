import { IAsyncArgdownPlugin, IAsyncRequestHandler } from "../IAsyncArgdownPlugin";
import { ArgdownPluginError } from "@argdown/core";
import { promisify } from "util";

import { readFile } from "fs";

const readFileAsync = promisify(readFile);

export class LoadFilePlugin implements IAsyncArgdownPlugin {
  name = "LoadFilePlugin";
  runAsync: IAsyncRequestHandler = async (request, _response, logger) => {
    const file = request.inputPath;
    if (!file) {
      throw new ArgdownPluginError(this.name, "No inputPath field in request object.");
    }
    const input = await readFileAsync(file, "utf8");
    logger.log("verbose", "[LoadFilePlugin]: Reading file completed, starting processing: " + file);
    request.input = input;
  };
}
