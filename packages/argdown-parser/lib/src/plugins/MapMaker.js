"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Argument = require("../model/Argument.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapMaker = function () {
  function MapMaker() {
    _classCallCheck(this, MapMaker);

    this.name = "MapMaker";
  }

  _createClass(MapMaker, [{
    key: "run",
    value: function run(data) {
      data.map = this.makeMap(data);
      return data;
    }
  }, {
    key: "makeMap",
    value: function makeMap(data) {
      var map = { argumentNodes: {}, statementNodes: {}, relations: [] };
      var nodeCount = 0;
      var relations = [];

      //find all statement classes that should be inserted as nodes
      var statementKeys = Object.keys(data.statements);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = statementKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var statementKey = _step.value;

          var equivalenceClass = data.statements[statementKey];
          if (equivalenceClass.relations.length > 0 && (equivalenceClass.isUsedAsThesis || !equivalenceClass.isUsedInArgument)) {
            var id = "n" + nodeCount;
            nodeCount++;
            map.statementNodes[statementKey] = { type: "statement", title: statementKey, id: id };

            if (!equivalenceClass.isUsedInArgument) {
              //if the statement is used in an argument, the relations get added in the next round
              //add all relations outgoing from this statement class, if it is not added by an argument
              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                for (var _iterator4 = equivalenceClass.relations[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  var relation = _step4.value;

                  if (relation.from == equivalenceClass) {
                    relations.push(relation);
                  }
                }
              } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                  }
                } finally {
                  if (_didIteratorError4) {
                    throw _iteratorError4;
                  }
                }
              }
            }
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

      var argumentKeys = Object.keys(data.arguments);
      var statementRoles = {}; //a dictionary mapping statement titles to {premiseIn:[nodeId], conclusionIn:[nodeId]} objects

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = argumentKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var argumentKey = _step2.value;

          var argument = data.arguments[argumentKey];
          var _id = "n" + nodeCount;
          nodeCount++;
          map.argumentNodes[argumentKey] = { type: "argument", title: argument.title, id: _id };
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = argument.relations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _relation = _step5.value;

              if (_relation.from == argument) {
                relations.push(_relation);
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = argument.pcs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var statement = _step6.value;

              var roles = statementRoles[statement.title];
              if (!roles) {
                roles = { premiseIn: [], conclusionIn: [] };
                statementRoles[statement.title] = roles;
              }
              if (statement.role == "premise") {
                roles.premiseIn.push(map.argumentNodes[argumentKey]);
              } else if (statement.role == "conclusion") {
                roles.conclusionIn.push(map.argumentNodes[argumentKey]);
              }
              var _equivalenceClass = data.statements[statement.title];
              var _iteratorNormalCompletion7 = true;
              var _didIteratorError7 = false;
              var _iteratorError7 = undefined;

              try {
                for (var _iterator7 = _equivalenceClass.relations[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                  var _relation2 = _step7.value;

                  if (statement.role == "conclusion" && _relation2.from == _equivalenceClass) {
                    relations.push(_relation2);
                  }
                }
              } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                  }
                } finally {
                  if (_didIteratorError7) {
                    throw _iteratorError7;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = relations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _relation3 = _step3.value;

          var froms = [];
          var tos = [];

          var fromNode = void 0;
          if (_relation3.from instanceof _Argument.Argument) {
            fromNode = map.argumentNodes[_relation3.from.title];
          } else {
            fromNode = map.statementNodes[_relation3.from.title];
          }
          if (!fromNode) {
            //fromNode has to be a statement
            var _roles = statementRoles[_relation3.from.title];
            froms = _roles.conclusionIn;
          } else {
            froms.push(fromNode);
          }

          var toNode = void 0;
          if (_relation3.to instanceof _Argument.Argument) {
            toNode = map.argumentNodes[_relation3.to.title];
          } else {
            toNode = map.statementNodes[_relation3.to.title];
          }
          if (!toNode) {
            //fromNode has to be a statement
            var _roles2 = statementRoles[_relation3.to.title];
            tos = _roles2.premiseIn;
          } else {
            tos.push(toNode);
          }

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = froms[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var from = _step8.value;
              var _iteratorNormalCompletion9 = true;
              var _didIteratorError9 = false;
              var _iteratorError9 = undefined;

              try {
                for (var _iterator9 = tos[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                  var to = _step9.value;

                  map.relations.push({ from: from, to: to, type: _relation3.type });
                }
              } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion9 && _iterator9.return) {
                    _iterator9.return();
                  }
                } finally {
                  if (_didIteratorError9) {
                    throw _iteratorError9;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
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

      return map;
    }
  }]);

  return MapMaker;
}();

module.exports = {
  MapMaker: MapMaker
};
//# sourceMappingURL=MapMaker.js.map