"use strict";

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");


class SaveAsFilePlugin {
    constructor(config) {
        this.name = "SaveAsFilePlugin";
        this.defaults = _.defaultsDeep({}, config, {
            dataKey: "test",
            extension: ".txt",
            outputDir: "./output"
        });
    }
    // there can be several instances of this plugin in the same ArgdownApplication
    // Because of this, we can not add the instance default settings to the request object as in other plugins
    // Instead we have to add it each time the getSettings method is called to avoid keeping request specific state
    getSettings(request) {
        let settings = {};
        if (request.saveAs) {
            settings = request.saveAs;
        } else if (request.SaveAsFilePlugin) {
            settings = request.SaveAsFilePlugin;
        }
        settings = _.defaultsDeep({}, settings, this.defaults);
        return settings;
    }
    async runAsync(request, response, logger) {
        const settings = this.getSettings(request);
        let fileContent = !settings.isRequestData ? response[settings.dataKey] : request[settings.dataKey];
        if (!_.isEmpty(fileContent) && _.isString(fileContent)) {
            let fileName = "default";
            if (_.isFunction(settings.fileName)) {
                fileName = settings.fileName.call(this, request, response);
            } else if (_.isString(settings.fileName)) {
                fileName = settings.fileName;
            } else if (request.inputPath) {
                fileName = this.getFileName(request.inputPath);
            }
            let outputDir = settings.outputDir;
            const dataSettings = !settings.isRequestData ? request[settings.dataKey] : null;
            if (dataSettings && dataSettings.outputDir) {
                outputDir = dataSettings.outputDir;
            }
            await this.saveAsFile(fileContent, outputDir, fileName, settings.extension, logger);
        }
    }
    getFileName(file) {
        let extension = path.extname(file);
        return path.basename(file, extension);
    }
    async saveAsFile(data, outputDir, fileName, extension, logger) {
        let absoluteOutputDir = path.resolve(process.cwd(), outputDir);
        await new Promise((resolve, reject) => {
            mkdirp(absoluteOutputDir, function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        await new Promise((resolve, reject) => {
            fs.writeFile(absoluteOutputDir + "/" + fileName + extension, data, function (err) {
                if (err) {
                    reject(err);
                }
                logger.log("verbose", "Saved " + absoluteOutputDir + "/" + fileName + extension);
                resolve();
            });
        });
    }
}

module.exports = {
    SaveAsFilePlugin: SaveAsFilePlugin
};
//# sourceMappingURL=SaveAsFilePlugin.js.map