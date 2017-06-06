'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Argument = function () {
  function Argument() {
    _classCallCheck(this, Argument);

    this.relations = [];
    //Premise Conclusion Structure (PCS)
    this.pcs = [];
    this.descriptions = [];
  }

  _createClass(Argument, [{
    key: 'toJSON',
    value: function toJSON() {
      var copy = _.clone(this);
      if (copy.section) {
        copy.section = copy.section.id;
      }
      return copy;
    }
  }, {
    key: 'getCanonicalDescription',
    value: function getCanonicalDescription() {
      if (!this.descriptions || this.descriptions.length <= 0) {
        return null;
      }
      return this.descriptions[this.descriptions.length - 1];
    }
  }]);

  return Argument;
}();

module.exports = {
  Argument: Argument
};
//# sourceMappingURL=Argument.js.map