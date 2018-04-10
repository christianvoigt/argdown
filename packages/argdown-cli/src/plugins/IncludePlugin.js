import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
let path = require("path");
import * as _ from "lodash";

class IncludePlugin {
    constructor(config) {
        this.name = "IncludePlugin";
        this.defaults = _.defaultsDeep({}, config, {
            regEx: /@include\(([^\)]+)\)/g
        });
    }
    getSettings(request) {
        if (!request.include) {
            request.include = {};
        }
        return request.include;
    }
    prepare(request) {
        _.defaultsDeep(this.getSettings(request), this.defaults);
    }
    async runAsync(request, response) {
        if (!request.input || !request.inputPath) {
            return response;
        }
        const settings = this.getSettings(request);
        settings.regEx.lastIndex = 0;
        request.input = await this.replaceIncludesAsync(request.inputPath, request.input, settings.regEx, []);
        return response;
    }
    async replaceIncludesAsync(currentFilePath, str, regEx, filesAlreadyIncluded) {
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
                    strToInclude = "<!-- Include failed: File '" + absoluteFilePath + "' not found. -->\n";
                } else {
                    strToInclude = await this.replaceIncludesAsync(
                        absoluteFilePath,
                        strToInclude,
                        regEx,
                        filesAlreadyIncluded
                    );
                }
            }
            str = str.substr(0, match.index) + strToInclude + str.substr(match.index + match[0].length);
            regEx.lastIndex = match.index + strToInclude.length;
        }
        return str;
    }
}

module.exports = {
    IncludePlugin: IncludePlugin
};
