let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
import * as _ from 'lodash';

class SaveAsFilePlugin{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      dataKey : "test",
      fileName : "default",
      extension : ".txt",
      outputDir : "."
    });
  }
  constructor(config){
    this.name = "SaveAsFilePlugin";
    this.config = config;
  }
  run(data){
    let fileContent = data[this.settings.dataKey];
    if(!_.isEmpty(fileContent) && _.isString(fileContent)){
      let fileName = "default";
      if(!_.isEmpty(this.settings.sourceFile) && _.isString(this.settings.sourceFile)){
        fileName = this.getFileName(this.settings.sourceFile);
      }else if(_.isFunction(this.settings.fileName)){
        fileName = this.settings.fileName.call(this, data);
      }else if(data.sourceFile){
        fileName = this.getFileName(data.sourceFile);
      }else if(_.isString(this.settings.fileName)){
        fileName = this.settings.fileName;
      }
      this.saveAsFile(fileContent, this.settings.outputDir, fileName, this.settings.extension);
    }
  }
  getFileName(file){
    let extension = path.extname(file);
    return path.basename(file,extension);
  }
  saveAsFile(data, outputDir, fileName, extension){
    this.mkDir(outputDir);
    //let dirName = path.dirname(output);
    fs.writeFile(outputDir +'/'+fileName+extension, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("Exported "+fileName+" to "+outputDir+"/"+fileName+extension);
    });
  }
  mkDir(outputDir){
    mkdirp(outputDir, function (err) {
      if (err){
        console.log(err);
      }
    });
  }
}

module.exports = {
  SaveAsFilePlugin: SaveAsFilePlugin
}
