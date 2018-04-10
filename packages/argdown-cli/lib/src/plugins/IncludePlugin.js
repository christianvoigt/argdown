"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _util = require("util");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readFile = (0, _util.promisify)(_fs2.default.readFile);
let path = require("path");


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
        while (match = regEx.exec(str)) {
            const absoluteFilePath = path.resolve(directoryPath, match[1]);
            let strToInclude = "";
            if (_.includes(filesAlreadyIncluded, absoluteFilePath)) {
                strToInclude = "<!-- Include failed: File '" + absoluteFilePath + "' already included. To avoid infinite loops, each file can only be included once. -->";
            } else {
                filesAlreadyIncluded.push(absoluteFilePath);
                strToInclude = await readFile(absoluteFilePath, "utf8");
                if (strToInclude == null) {
                    strToInclude = "<!-- Include failed: File '" + absoluteFilePath + "' not found. -->\n";
                } else {
                    strToInclude = await this.replaceIncludesAsync(absoluteFilePath, strToInclude, regEx, filesAlreadyIncluded);
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
//# sourceMappingURL=IncludePlugin.js.map