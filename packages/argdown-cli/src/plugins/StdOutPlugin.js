import * as _ from 'lodash';

class StdOutPlugin{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        dataKey : "test"
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  constructor(config){
    this.name = "StdOutPlugin";
    this.config = config;
  }
  run(data){
    if(data.config){
      if(data.config.stdOut){
        this.config = data.config.stdOut;
      }
    }
    
    let content = data[this.settings.dataKey];
    process.stdout.write(content);
  }
}

module.exports = {
  StdOutPlugin: StdOutPlugin
}
