'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DotExport = function () {
  _createClass(DotExport, [{
    key: 'config',
    set: function set(config) {
      this.settings = _.defaults(config || {}, {
        useHtmlLabels: false,
        onlyTitlesInHtmlLabels: false,
        graphname: 'Argument Map'
      });
    }
  }]);

  function DotExport() {
    _classCallCheck(this, DotExport);

    this.name = "DotExport";
  }

  _createClass(DotExport, [{
    key: 'run',
    value: function run(data) {
      var dot = "digraph \"" + this.settings.graphname + "\" {\n\n";

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(data.map.statementNodes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var statementKey = _step.value;

          var statement = data.statements[statementKey];
          var statementNode = data.map.statementNodes[statementKey];
          var label = "";
          if (this.settings.useHtmlLabels) {
            label = "\"<h3 class='title'>" + this.escapeQuotesForDot(statementNode.title) + "</h3>";
            if (!this.settings.onlyTitlesInHtmlLabels) {
              var lastMember = _.last(statement.members);
              if (lastMember) {
                var text = lastMember.text;
                if (text) label += "<p>" + this.escapeQuotesForDot(text) + "</p>";
              }
            }
            label += "\"";
          } else {
            label = "\"" + this.escapeQuotesForDot(statementNode.title) + "\"";
          }
          dot += "  " + statementNode.id + " [label=" + label + ", shape=\"box\", style=\"filled,rounded\", color=\"cornflowerblue\", fillcolor=\"white\", labelfontcolor=\"white\", type=\"" + statementNode.type + "\"];\n";
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var argumentsKeys = Object.keys(data.map.argumentNodes);
      if (argumentsKeys.length > 0) dot += "\n\n";

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = argumentsKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var key = _step2.value;

          var argument = data.arguments[key];
          var argumentNode = data.map.argumentNodes[key];
          var _label = "";
          if (this.settings.useHtmlLabels) {
            _label = "\"<h3 class='title'>" + this.escapeQuotesForDot(argumentNode.title) + "</h3>";
            if (!this.settings.onlyTitlesInHtmlLabels) {
              var lastDescription = _.last(argument.descriptions);
              if (lastDescription) {
                var _text = lastDescription.text;
                if (_text) _label += "<p>" + this.escapeQuotesForDot(_text) + "</p>";
              }
            }
            _label += "\"";
          } else {
            _label = "\"" + this.escapeQuotesForDot(argumentNode.title) + "\"";
          }
          dot += "  " + argumentNode.id + " [label=" + _label + ", shape=\"box\", style=\"filled,rounded\", fillcolor=\"blue\", fontcolor=\"white\", type=\"" + argumentNode.type + "\"];\n";
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      dot += "\n\n";

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data.map.relations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var nodeRelation = _step3.value;

          var color = "green";
          if (nodeRelation.type == "attack") {
            color = "red";
          }
          dot += "  " + nodeRelation.from.id + " -> " + nodeRelation.to.id + " [color=\"" + color + "\", type=\"" + nodeRelation.type + "\"];\n";
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      dot += "\n}";

      data.dot = dot;
      return data;
    }
  }, {
    key: 'escapeQuotesForDot',
    value: function escapeQuotesForDot(str) {
      return str.replace(/\"/g, '\\\"');
    }
  }]);

  return DotExport;
}();

module.exports = {
  DotExport: DotExport
};
//# sourceMappingURL=DotExport.js.map