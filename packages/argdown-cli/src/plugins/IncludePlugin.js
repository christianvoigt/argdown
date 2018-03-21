import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
let path = require("path");
import * as _ from "lodash";

class IncludePlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
                regEx: /@include\(([^\)]+)\)/g
            };
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
    }
    constructor(config) {
        this.name = "IncludePlugin";
        this.config = config;
    }
    async runAsync(request, response) {
        if (request.include) {
            this.config = request.include;
        }
        if (!request.input || !request.inputPath) {
            return response;
        }
        request.input = await this.replaceIncludesAsync(
            request.inputPath,
            request.input,
            this.settings.regEx,
            []
        );
        return response;
    }
    async replaceIncludesAsync(
        currentFilePath,
        str,
        regEx,
        filesAlreadyIncluded
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
                strToInclude = await readFile(absoluteFilePath, "utf8");
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

module.exports = {
    IncludePlugin: IncludePlugin
};
