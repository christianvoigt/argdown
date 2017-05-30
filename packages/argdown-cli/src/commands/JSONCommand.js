import {app} from '../index.js';

export const command = 'json [inputGlob] [outputDir]';
export const desc = 'export Argdown input as JSON files';
export const builder = {
  spaces: {
    alias: 's',
    describe: 'Spaces used for indentation',
    type: 'number'
  },
  removeMap: {
    describe: 'Remove map data',
    type: 'boolean'
  },
  removeEmbeddedRelations: {
    describe: 'Remove relations embedded in statement and relation objects',
    type: 'boolean'
  }
};
export const handler = function(argv){
  let config = app.loadConfig(argv.config);
  
  config.json = config.json ||config.JSONExport ||{};

  if(argv.spaces !== null){
    config.json.spaces = argv.spaces;
  }
  if(argv.removeEmbeddedRelations){
    config.json.removeEmbeddedRelations = true;        
  }
  if(argv.removeMap){
    config.json.exportMap = false;
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
  config.process = ["preprocessor","export-json","save-as-json"];
  app.load(config);  
} 
