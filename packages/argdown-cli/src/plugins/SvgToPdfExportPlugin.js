// We have to use a local file and let babel ignore it, until pdfkit is ported to ES6
var PDFDocument = require('../pdfkit.js');
var fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
import SVGtoPDF from 'svg-to-pdfkit';
import * as _ from 'lodash';

class SvgToPdfExportPlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
                outputDir: "./pdf"
            };
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
        // enforce svg export
        this.settings.format = 'svg';
    }
    constructor(config) {
        this.name = "SvgToPdfExportPlugin";
        this.config = config;
    }
    run(data, logger) {
        if (data.config) {
            if (data.config.svgToPdf) {
                this.config = data.config.svgToPdf;
            } else if (data.config.SvgToPdfExportPlugin) {
                this.config = data.config.SvgToPdfExportPlugin;
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
        const filePath = absoluteOutputDir + '/' + fileName + '.pdf';
        const settings = this.settings;
        mkdirp(absoluteOutputDir, function (err) {
            if (err) {
                logger.log("error", err);
            } else {
                var doc = new PDFDocument(settings);
                doc.pipe(fs.createWriteStream(filePath));
                SVGtoPDF(doc, data.svg, 0, 0, settings);
                doc.end();
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
    SvgToPdfExportPlugin: SvgToPdfExportPlugin
}
