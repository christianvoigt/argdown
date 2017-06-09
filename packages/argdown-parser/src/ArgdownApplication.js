"use strict";

import {ArgdownTreeWalker} from "./ArgdownTreeWalker.js";
import * as _ from 'lodash';

class ArgdownApplication{
  constructor(){
    this.init();
  }
  addPlugin(plugin, processorId){
    if(!processorId){
      processorId = 'default';
    }

    let processor = this.processors[processorId];
    if(!processor){
      processor = {
        plugins:[],
        walker: null
      };
      this.processors[processorId] = processor;
    }

    processor.plugins.push(plugin);
    if(plugin.argdownListeners){
      if(!processor.walker){
        processor.walker = new ArgdownTreeWalker();        
      }
      for(let key of Object.keys(plugin.argdownListeners)){
        processor.walker.addListener(key, plugin.argdownListeners[key]);
      }
    }
  }

  removePlugin(plugin, processorId){
    if(!processorId){
      processorId = 'default';
    }

    let processor = this.processors[processorId];
    if(!processor){
      return;
    }

    let index = processor.plugins.indexOf(plugin);
    if(index > -1){
      for(let key of Object.keys(plugin.argdownListeners)){
        processor.walker.removeListener(key, plugin.argdownListeners[key]);
      }
      processor.plugins.splice(index, 1);
    }
  }
  getPlugins(processorId){
    if(!processorId){
      processorId = 'default';
    }
    let processor = this.processors[processorId];
    if(processor)
      return processor.plugins;
    else {
      return null;
    }
  }
  getPlugin(name, processorId){
    let plugins = this.getPlugins(processorId);
    if(plugins){
      for(let plugin of plugins){
        if(plugin.name == name)
          return plugin;
      }      
    }
  }
  removeProcessor(processorId){
    let processor = this.processors[processorId];
    if(!processor)
      return;
    for(let plugin of processor.plugins){
      this.removePlugin(plugin, processorId);
    }
    delete this.processors[processorId];
  }
  init(){
    this.processors = {};
  }
  run(param, previousData){
    let processorsToRun = null;
    let verbose = false;
    let data = {};
    
    if(param == null){
      processorsToRun = ['default'];
    }else if(_.isString(param)){
      processorsToRun = [param];
      if(previousData){
        data = previousData;
      }
    }else if(_.isArray(param)){
      processorsToRun = param;
      if(previousData){
        data = previousData;
      }
    }else if(_.isObject(param)){
      data = param;
    }
    if(data.config){
      verbose = data.config.verbose;
      if(data.config.process){
        if(_.isArray(data.config.process)){
          processorsToRun = data.config.process;
        }
      }
    }
    
    if(_.isEmpty(processorsToRun)){
      if(verbose){
        console.log("No processors to run.");
      }
      return data;
    }
    
    for(let processorId of processorsToRun){
      let processor = this.processors[processorId];
      if(!processor){
        if(verbose){
          console.log("Processor not found: "+processorId);
        }
        continue;
      }
      if(verbose){
        console.log("Running processor: "+processorId);
      }

      if(data.ast && processor.walker){
        processor.walker.walk(data.ast, data);
      }

      for(let plugin of processor.plugins){
        if(verbose){
          console.log("Running plugin: "+plugin.name);
        }
        if(_.isFunction(plugin.run)){
          let newData = plugin.run(data);
          if(_.isObject(newData)){
            data = newData;
          }
        }
      }
    }
    this.dataOfLastRun = data;
    return data;
  }
}

module.exports = {
  ArgdownApplication: ArgdownApplication
}
