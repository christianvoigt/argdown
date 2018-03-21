// We have to use a local file and let babel ignore it, until pdfkit is ported to ES6
const svg2png = require("svg2png");
var fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
import * as _ from 'lodash';

class SvgToPngExportPlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
                outputDir: "./png"
            };
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
        // enforce svg export
        this.settings.format = 'png';
    }
    constructor(config) {
        this.name = "SvgToPngExportPlugin";
        this.config = config;
    }
    async runAsync(request, response, logger) {
        if (request.svgToPng) {
            this.config = request.svgToPng;
        } else if (request.SvgToPngExportPlugin) {
            this.config = request.SvgToPngExportPlugin;
        }
        if (!response.svg) {
            return response;
        }
        let fileName = 'default';
        if (_.isFunction(this.settings.fileName)) {
            fileName = this.settings.fileName.call(this, request, response);
        } else if (_.isString(this.settings.fileName)) {
            fileName = this.settings.fileName;
        } else if (request.inputPath) {
            fileName = this.getFileName(request.inputPath);
        }
        const absoluteOutputDir = path.resolve(process.cwd(), this.settings.outputDir);
        const filePath = absoluteOutputDir + '/' + fileName + '.png';
        const settings = this.settings;
        await new Promise((resolve, reject)=>{
            mkdirp(absoluteOutputDir, function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        const options = {};
        if (settings.width) {
            options.width = settings.width;
        }
        if (settings.height) {
            options.height = settings.height;
        }
        const outputBuffer = await svg2png(response.svg, options);
        await new Promise((resolve, reject)=>{
            fs.writeFile(filePath, outputBuffer, function (err) {
                if (err) {
                    reject(err);
                }
                logger.log("verbose", "Saved " + filePath);
                resolve();
            });
        });
        return response;
    }
    getFileName(file) {
        let extension = path.extname(file);
        return path.basename(file, extension);
    }
}
module.exports = {
    SvgToPngExportPlugin: SvgToPngExportPlugin
}
