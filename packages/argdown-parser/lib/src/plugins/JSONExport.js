"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _Argument = require("../model/Argument.js");

var _EquivalenceClass = require("../model/EquivalenceClass.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONExport = function () {
    function JSONExport(config) {
        _classCallCheck(this, JSONExport);

        var defaultSettings = {
            spaces: 2,
            removeEmbeddedRelations: false,
            exportMap: true,
            exportSections: true,
            exportTags: true
        };
        this.defaults = _.defaultsDeep({}, config, defaultSettings);
        this.name = "JSONExport";
    }

    _createClass(JSONExport, [{
        key: "getSettings",
        value: function getSettings(request) {
            if (request.json) {
                return request.json;
            } else if (request.JSONExport) {
                return request.JSONExport;
            } else {
                request.json = {};
                return request.json;
            }
        }
    }, {
        key: "prepare",
        value: function prepare(request) {
            _.defaultsDeep(this.getSettings(request), this.defaults);
        }
    }, {
        key: "run",
        value: function run(request, response) {
            var argdown = {
                arguments: response.arguments,
                statements: response.statements,
                relations: response.relations
            };
            var settings = this.getSettings(request);
            if (settings.exportMap && response.map && response.map.nodes && response.map.edges) {
                argdown.map = {
                    nodes: response.map.nodes,
                    edges: response.map.edges
                };
            }
            if (settings.exportSections && response.sections) {
                argdown.sections = response.sections;
            }
            if (settings.exportTags && response.tags && response.tagsDictionary) {
                argdown.tags = response.tags;
                argdown.tagsDictionary = response.tagsDictionary;
            }
            response.json = JSON.stringify(argdown, function (key, value) {
                if (settings.removeEmbeddedRelations && key == "relations" && (this instanceof _Argument.Argument || this instanceof _EquivalenceClass.EquivalenceClass)) {
                    return undefined;
                }

                if (!settings.exportSections && key == "section" && (this instanceof _Argument.Argument || this instanceof _EquivalenceClass.EquivalenceClass)) {
                    return undefined;
                }

                return value;
            }, settings.spaces);
            return response;
        }
    }]);

    return JSONExport;
}();

module.exports = {
    JSONExport: JSONExport
};
//# sourceMappingURL=JSONExport.js.map