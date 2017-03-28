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
        for (var _iterator = data.map.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          var element = void 0;
          if (node.type == "statement") {
            element = data.statements[node.title];
          } else {
            element = data.arguments[node.title];
          }
          var label = "";
          if (this.settings.useHtmlLabels) {
            label = "\"<h3 class='title'>" + this.escapeQuotesForDot(node.title) + "</h3>";
            if (!this.settings.onlyTitlesInHtmlLabels) {
              var lastMember = void 0;
              if (node.type == "statement") {
                lastMember = _.last(element.members);
              } else {
                lastMember = _.last(element.descriptions);
              }
              if (lastMember) {
                var text = lastMember.text;
                if (text) label += "<p>" + this.escapeQuotesForDot(text) + "</p>";
              }
            }
            label += "\"";
          } else {
            label = "\"" + this.escapeQuotesForDot(node.title) + "\"";
          }
          if (node.type == "statement") {
            dot += "  " + node.id + " [label=" + label + ", shape=\"box\", style=\"filled,rounded\", color=\"cornflowerblue\", fillcolor=\"white\", labelfontcolor=\"white\", type=\"" + node.type + "\"];\n";
          } else {
            dot += "  " + node.id + " [label=" + label + ", shape=\"box\", style=\"filled,rounded\", fillcolor=\"blue\", fontcolor=\"white\", type=\"" + node.type + "\"];\n";
          }
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

      dot += "\n\n";

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.map.relations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var nodeRelation = _step2.value;

          var color = "green";
          if (nodeRelation.type == "attack") {
            color = "red";
          }
          dot += "  " + nodeRelation.from.id + " -> " + nodeRelation.to.id + " [color=\"" + color + "\", type=\"" + nodeRelation.type + "\"];\n";
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