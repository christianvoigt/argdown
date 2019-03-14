import * as fs from "fs";
import { promisify } from "util";

const readFileAsync = promisify(fs.readFile);
let path = require("path");
import * as _ from "lodash";
import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";
import {
  IArgdownRequest,
  IRequestHandler,
  ArgdownPluginError
} from "@argdown/core";

export interface IIncludeSettings {
  regEx?: RegExp;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    /**
     * Settings for the [[IncludePlugin]]
     */
    include?: IIncludeSettings;
  }
}
export class IncludePlugin implements IAsyncArgdownPlugin {
  name = "IncludePlugin";
  defaults: IIncludeSettings;
  constructor(config?: IIncludeSettings) {
    this.defaults = _.defaultsDeep({}, config, {
      regEx: /@include\(([^\)]+)\)/g
    });
  }
  getSettings = (request: IArgdownRequest): IIncludeSettings => {
    request.include = request.include || {};
    return request.include;
  };
  prepare: IRequestHandler = request => {
    _.defaultsDeep(this.getSettings(request), this.defaults);
  };
  runAsync: IAsyncRequestHandler = async request => {
    if (!request.input) {
      throw new ArgdownPluginError(
        this.name,
        "missing-input-request-field",
        "Missing input."
      );
    }
    if (!request.inputPath) {
      throw new ArgdownPluginError(
        this.name,
        "missing-inputPath-request-field",
        "Missing input path."
      );
    }
    const settings = this.getSettings(request);
    settings.regEx!.lastIndex = 0;
    request.input = await this.replaceIncludesAsync(
      request.inputPath!,
      request.input!,
      settings.regEx!,
      []
    );
  };
  async replaceIncludesAsync(
    currentFilePath: string,
    str: string,
    regEx: RegExp,
    filesAlreadyIncluded: string[]
  ) {
    let match = null;
    const directoryPath = path.dirname(currentFilePath);
    regEx.lastIndex = 0;
    while ((match = regEx.exec(str))) {
      const absoluteFilePath = path.resolve(directoryPath, match[1]);
      let strToInclude = "";
      if (_.includes(filesAlreadyIncluded, absoluteFilePath)) {
        strToInclude =
          "<!-- Include failed: File '" +
          absoluteFilePath +
          "' already included. To avoid infinite loops, each file can only be included once. -->";
      } else {
        filesAlreadyIncluded.push(absoluteFilePath);
        strToInclude = await readFileAsync(absoluteFilePath, "utf8");
        if (strToInclude == null) {
          strToInclude =
            "<!-- Include failed: File '" +
            absoluteFilePath +
            "' not found. -->\n";
        } else {
          strToInclude = await this.replaceIncludesAsync(
            absoluteFilePath,
            strToInclude,
            regEx,
            filesAlreadyIncluded
          );
        }
      }
      str =
        str.substr(0, match.index) +
        strToInclude +
        str.substr(match.index + match[0].length);
      regEx.lastIndex = match.index + strToInclude.length;
    }
    return str;
  }
}
