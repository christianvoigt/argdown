"use strict";

var _ArgdownLexer = require("./ArgdownLexer.js");

var lexer = _interopRequireWildcard(_ArgdownLexer);

var _ArgdownParser = require("./ArgdownParser.js");

var _chevrotain = require("chevrotain");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//const parser = new ArgdownParser([]);
function printAst(value) {
  var str = printAstRecursively(value, "", "");
  console.log(str);
}
function printAstRecursively(value, pre, str) {
  if (value === undefined) {
    str += "undefined";
    return str;
  } else if (value instanceof _chevrotain.Token) {
    str += value.constructor.name;
    return str;
  }
  str += value.name;
  if (value.children && value.children.length > 0) {
    var nextPre = pre + " |";
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = value.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var child = _step.value;

        str += "\n" + nextPre + "__";
        str = printAstRecursively(child, nextPre, str);
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

    str += "\n" + pre;
  }
  return str;
}

module.exports = {
  printAst: printAst,
  parse: function parse(inputText) {
    var lexResult = lexer.tokenize(inputText);
    //parser.input = lexResult.tokens;
    var parser = new _ArgdownParser.ArgdownParser(lexResult.tokens);
    var value = parser.statements();

    if (parser.errors.length > 0) {
      console.log(parser.errors);
      throw new Error("sad sad panda, Parsing errors detected");
    }

    //printAst(value);

    return {
      value: value, // this is a pure grammar, the value will always be <undefined>
      lexErrors: lexResult.errors,
      parseErrors: parser.errors
    };
  }
};
//# sourceMappingURL=index.js.map