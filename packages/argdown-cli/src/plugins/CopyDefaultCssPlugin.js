let fs = require('fs');
let mkdirp = require('mkdirp');
import * as _ from 'lodash';

class CopyDefaultCssPlugin{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        outputDir: "./html",
        appendTagColors: true
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  constructor(config){
    this.name = "CopyDefaultCssPlugin";
    this.config = config;
  }
  run(data){
    const $ = this;
    mkdirp($.settings.outputDir, function (err) {
      if (err){
        console.log(err);
      }
      if(data && data.config && data.config.verbose){
        console.log("Copying default argdown.css to folder: "+$.settings.outputDir);        
      }
      let pathToDefaultCssFile = __dirname + '/../../../node_modules/argdown-parser/lib/src/plugins/argdown.css';
      $.copySync(pathToDefaultCssFile, $.settings.outputDir+"/argdown.css");
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