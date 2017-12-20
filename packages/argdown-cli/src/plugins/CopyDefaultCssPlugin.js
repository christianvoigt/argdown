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
  run(data, logger){
    if(data.config && data.config.saveAs && data.config.saveAs.outputDir){
      this.config = {
        outputDir: data.config.saveAs.outputDir
      }
    }
    const $ = this;
    let rootPath = data.config.rootPath || process.cwd();
    let absoluteOutputDir = path.resolve(rootPath, $.settings.outputDir);
    mkdirp(absoluteOutputDir, function (err) {
      if (err){
        logger.log("error", err);
      }
      logger.log("verbose", "Copying default argdown.css to folder: " + absoluteOutputDir);        
      let pathToDefaultCssFile = require.resolve('argdown-parser/lib/src/plugins/argdown.css');
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
