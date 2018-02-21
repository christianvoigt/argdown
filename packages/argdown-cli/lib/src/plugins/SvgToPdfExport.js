'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _svgToPdfkit = require('svg-to-pdfkit');

var _svgToPdfkit2 = _interopRequireDefault(_svgToPdfkit);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// We have to use a local file and let babel ignore it, until pdfkit is ported to ES6
var PDFDocument = require('../pdfkit.js');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var SvgToPdfExport = function () {
    _createClass(SvgToPdfExport, [{
        key: 'config',
        set: function set(config) {
            var previousSettings = this.settings;
            if (!previousSettings) {
                previousSettings = {
                    outputDir: "./pdf"
                };
            }
            this.settings = _.defaultsDeep({}, config, previousSettings);
            // enforce svg export
            this.settings.format = 'svg';
        }
    }]);

    function SvgToPdfExport(config) {
        _classCallCheck(this, SvgToPdfExport);

        this.name = "SvgToPdfExport";
        this.config = config;
    }

    _createClass(SvgToPdfExport, [{
        key: 'run',
        value: function run(data, logger) {
            if (data.config) {
                if (data.config.svgToPdf) {
                    this.config = data.config.svgToPdf;
                } else if (data.config.SvgToPdfExport) {
                    this.config = data.config.SvgToPdfExport;
                }
            }
            if (!data.svg) {
                return data;
            }
            var fileName = 'default';
            if (!_.isEmpty(this.settings.sourceFile) && _.isString(this.settings.sourceFile)) {
                fileName = this.getFileName(this.settings.sourceFile);
            } else if (_.isFunction(this.settings.fileName)) {
                fileName = this.settings.fileName.call(this, data);
            } else if (_.isString(this.settings.fileName)) {
                fileName = this.settings.fileName;
            } else if (data.config && data.config.input) {
                fileName = this.getFileName(data.config.input);
            }
            var absoluteOutputDir = path.resolve(process.cwd(), this.settings.outputDir);
            var filePath = absoluteOutputDir + '/' + fileName + '.pdf';
            var settings = this.settings;
            mkdirp(absoluteOutputDir, function (err) {
                if (err) {
                    logger.log("error", err);
                } else {
                    var doc = new PDFDocument(settings);
                    doc.pipe(fs.createWriteStream(filePath));
                    (0, _svgToPdfkit2.default)(doc, data.svg, 0, 0, settings);
                    doc.end();
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

    return SvgToPdfExport;
}();

module.exports = {
    SvgToPdfExport: SvgToPdfExport
};
//# sourceMappingURL=SvgToPdfExport.js.map