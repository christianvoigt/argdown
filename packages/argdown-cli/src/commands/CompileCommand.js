import {app} from '../index.js';

export const command = 'compile [inputGlob] [outputDir]';
export const desc = 'compile included Argdown files into main file';
export const builder = {
};
export const handler = function(argv){
  let config = app.loadConfig(argv.config);
  
  if(argv.inputGlob){
    config.inputPath = argv.inputGlob;
  }
  config.saveAs = config.saveAs ||config.SaveAsFilePlugin ||{};
  if(argv.outputDir){
    config.saveAs.outputDir = argv.outputDir;
  }
  
  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch ||config.watch;
  config.process = ['preprocessor'];
  if(!argv.stdout || argv.outputDir){
    config.process.push('save-as-argdown');
  }
  if(argv.stdout){
    config.process.push('stdout-argdown');
  }
  app.load(config).catch(e => console.log(e));  
} 
