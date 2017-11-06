let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
import * as _ from 'lodash';

class CopyDefaultCssPlugin{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        outputDir: "./html"
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  constructor(config){
    this.name = "CopyDefaultCssPlugin";
    this.config = config;
  }
  run(data){
    if(data.config && data.config.saveAs && data.config.saveAs.outputDir){
      this.config = {
        outputDir: data.config.saveAs.outputDir
      }
    }
    const $ = this;
    let absoluteOutputDir = path.resolve(process.cwd(), $.settings.outputDir);
    mkdirp(absoluteOutputDir, function (err) {
      if (err){
        console.log(err);
      }
      if(data && data.config && data.config.verbose){
        console.log("Copying default argdown.css to folder: " + absoluteOutputDir);        
      }
      let pathToDefaultCssFile = path.resolve(__dirname, '../../../node_modules/argdown-parser/lib/src/plugins/argdown.css');
      $.copySync(pathToDefaultCssFile, path.resolve(absoluteOutputDir,"argdown.css"));
    });    
  }
  copySync(src, dest) {
    if (!fs.existsSync(src)) {
      return false;
    }

    var data = fs.readFileSync(src, 'utf-8');
    fs.writeFileSync(dest, data);
  }
}
module.exports = {
  CopyDefaultCssPlugin: CopyDefaultCssPlugin
}
