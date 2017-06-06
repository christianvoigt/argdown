import {app} from '../index.js';

export const command = 'dot [inputGlob] [outputDir]';
export const desc = 'export Argdown input as DOT files';
export const builder = {
  useHtmlLabels: {
    alias: 'html-labels',
    describe: 'Use HTML node labels',
    type: 'boolean'
  },
  argumentLabelMode: {
    alias: 'argument-labels',
    choices: [undefined, 'hide-untitled','title','description'],
    type: 'string',
    describe: 'The method by which argument label content is selected'
  },
  statementLabelMode: {
    alias: 'statement-labels',
    choices: [undefined, 'hide-untitled','title','text'],
    type: 'string',
    describe: 'The method by which statement label content is selected'
  },
  statementSelectionMode: {
    alias: 'statement-selection',
    type: 'string',
    choices: [undefined, 'all','titled','roots','statement-trees','with-relations'],
  },
  graphName: {
    alias: 'name',
    type: 'string',
    describe: 'Name of the graph',
  },
  lineLength: {
    alias: 'line',
    type: 'number',
    describe: 'Number of chars in a label line.'
  },
  groupColors: {
    type: 'array',
    describe: 'Colors for groups sorted by stacking order'
  },
  inclusive: {
    type: 'boolean',
    describe: 'Include disconnected nodes.'
  },
  rankdir: {
    type: 'string',
    describe: 'Graphviz rankdir setting'
  },
  concentrate: {
    type: 'string',
    describe: 'Graphviz concentrate setting'
  },
  ratio: {
    type: 'string',
    describe: 'Graphviz ratio setting'
  },
  size: {
    type: 'string',
    describe: 'Graphviz size setting'
  }
};
export const handler = function(argv){
  let config = app.loadConfig(argv.config);
  
  config.dot = config.dot || config.DotExport ||{};
  config.map = config.map ||config.MapMaker ||{};

  if(argv.useHtmlLabels){
    config.dot.useHtmlLabels = true;        
  }

  if(argv.argumentLabelMode){
    config.dot.argumentLabelMode = argv.argumentLabelMode;        
  }
  if(argv.statementLabelMode){
    config.dot.statementLabelMode = argv.statementLabelMode;        
  }
  if(argv.statementSelectionMode){
    config.map.statementSelectionMode = argv.statementSelectionMode;
  }        
  if(argv.inclusive){
    config.map.excludeDisconnected = false;
  }

  if(argv.graphName){
    config.dot.graphname = argv.graphName;        
  }
  if(argv.lineLength){
    config.dot.lineLength = argv.lineLength;
  }
  if(argv.groupColors){
    config.dot.groupColors = argv.groupColors;
  }
  
  config.dot.graphVizSettings = config.dot.graphVizSettings ||{};
  if(argv.concentration){
    config.dot.graphVizSettings.concentration = argv.contentration;
  }
  if(argv.size){
    config.dot.graphVizSettings.size = argv.size;
  }
  if(argv.ratio){
    config.dot.graphVizSettings.ratio = argv.ratio;
  }
  if(argv.rankdir){
    config.dot.graphVizSettings.rankdir = argv.rankdir;
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
  config.process = ["build-model","export-dot"];
  if(!argv.stdout || argv.outputDir){
    config.process.push("save-as-dot");
  }
  
  if(argv.stdout){
    config.process.push("stdout-dot");
  }
  app.load(config);  
} 
