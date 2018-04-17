"use strict";
import * as _ from "lodash";
import { ArgdownApplication } from "argdown-parser";

class AsyncArgdownApplication extends ArgdownApplication {
  async runAsync(request, response) {
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
        } else if (_.isString(request.process) && request.processes) {
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

      for (let plugin of processor.plugins) {
        if (_.isFunction(plugin.prepare)) {
          this.logger.log("verbose", "Preparing plugin: " + plugin.name);
          plugin.prepare(request, resp, this.logger);
        }
      }

      if (resp.ast && processor.walker) {
        processor.walker.walk(request, resp, this.logger);
      }

      for (let plugin of processor.plugins) {
        this.logger.log("verbose", "Running plugin: " + plugin.name);
        if (_.isFunction(plugin.runAsync)) {
          await plugin.runAsync(request, resp, this.logger);
        } else if (_.isFunction(plugin.run)) {
          plugin.run(request, resp, this.logger);
        }
      }
    }
    return resp;
  }
}
module.exports = {
  AsyncArgdownApplication: AsyncArgdownApplication
};
