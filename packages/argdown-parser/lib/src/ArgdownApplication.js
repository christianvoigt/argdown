"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ArgdownTreeWalker = require("./ArgdownTreeWalker.js");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ArgdownApplication = function () {
    function ArgdownApplication(logger) {
        _classCallCheck(this, ArgdownApplication);

        this.init(logger);
    }

    _createClass(ArgdownApplication, [{
        key: "addPlugin",
        value: function addPlugin(plugin, processorId) {
            if (!processorId) {
                processorId = "default";
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
                processorId = "default";
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
                processorId = "default";
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
            if (plugins) {
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
        value: function init(logger) {
            this.processors = {};
            if (logger && _.isFunction(logger.log) && _.isFunction(logger.setLevel)) {
                this.logger = logger;
            } else {
                this.logger = {
                    setLevel: function setLevel(level) {
                        this.logLevel = level;
                    },
                    log: function log(level, message) {
                        if (level == "verbose") {
                            if (this.logLevel == "verbose") {
                                console.log(message);
                            }
                        } else {
                            console.log(message);
                        }
                    }
                };
            }
        }
    }, {
        key: "run",
        value: function run(request, response) {
            var processorsToRun = null;
            this.logger.setLevel("error");
            var resp = response || {};

            if (request) {
                if (request.logLevel) {
                    this.logger.setLevel(request.logLevel);
                }
                if (request.process) {
                    if (_.isArray(request.process)) {
                        processorsToRun = request.process;
                    } else if (_.isString(request.process) && request.processes) {
                        processorsToRun = request.processes[request.process];
                    }
                }
            }

            if (_.isEmpty(processorsToRun)) {
                this.logger.log("verbose", "No processors to run.");
                return resp;
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = processorsToRun[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var processorId = _step5.value;

                    var processor = this.processors[processorId];
                    if (!processor) {
                        this.logger.log("verbose", "Processor not found: " + processorId);
                        continue;
                    }
                    this.logger.log("verbose", "Running processor: " + processorId);

                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = processor.plugins[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var plugin = _step6.value;

                            this.logger.log("verbose", "Preparing plugin: " + plugin.name);
                            if (_.isFunction(plugin.prepare)) {
                                plugin.prepare(request, response, this.logger);
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

                    if (resp.ast && processor.walker) {
                        processor.walker.walk(request, resp, this.logger);
                    }

                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = processor.plugins[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var _plugin = _step7.value;

                            this.logger.log("verbose", "Running plugin: " + _plugin.name);
                            if (_.isFunction(_plugin.run)) {
                                var newResponse = _plugin.run(request, resp, this.logger);
                                if (_.isObject(newResponse)) {
                                    resp = newResponse;
                                }
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

            this.responseOfLastRun = resp;
            return resp;
        }
    }]);

    return ArgdownApplication;
}();

module.exports = {
    ArgdownApplication: ArgdownApplication
};
//# sourceMappingURL=ArgdownApplication.js.map