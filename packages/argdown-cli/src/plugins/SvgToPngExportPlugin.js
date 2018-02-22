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
    run(data, logger) {
        if (data.config) {
            if (data.config.svgToPng) {
                this.config = data.config.svgToPng;
            } else if (data.config.SvgToPngExportPlugin) {
                this.config = data.config.SvgToPngExportPlugin;
            }
        }
        if (!data.svg) {
            return data;
        }
        let fileName = 'default';
        if (_.isFunction(this.settings.fileName)) {
            fileName = this.settings.fileName.call(this, data);
        } else if (_.isString(this.settings.fileName)) {
            fileName = this.settings.fileName;
        } else if (data.inputFile) {
            fileName = this.getFileName(data.inputFile);
        }
        const absoluteOutputDir = path.resolve(process.cwd(), this.settings.outputDir);
        const filePath = absoluteOutputDir + '/' + fileName + '.png';
        const settings = this.settings;
        mkdirp(absoluteOutputDir, function (err) {
            if (err) {
                logger.log("error", err);
            } else {
                const options = {};
                if(settings.width){
                    options.width = settings.width;
                }
                if(settings.height){
                    options.height = settings.height;
                }
                const outputBuffer = svg2png.sync(data.svg, options);
                fs.writeFile(filePath, outputBuffer, function (err) {
                    if (err) {
                        logger.log("error", err);
                    }
                    logger.log("verbose", "Saved " + filePath);
                });
            }
        });
        return data;
    }
    getFileName(file) {
        let extension = path.extname(file);
        return path.basename(file, extension);
    }
}
module.exports = {
    SvgToPngExportPlugin: SvgToPngExportPlugin
}
