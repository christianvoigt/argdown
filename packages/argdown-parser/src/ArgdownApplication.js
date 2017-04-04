"use strict";

import {ArgdownLexer} from './ArgdownLexer.js';
import {ArgdownParser} from "./ArgdownParser.js";
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
      if(!processor.walker)
        processor.walker = new ArgdownTreeWalker();
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
    for(let plugin of plugins){
      if(plugin.name == name)
        return plugin;
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
    this.lexer = ArgdownLexer;
    this.parser = ArgdownParser;
  }
  parse(inputText, verbose){
      let lexResult = this.lexer.tokenize(inputText);
      this.lexerErrors = lexResult.errors;
      this.tokens = lexResult.tokens;
      this.parser.input = lexResult.tokens;
      this.ast = this.parser.argdown();
      this.parserErrors = this.parser.errors;
      if(verbose && this.lexerErrors && this.lexerErrors.length > 0){
        console.log(this.lexerErrors);
      }
      if(verbose && this.parserErrors && this.parserErrors.length > 0){
        console.log(this.parserErrors);
      }
  }
  run(processorsToRun, previousData, verbose){
    let data = previousData;
    if(!data){
      data = {
        ast : this.ast,
        parserErrors : this.parserErrors,
        lexerErrors : this.lexerErrors,
        tokens : this.tokens
      };
    }
    if(!this.ast){
      return data;
    }

    if(!processorsToRun){
      processorsToRun = ['default'];
    }else if(_.isString(processorsToRun)){
      processorsToRun = [processorsToRun];
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

      if(processor.walker){
        processor.walker.walk(this.ast);
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
    return data;
  }
}

module.exports = {
  ArgdownApplication: ArgdownApplication
}
