let fs = require('fs');
let path = require('path');
import * as _ from 'lodash';

class IncludePlugin{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        regEx : /@include\(([^\)]+)\)/g
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  constructor(config){
    this.name = "IncludePlugin";
    this.config = config;
  }
  run(data){
    if(data.config && data.config.include){
      this.config = data.config.include;
    }
    if(!data.input || !data.inputFile){
      return data;
    }
    data.input = this.replaceIncludes(data.inputFile, data.input, this.settings.regEx, []);
    return data;
  }
  replaceIncludes(currentFilePath, str, regEx, filesAlreadyIncluded){
    let match = null;
    const directoryPath = path.dirname(currentFilePath);
    regEx.lastIndex = 0;
    while((match = regEx.exec(str))){
      const absoluteFilePath = path.resolve(directoryPath, match[1]);
      let strToInclude = '';
      if(_.includes(filesAlreadyIncluded, absoluteFilePath)){
        strToInclude = '<!-- Include failed: File \'' + absoluteFilePath + '\' already included. To avoid infinite loops, each file can only be included once. -->'
      }else{
        filesAlreadyIncluded.push(absoluteFilePath);
        strToInclude = fs.readFileSync(absoluteFilePath, 'utf8');
        if(strToInclude == null){
          strToInclude = '<!-- Include failed: File \''+ absoluteFilePath +'\' not found. -->\n'
        }else{
          strToInclude = this.replaceIncludes(absoluteFilePath, strToInclude, regEx, filesAlreadyIncluded);        
        }        
      }
      str = str.substr(0, match.index) + strToInclude + str.substr(match.index + match[0].length);
      regEx.lastIndex = match.index + strToInclude.length;
    }
    return str;
  }
}

module.exports = {
  IncludePlugin: IncludePlugin
}
