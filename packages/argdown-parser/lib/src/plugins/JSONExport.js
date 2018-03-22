'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _Argument = require('../model/Argument.js');

var _EquivalenceClass = require('../model/EquivalenceClass.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONExport = function () {
  _createClass(JSONExport, [{
    key: 'run',
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
  }, {
    key: 'config',
    set: function set(config) {
      var previousSettings = this.settings;
      if (!previousSettings) {
        previousSettings = {
          spaces: 2,
          removeEmbeddedRelations: false,
          exportMap: true,
          exportSections: true,
          exportTags: true
        };
      }
      this.settings = _.defaultsDeep({}, config, previousSettings);
    }
  }]);

  function JSONExport(config) {
    _classCallCheck(this, JSONExport);

    this.name = "JSONExport";
    this.config = config;
  }

  return JSONExport;
}();

module.exports = {
  JSONExport: JSONExport
};
//# sourceMappingURL=JSONExport.js.map