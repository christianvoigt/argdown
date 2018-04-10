"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Argument = require("../model/Argument.js");

var _EquivalenceClass = require("../model/EquivalenceClass.js");

var _PluginWithSettings2 = require("./PluginWithSettings.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSONExport = function (_PluginWithSettings) {
    _inherits(JSONExport, _PluginWithSettings);

    function JSONExport(config) {
        _classCallCheck(this, JSONExport);

        var defaultSettings = {
            spaces: 2,
            removeEmbeddedRelations: false,
            exportMap: true,
            exportSections: true,
            exportTags: true
        };

        var _this = _possibleConstructorReturn(this, (JSONExport.__proto__ || Object.getPrototypeOf(JSONExport)).call(this, defaultSettings, config));

        _this.name = "JSONExport";
        return _this;
    }

    _createClass(JSONExport, [{
        key: "run",
        value: function run(request, response) {
            if (request.json) {
                this.config = request.json;
            } else if (request.JSONExport) {
                this.config = request.JSONExport;
            }
            var argdown = {
                arguments: response.arguments,
                statements: response.statements,
                relations: response.relations
            };
            if (this.settings.exportMap && response.map && response.map.nodes && response.map.edges) {
                argdown.map = {
                    nodes: response.map.nodes,
                    edges: response.map.edges
                };
            }
            if (this.settings.exportSections && response.sections) {
                argdown.sections = response.sections;
            }
            if (this.settings.exportTags && response.tags) {
                argdown.tags = response.tags;
            }
            var $ = this;
            response.json = JSON.stringify(argdown, function (key, value) {
                if ($.settings.removeEmbeddedRelations && key == "relations" && (this instanceof _Argument.Argument || this instanceof _EquivalenceClass.EquivalenceClass)) {
                    return undefined;
                }

                if (!$.settings.exportSections && key == "section" && (this instanceof _Argument.Argument || this instanceof _EquivalenceClass.EquivalenceClass)) {
                    return undefined;
                }

                return value;
            }, this.settings.spaces);
            return response;
        }
    }]);

    return JSONExport;
}(_PluginWithSettings2.PluginWithSettings);

module.exports = {
    JSONExport: JSONExport
};
//# sourceMappingURL=JSONExport.js.map