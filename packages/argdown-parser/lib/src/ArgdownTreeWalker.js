"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require("eventemitter3");

var _chevrotain = require("chevrotain");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArgdownTreeWalker = function (_EventEmitter) {
  _inherits(ArgdownTreeWalker, _EventEmitter);

  function ArgdownTreeWalker() {
    _classCallCheck(this, ArgdownTreeWalker);

    return _possibleConstructorReturn(this, (ArgdownTreeWalker.__proto__ || Object.getPrototypeOf(ArgdownTreeWalker)).apply(this, arguments));
  }

  _createClass(ArgdownTreeWalker, [{
    key: "walk",
    value: function walk(tree, config) {
      this.visitNode(tree, null, null, config);
    }
  }, {
    key: "getTokenName",
    value: function getTokenName(tokenInstance) {
      var constr = (0, _chevrotain.getTokenConstructor)(tokenInstance);
      return constr.tokenName;
    }
  }, {
    key: "visitNode",
    value: function visitNode(node, parentNode, childIndex, config) {
      if (node.name) {
        this.emit(node.name + 'Entry', node, parentNode, childIndex, config);
      } else {
        this.emit(this.getTokenName(node) + 'Entry', node, parentNode, childIndex, config);
      }

      if (node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
          var child = node.children[i];
          this.visitNode(child, node, i, config);
        }
      }

      if (node.name) {
        this.emit(node.name + 'Exit', node, parentNode, childIndex, config);
      } else {
        this.emit(this.getTokenName(node) + 'Exit', node, parentNode, childIndex, config);
      }
    }
  }, {
    key: "capitalizeFirstLetter",
    value: function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }]);

  return ArgdownTreeWalker;
}(_eventemitter.EventEmitter);

module.exports = {
  ArgdownTreeWalker: ArgdownTreeWalker
};
//# sourceMappingURL=ArgdownTreeWalker.js.map