'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// We have to use a local file and let babel ignore it, until pdfkit is ported to ES6
var svg2png = require("svg2png");
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var SvgToPngExportPlugin = function () {
    _createClass(SvgToPngExportPlugin, [{
        key: 'config',
        set: function set(config) {
            var previousSettings = this.settings;
            if (!previousSettings) {
                previousSettings = {
                    outputDir: "./png"
                };
            }
            this.settings = _.defaultsDeep({}, config, previousSettings);
            // enforce svg export
            this.settings.format = 'png';
        }
    }]);

    function SvgToPngExportPlugin(config) {
        _classCallCheck(this, SvgToPngExportPlugin);

        this.name = "SvgToPngExportPlugin";
        this.config = config;
    }

    _createClass(SvgToPngExportPlugin, [{
        key: 'run',
        value: function run(data, logger) {
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
            var fileName = 'default';
            if (_.isFunction(this.settings.fileName)) {
                fileName = this.settings.fileName.call(this, data);
            } else if (_.isString(this.settings.fileName)) {
                fileName = this.settings.fileName;
            } else if (data.inputFile) {
                fileName = this.getFileName(data.inputFile);
            }
            var absoluteOutputDir = path.resolve(process.cwd(), this.settings.outputDir);
            var filePath = absoluteOutputDir + '/' + fileName + '.png';
            var settings = this.settings;
            mkdirp(absoluteOutputDir, function (err) {
                if (err) {
                    logger.log("error", err);
                } else {
                    var options = {};
                    if (settings.width) {
                        options.width = settings.width;
                    }
                    if (settings.height) {
                        options.height = settings.height;
                    }
                    var outputBuffer = svg2png.sync(data.svg, options);
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
    }, {
        key: 'getFileName',
        value: function getFileName(file) {
            var extension = path.extname(file);
            return path.basename(file, extension);
        }
    }]);

    return SvgToPngExportPlugin;
}();

module.exports = {
    SvgToPngExportPlugin: SvgToPngExportPlugin
};
//# sourceMappingURL=SvgToPngExportPlugin.js.map