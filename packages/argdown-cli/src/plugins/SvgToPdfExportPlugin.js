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
    async runAsync(request, response) {
        if (request.svgToPdf) {
            this.config = request.svgToPdf;
        } else if (request.SvgToPdfExportPlugin) {
            this.config = request.SvgToPdfExportPlugin;
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
        const filePath = absoluteOutputDir + '/' + fileName + '.pdf';
        const settings = this.settings;
        await new Promise((resolve, reject)=>{
            mkdirp(absoluteOutputDir, function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        var doc = new PDFDocument(settings);
        SVGtoPDF(doc, response.svg, 0, 0, settings);
        await this.savePdfToFile(doc, filePath);
        return response;
    }
    // https://github.com/devongovett/pdfkit/issues/265
    async savePdfToFile(pdf, fileName) {
        return new Promise((resolve) => {

            // To determine when the PDF has finished being written successfully 
            // we need to confirm the following 2 conditions:
            //
            //   1. The write stream has been closed
            //   2. PDFDocument.end() was called syncronously without an error being thrown

            let pendingStepCount = 2;

            const stepFinished = () => {
                if (--pendingStepCount == 0) {
                    resolve();
                }
            };

            const writeStream = fs.createWriteStream(fileName);
            writeStream.on('close', stepFinished);
            pdf.pipe(writeStream);

            pdf.end();

            stepFinished();
        });
    }
    getFileName(file) {
        let extension = path.extname(file);
        return path.basename(file, extension);
    }
}
module.exports = {
    SvgToPdfExportPlugin: SvgToPdfExportPlugin
}
