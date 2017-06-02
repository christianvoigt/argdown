"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ArgdownLexer = require("./ArgdownLexer.js");

var _ArgdownParser = require("./ArgdownParser.js");

var _ArgdownTreeWalker = require("./ArgdownTreeWalker.js");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ArgdownApplication = function () {
  function ArgdownApplication() {
    _classCallCheck(this, ArgdownApplication);

    this.init();
  }

  _createClass(ArgdownApplication, [{
    key: "addPlugin",
    value: function addPlugin(plugin, processorId) {
      if (!processorId) {
        processorId = 'default';
      }

      var processor = this.processors[processorId];
      if (!processor) {
        processor = {
          plugins: [],
          walker: null
        };
        this.processors[processorId] = processor;
      }

      processor.plugins.push(plugin);
      if (plugin.argdownListeners) {
        if (!processor.walker) {
          processor.walker = new _ArgdownTreeWalker.ArgdownTreeWalker();
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(plugin.argdownListeners)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            processor.walker.addListener(key, plugin.argdownListeners[key]);
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
      }
    }
  }, {
    key: "removePlugin",
    value: function removePlugin(plugin, processorId) {
      if (!processorId) {
        processorId = 'default';
      }

      var processor = this.processors[processorId];
      if (!processor) {
        return;
      }

      var index = processor.plugins.indexOf(plugin);
      if (index > -1) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(plugin.argdownListeners)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var key = _step2.value;

            processor.walker.removeListener(key, plugin.argdownListeners[key]);
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

        processor.plugins.splice(index, 1);
      }
    }
  }, {
    key: "getPlugins",
    value: function getPlugins(processorId) {
      if (!processorId) {
        processorId = 'default';
      }
      var processor = this.processors[processorId];
      if (processor) return processor.plugins;else {
        return null;
      }
    }
  }, {
    key: "getPlugin",
    value: function getPlugin(name, processorId) {
      var plugins = this.getPlugins(processorId);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = plugins[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var plugin = _step3.value;

          if (plugin.name == name) return plugin;
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
    }
  }, {
    key: "removeProcessor",
    value: function removeProcessor(processorId) {
      var processor = this.processors[processorId];
      if (!processor) return;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = processor.plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var plugin = _step4.value;

          this.removePlugin(plugin, processorId);
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

      delete this.processors[processorId];
    }
  }, {
    key: "init",
    value: function init() {
      this.processors = {};
      this.lexer = _ArgdownLexer.ArgdownLexer;
      this.parser = _ArgdownParser.ArgdownParser;
    }
  }, {
    key: "parse",
    value: function parse(inputText, verbose, data) {
      data = data || {};
      var lexResult = this.lexer.tokenize(inputText);
      this.tokens = lexResult.tokens;
      data.tokens = lexResult.tokens;
      this.lexerErrors = lexResult.errors;
      data.lexerErrors = lexResult.errors;

      this.parser.input = lexResult.tokens;
      this.ast = this.parser.argdown();
      data.ast = this.ast;
      data.parserErrors = this.parser.errors;
      this.parserErrors = this.parser.errors;
      if (verbose && data.lexerErrors && data.lexerErrors.length > 0) {
        console.log(data.lexerErrors);
      }
      if (verbose && data.parserErrors && data.parserErrors.length > 0) {
        console.log(data.parserErrors);
      }
      return data;
    }
  }, {
    key: "run",
    value: function run(param, previousData) {
      var processorsToRun = null;
      var verbose = false;
      var data = {};

      if (param == null) {
        processorsToRun = ['default'];
      } else if (_.isString(param)) {
        processorsToRun = [param];
        if (previousData) {
          data = previousData;
        }
      } else if (_.isArray(param)) {
        processorsToRun = param;
        if (previousData) {
          data = previousData;
        }
      } else if (_.isObject(param)) {
        data = param;
      }
      if (data.config) {
        verbose = data.config.verbose;
        if (data.config.process) {
          if (_.isArray(data.config.process)) {
            processorsToRun = data.config.process;
          }
        }
      }
      if (data.input) {
        this.parse(data.input, verbose, data);
      }

      if (_.isEmpty(processorsToRun)) {
        if (verbose) {
          console.log("No processors to run.");
        }
        return data;
      }

      var ast = data.ast;
      if (!ast) {
        ast = this.ast;
      }
      if (!ast) {
        if (verbose) {
          console.log("Ast not found.");
        }
        return data;
      }
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = processorsToRun[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var processorId = _step5.value;

          var processor = this.processors[processorId];
          if (!processor) {
            if (verbose) {
              console.log("Processor not found: " + processorId);
            }
            continue;
          }
          if (verbose) {
            console.log("Running processor: " + processorId);
          }

          if (processor.walker) {
            processor.walker.walk(ast, data);
          }

          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = processor.plugins[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var plugin = _step6.value;

              if (verbose) {
                console.log("Running plugin: " + plugin.name);
              }
              if (_.isFunction(plugin.run)) {
                var newData = plugin.run(data);
                if (_.isObject(newData)) {
                  data = newData;
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

      return data;
    }
  }]);

  return ArgdownApplication;
}();

module.exports = {
  ArgdownApplication: ArgdownApplication
};
//# sourceMappingURL=ArgdownApplication.js.map