"use strict";

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//const puppeteer = require("puppeteer");
const sharp = require("sharp");
var fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");


class SvgToPngExportPlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
                outputDir: "./png",
                density: 300
            };
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
        // enforce svg export
        this.settings.format = "png";
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
        let fileName = "default";
        if (_.isFunction(this.settings.fileName)) {
            fileName = this.settings.fileName.call(this, request, response);
        } else if (_.isString(this.settings.fileName)) {
            fileName = this.settings.fileName;
        } else if (request.inputPath) {
            fileName = this.getFileName(request.inputPath);
        }
        const absoluteOutputDir = path.resolve(process.cwd(), this.settings.outputDir);
        const filePath = absoluteOutputDir + "/" + fileName + ".png";
        const settings = this.settings;

        // Graphviz svg font sizes are missing a size format (font-size="10.00") and are interpreted by sharp (librsvg) as pixel sizes.
        // Because of this if density is increased, Sharp (librsvg) will not scale the text with the rest of the image.
        // To avoid this we have to change all font-sizes to explicit point sizes.
        // Normally 10px should be converted to 7.5pt and 8px should be converted to 6pt
        // For some unknown reason this leads to wrong results
        // Instead 10px has to be convertd to 9pt and 8px has to be converted to 7.5pt to obtain satisfactory results.
        let convertedSvg = response.svg;
        convertedSvg = this.replaceAll(convertedSvg, 'font-size="10.00"', 'font-size="9pt"');
        convertedSvg = this.replaceAll(convertedSvg, 'font-size="8.00"', 'font-size="7.5pt"');

        await new Promise((resolve, reject) => {
            mkdirp(absoluteOutputDir, function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        if (settings.width && settings.height) {
            await sharp(new Buffer(convertedSvg), { density: settings.density }).resize(settings.width, settings.height).max().png().toFile(filePath);
        } else {
            await sharp(new Buffer(convertedSvg), { density: settings.density }).png().toFile(filePath);
        }
        // const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // const htmlString = `<html><head></head><body><div id='map'>${
        //     response.svg
        // }</div></body></html>`;
        // await page.setContent(htmlString);

        // const rect = await page.evaluate(selector => {
        //     const element = document.querySelector("#map");
        //     if (!element) return null;
        //     return element.getBoundingClientRect();
        // }, selector);
        // await page.screenshot({
        //     path: filePath,
        //     clip: rect
        // });
        return response;
    }
    getFileName(file) {
        let extension = path.extname(file);
        return path.basename(file, extension);
    }
    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, "g"), replace);
    }
}
module.exports = {
    SvgToPngExportPlugin: SvgToPngExportPlugin
};
//# sourceMappingURL=SvgToPngExportPlugin.js.map