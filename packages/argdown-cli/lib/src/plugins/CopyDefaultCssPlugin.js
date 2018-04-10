"use strict";

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");


class CopyDefaultCssPlugin {
    constructor(config) {
        this.name = "CopyDefaultCssPlugin";
        this.defaults = _.defaultsDeep({}, config, {
            outputDir: "./html"
        });
    }
    getSettings(request) {
        if (!request.copyDefaultCss) {
            request.copyDefaultCss = {};
        }
        return request.copyDefaultCss;
    }
    prepare(request) {
        const settings = this.getSettings(request);
        _.defaultsDeep(settings, this.defaults);
        if (request.html && request.html.outputDir) {
            settings.outputDir = request.html.outputDir;
        } else if (request.saveAs && request.saveAs.outputDir) {
            settings.outputDir = request.saveAs.outputDir;
        }
    }
    async runAsync(request, response, logger) {
        const settings = this.getSettings(request);
        let rootPath = request.rootPath || process.cwd();
        let absoluteOutputDir = path.resolve(rootPath, settings.outputDir);
        await new Promise((resolve, reject) => {
            mkdirp(absoluteOutputDir, function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        let pathToDefaultCssFile = require.resolve("argdown-parser/lib/src/plugins/argdown.css");
        logger.log("verbose", "Copying default argdown.css to folder: " + absoluteOutputDir);
        const { COPYFILE_EXCL } = fs.constants;
        await new Promise((resolve, reject) => {
            fs.copyFile(pathToDefaultCssFile, path.resolve(absoluteOutputDir, "argdown.css"), COPYFILE_EXCL, err => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}
module.exports = {
    CopyDefaultCssPlugin: CopyDefaultCssPlugin
};
//# sourceMappingURL=CopyDefaultCssPlugin.js.map