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
        walker: new ArgdownTreeWalker()
      };
      this.processors[processorId] = processor;
    }

    if(plugin.argdownListeners){
      for(let key of Object.keys(plugin.argdownListeners)){
        processor.walker.addListener(key, plugin.argdownListeners[key]);
      }
      processor.plugins.push(plugin);
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
  parse(inputText){
      let lexResult = this.lexer.tokenize(inputText);
      this.lexerErrors = lexResult.errors;
      this.tokens = lexResult.tokens;
      this.parser.input = lexResult.tokens;
      this.parserErrors = this.parser.errors;
      this.ast = this.parser.argdown();
  }
  run(processorsToRun){
    if(!this.ast){
      return;
    }

    if(!processorsToRun){
        processorsToRun = ['default'];
    }else if(_.isString(processorsToRun)){
      processorsToRun = [processorsToRun];
    }

    for(let processorId of processorsToRun){
      let processor = this.processors[processorId];
      processor.walker.walk(this.ast);
    }
  }
}

module.exports = {
  ArgdownApplication: ArgdownApplication
}
