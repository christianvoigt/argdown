let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
import * as _ from "lodash";

class SaveAsFilePlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
                dataKey: "test",
                extension: ".txt",
                outputDir: "./output"
            };
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
    }
    constructor(config) {
        this.name = "SaveAsFilePlugin";
        this.config = config;
    }
    async runAsync(request, response, logger) {
        if (request.saveAs) {
            this.config = request.saveAs;
        } else if (request.SaveAsFilePlugin) {
            this.config = request.SaveAsFilePlugin;
        }

        let fileContent = !this.settings.isRequestData
            ? response[this.settings.dataKey]
            : request[this.settings.dataKey];
        if (!_.isEmpty(fileContent) && _.isString(fileContent)) {
            let fileName = "default";
            if (_.isFunction(this.settings.fileName)) {
                fileName = this.settings.fileName.call(this, request, response);
            } else if (_.isString(this.settings.fileName)) {
                fileName = this.settings.fileName;
            } else if (request.inputPath) {
                fileName = this.getFileName(request.inputPath);
            }
            let outputDir = this.settings.outputDir;
            const dataSettings = !this.settings.isRequestData
                ? request[this.settings.dataKey]
                : null;
            if (dataSettings && dataSettings.outputDir) {
                outputDir = dataSettings.outputDir;
            }
            await this.saveAsFile(
                fileContent,
                outputDir,
                fileName,
                this.settings.extension,
                logger
            );
        }
    }
    getFileName(file) {
        let extension = path.extname(file);
        return path.basename(file, extension);
    }
    async saveAsFile(data, outputDir, fileName, extension, logger) {
        let absoluteOutputDir = path.resolve(process.cwd(), outputDir);
        await new Promise((resolve, reject) => {
            mkdirp(absoluteOutputDir, function(err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        await new Promise((resolve, reject) => {
            fs.writeFile(
                absoluteOutputDir + "/" + fileName + extension,
                data,
                function(err) {
                    if (err) {
                        reject(err);
                    }
                    logger.log(
                        "verbose",
                        "Saved " +
                            absoluteOutputDir +
                            "/" +
                            fileName +
                            extension
                    );
                    resolve();
                }
            );
        });
    }
}

module.exports = {
    SaveAsFilePlugin: SaveAsFilePlugin
};
