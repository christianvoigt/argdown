let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
import * as _ from 'lodash';

class SaveAsFilePlugin{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        dataKey : "test",
        fileName : "default",
        extension : ".txt",
        outputDir : "./output"
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  constructor(config){
    this.name = "SaveAsFilePlugin";
    this.config = config;
  }
  run(data, logger){
    if(data.config){
      if(data.config.saveAs){
        this.config = data.config.saveAs;
      }else if(data.config.SaveAsFilePlugin){
        this.config = data.config.SaveAsFilePlugin;
      }
    }
    
    let fileContent = data[this.settings.dataKey];
    if(!_.isEmpty(fileContent) && _.isString(fileContent)){
      let fileName = "default";
      if(!_.isEmpty(this.settings.sourceFile) && _.isString(this.settings.sourceFile)){
        fileName = this.getFileName(this.settings.sourceFile);
      }else if(_.isFunction(this.settings.fileName)){
        fileName = this.settings.fileName.call(this, data);
      }else if(_.isString(this.settings.fileName)){
        fileName = this.settings.fileName;
      }else if(data.config && data.config.input){
        fileName = this.getFileName(data.config.input);
      }
      this.saveAsFile(fileContent, this.settings.outputDir, fileName, this.settings.extension, logger);
    }
  }
  getFileName(file){
    let extension = path.extname(file);
    return path.basename(file,extension);
  }
  saveAsFile(data, outputDir, fileName, extension, logger){
    let absoluteOutputDir = path.resolve(process.cwd(), outputDir);
    mkdirp(absoluteOutputDir, function (err) {
      if (err){
        logger.log("error", err);
      }else{
        fs.writeFile(absoluteOutputDir +'/'+fileName+extension, data, function(err) {
            if(err) {
                logger.log("error", err);
            }
            logger.log("verbose", "Saved " + absoluteOutputDir + "/" + fileName + extension);
        });        
      }
    });
  }
}

module.exports = {
  SaveAsFilePlugin: SaveAsFilePlugin
}
