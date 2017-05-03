'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _Relation = require('../model/Relation.js');

var _Argument = require('../model/Argument.js');

var _Statement = require('../model/Statement.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONExport = function () {
  _createClass(JSONExport, [{
    key: 'run',
    value: function run(data) {
      var argdown = {
        arguments: data.arguments,
        statements: data.statements,
        relations: data.relations
      };
      var $ = this;
      data.json = JSON.stringify(argdown, function (key, value) {
        if ($.settings.removeEmbeddedRelations && key == "relations" && (this instanceof _Argument.Argument || this instanceof _Statement.Statement)) {
          return undefined;
        }
        if (this instanceof _Relation.Relation) {
          if (value && (key == "from" || key == "to")) {
            return this[key].title;
          } else {
            return value;
          }
        } else {
          return value;
        }
      }, this.settings.spaces);
      return data;
    }
  }, {
    key: 'config',
    set: function set(config) {
      this.settings = _.defaults(config || {}, {
        spaces: 2,
        removeEmbeddedRelations: false
      });
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