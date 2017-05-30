import {app} from '../index.js';

export const command = 'argml [inputGlob] [outputDir]';
export const desc = 'export Argdown input as .graphml files';
export const builder = {
  statementSelectionMode: {
    alias: 'statement-selection',
    type: 'string',
    choices: ['all','titled','roots','statement-trees','with-relations'],
  },
  inclusive: {
    type: 'boolean',
    describe: 'Include disconnected nodes.'
  },
};
export const handler = function(argv){
  let config = app.loadConfig(argv.config);
  
  config.map = config.map ||config.MapMaker ||{};
  // if(argv.argumentLabelMode){
  //   config.map.argumentLabelMode = argv.argumentLabelMode;        
  // }
  // if(argv.statementLabelMode){
  //   config.map.statementLabelMode = argv.statementLabelMode;        
  // }
  if(argv.statementSelectionMode){
    config.map.statementSelectionMode = argv.statementSelectionMode;
  }
  if(argv.inclusive){
    config.map.excludeDisconnected = false;
  }
  if(argv.inputGlob){
    config.input = argv.inputGlob;
  }
  config.saveAs = config.saveAs ||config.SaveAsFilePlugin ||{};
  if(argv.outputDir){
    config.saveAs.outputDir = argv.outputDir;
  }
  config.verbose = argv.verbose ||config.verbose;
  config.watch = argv.watch ||config.watch;
  config.process = ["preprocessor","export-argml","save-as-argml"];
  app.load(config);  
} 
