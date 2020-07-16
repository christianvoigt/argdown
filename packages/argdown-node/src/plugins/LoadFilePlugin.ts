import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";
import { ArgdownPluginError } from "@argdown/core";
import { promisify } from "util";

import { readFile } from "fs";

const readFileAsync = promisify(readFile);

export class LoadFilePlugin implements IAsyncArgdownPlugin {
  name = "LoadFilePlugin";
  runAsync: IAsyncRequestHandler = async (request, _response, logger) => {
    const file = request.inputPath;
    if (!file) {
      throw new ArgdownPluginError(
        this.name,
        "missing-inputPath-request-field",
        "No inputPath field in request object."
      );
    }
    let input: string;
    try {
      input = await readFileAsync(file, "utf8");
    } catch (e) {
      throw new ArgdownPluginError(
        this.name,
        "file-not-found",
        `'${file}' not found.`
      );
    }
    logger.log(
      "verbose",
      "[LoadFilePlugin]: Reading file completed, starting processing: " + file
    );
    request.input = input;
  };
}
