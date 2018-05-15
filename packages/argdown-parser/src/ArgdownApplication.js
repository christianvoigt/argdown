"use strict";

import { ArgdownTreeWalker } from "./ArgdownTreeWalker.js";
import * as _ from "lodash";

class ArgdownApplication {
    constructor(logger) {
        this.init(logger);
    }
    addPlugin(plugin, processorId) {
        if (!processorId) {
            processorId = "default";
        }

        let processor = this.processors[processorId];
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
                processor.walker = new ArgdownTreeWalker();
            }
            for (let key of Object.keys(plugin.argdownListeners)) {
                processor.walker.addListener(key, plugin.argdownListeners[key]);
            }
        }
    }

    removePlugin(plugin, processorId) {
        if (!processorId) {
            processorId = "default";
        }

        let processor = this.processors[processorId];
        if (!processor) {
            return;
        }

        let index = processor.plugins.indexOf(plugin);
        if (index > -1) {
            for (let key of Object.keys(plugin.argdownListeners)) {
                processor.walker.removeListener(key, plugin.argdownListeners[key]);
            }
            processor.plugins.splice(index, 1);
        }
    }
    getPlugins(processorId) {
        if (!processorId) {
            processorId = "default";
        }
        let processor = this.processors[processorId];
        if (processor) return processor.plugins;
        else {
            return null;
        }
    }
    getPlugin(name, processorId) {
        let plugins = this.getPlugins(processorId);
        if (plugins) {
            for (let plugin of plugins) {
                if (plugin.name == name) return plugin;
            }
        }
    }
    removeProcessor(processorId) {
        let processor = this.processors[processorId];
        if (!processor) return;
        for (let plugin of processor.plugins) {
            this.removePlugin(plugin, processorId);
        }
        delete this.processors[processorId];
    }
    init(logger) {
        this.processors = {};
        if (logger && _.isFunction(logger.log) && _.isFunction(logger.setLevel)) {
            this.logger = logger;
        } else {
            this.logger = {
                setLevel(level) {
                    this.logLevel = level;
                },
                log(level, message) {
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
    run(request, response) {
        let processorsToRun = null;
        this.logger.setLevel("error");
        let resp = response || {};

        if (request) {
            if (request.logLevel) {
                this.logger.setLevel(request.logLevel);
            }
            if (request.process) {
                if (_.isArray(request.process)) {
                    processorsToRun = request.process;
                }else if (_.isString(request.process) && request.processes) {
                    processorsToRun = request.processes[request.process];
                }
            }
        }

        if (_.isEmpty(processorsToRun)) {
            this.logger.log("verbose", "No processors to run.");
            return resp;
        }

        for (let processorId of processorsToRun) {
            let processor = this.processors[processorId];
            if (!processor) {
                this.logger.log("verbose", "Processor not found: " + processorId);
                continue;
            }
            this.logger.log("verbose", "Running processor: " + processorId);

            for (let plugin of processor.plugins) {
                this.logger.log("verbose", "Preparing plugin: " + plugin.name);
                if (_.isFunction(plugin.prepare)) {
                    plugin.prepare(request, response, this.logger);
                }
            }

            if (resp.ast && processor.walker) {
                processor.walker.walk(request, resp, this.logger);
            }

            for (let plugin of processor.plugins) {
                this.logger.log("verbose", "Running plugin: " + plugin.name);
                if (_.isFunction(plugin.run)) {
                    let newResponse = plugin.run(request, resp, this.logger);
                    if (_.isObject(newResponse)) {
                        resp = newResponse;
                    }
                }
            }
        }
        this.responseOfLastRun = resp;
        return resp;
    }
}

module.exports = {
    ArgdownApplication: ArgdownApplication
};
