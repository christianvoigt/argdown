#!/usr/bin/env node
'use strict';
/*jshint esversion: 6 */
/*jslint node: true */

//for some reason this does not work with:
//'import * as program from 'commander-file';
let program = require('commander');
let glob = require('glob');
let fs = require('fs');
let chokidar = require('chokidar');
let mkdirp = require('mkdirp');

import {ArgdownApplication, ArgdownPreprocessor, HtmlExport} from 'argdown-parser';
import {MapMaker, DotExport, ArgMLExport} from 'argdown-map-maker';
import {SaveAsFilePlugin} from './SaveAsFilePlugin.js';


let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
let htmlExport = new HtmlExport();
let mapMaker = new MapMaker();
let dotExport = new DotExport();
let argmlExport = new ArgMLExport();
let saveAsFilePlugin = new SaveAsFilePlugin();
app.addPlugin(preprocessor, "preprocessor");

app.addPlugin(htmlExport, "export-html");

app.addPlugin(mapMaker, "export-dot");
app.addPlugin(dotExport, "export-dot");

app.addPlugin(mapMaker, "export-argml");
app.addPlugin(argmlExport, "export-argml");

app.addPlugin(saveAsFilePlugin, "save-as-file");

program
  .version('0.0.0')

program
  .command('html [input] [output]')
  .description('export Argdown input as HTML files')
  .option('-hl, --headless', 'Export without Html, Head and Body elements (default:false)')
  .option('-c, --css <file>','CSS file to include in the HTML head (default:./argdown.css)')
  .option('-l, --lang <language>', 'Language of HTML document (default:en)')
  .option('-t, --title <title>', 'Title for HTML document (default: H1 element content)')
  .option('-w, --watch', 'Continuously watch files for changes and update exported HTML files.')
  .action(function(_input, _output, options){
    let input = _input;
    let config = {};

    if(options.headless)
      config.headless = true;

    if(options.css)
      config.css = options.css;

    if(options.title)
      config.title = options.title;

    htmlExport.config = config;

    if(!input)
      input = "./*.argdown";

    let output = _output;
    if(!output)
      output = "./html";

    if(options.watch){
      var watcher = chokidar.watch(input, {});
      watcher
      .on('add', path => {
        console.log(`File ${path} has been added.`);
        exportFile(path, output, "html");
      })
      .on('change', path => {
        console.log(`File ${path} has been changed.`);
        exportFile(path, output, "html");
      })
      .on('unlink', path => {
        console.log(`File ${path} has been removed.`);
      });
    }else{
      glob(input, function (er, files) {
        if(er){
          console.log(er);
          return;
        }else{
          console.log("glob files: "+files);
          for(let file of files){
            exportFile(file, output, "html");
          }
        }
      });
    }
    if(!options.css){
      mkdirp(output, function (err) {
        if (err){
          console.log(err);
        }
        console.log("Copying default argdown.css to folder: "+output);
        let pathToDefaultCssFile = __dirname + '/../../node_modules/argdown-parser/lib/src/plugins/argdown.css';
        copySync(pathToDefaultCssFile, output+"/argdown.css");
      });
    }
  });

  program
    .command('dot [input] [output]')
    .description('export Argdown graph as .dot files')
    .option('-h, --html', 'Use HTML node labels (default:false)')
    .option('-t, --titles','Use only titles in HTML labels (default:false)')
    .option('-m, --mode', 'Set the statement selection mode (all|titled|roots|statement-trees|with-relations)')
    .option('-i, --inclusive', 'Include disconnected nodes')
    .option('-n, --graphname <graphname>', 'Name of the graph (default: Argument Map)')
    .option('-w, --watch', 'Continuously watch files for changes and update exported dot files.')
    .action(function(_input, _output, options){
      let input = _input;
      let config = {};

      if(options.html)
        config.useHtmlLabels = true;

      if(options.titles)
        config.onlyTitlesInHtmlLabels = options.onlyTitlesInHtmlLabels;

      if(options.graphname)
        config.graphname = options.graphname;

      dotExport.config = config;

      if(!input)
        input = "./*.argdown";

      let output = _output;
      if(!output)
        output = "./dot";
        
      let statementSelectionMode = "statement-trees";
      if(options.mode){
        statementSelectionMode = options.mode;
      }
      let excludeDisconnected = true;
      if(options.inclusive){
        excludeDisconnected = false;        
      }
      mapMaker.config = {
        statementSelectionMode: statementSelectionMode,
        excludeDisconnected: excludeDisconnected
      };
        

      if(options.watch){
        var watcher = chokidar.watch(input, {});
        watcher
        .on('add', path => {
          console.log(`File ${path} has been added.`);
          exportFile(path, output, "dot");
        })
        .on('change', path => {
          console.log(`File ${path} has been changed.`);
          exportFile(path, output, "dot");
        })
        .on('unlink', path => {
          console.log(`File ${path} has been removed.`);
        });
      }else{
        glob(input, function (er, files) {
          if(er){
            console.log(er);
            return;
          }else{
            console.log("glob files: "+files);
            for(let file of files){
              exportFile(file, output, "dot");
            }
          }
        });
      }
    });

    program
      .command('argml [input] [output]')
      .description('export Argdown graph as .graphml files (with argML extensions)')
      .option('-i, --inclusive', 'Include disconnected nodes')
      .option('-m, --mode', 'Set the statement selection mode (all|titled|roots|statement-trees|with-relations)')
      .option('-w, --watch', 'Continuously watch files for changes and update exported dot files.')
      .action(function(_input, _output, options){
        let input = _input;
        let config = {};

        argmlExport.config = config;

        if(!input)
          input = "./*.argdown";

        let output = _output;
        if(!output)
          output = "./graphml";
          
        let statementSelectionMode = "statement-trees";
        if(options.mode){
          statementSelectionMode = options.mode;
        }
        let excludeDisconnected = true;
        if(options.inclusive){
          excludeDisconnected = false;        
        }
        mapMaker.config = {
          statementSelectionMode: statementSelectionMode,
          excludeDisconnected: excludeDisconnected
        };
        
        if(options.watch){
          var watcher = chokidar.watch(input, {});
          watcher
          .on('add', path => {
            console.log(`File ${path} has been added.`);
            exportFile(path, output, "argml");
          })
          .on('change', path => {
            console.log(`File ${path} has been changed.`);
            exportFile(path, output, "argml");
          })
          .on('unlink', path => {
            console.log(`File ${path} has been removed.`);
          });
        }else{
          glob(input, function (er, files) {
            if(er){
              console.log(er);
              return;
            }else{
              console.log("glob files: "+files);
              for(let file of files){
                exportFile(file, output, "argml");
              }
            }
          });
        }
      });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function copySync(src, dest) {
  if (!fs.existsSync(src)) {
    return false;
  }

  var data = fs.readFileSync(src, 'utf-8');
  fs.writeFileSync(dest, data);
}

function exportFile(file, outputDir, format){
  try {
      let processors;
      if(format == "html"){
        saveAsFilePlugin.config = {outputDir: outputDir, sourceFile: file, dataKey:"html", extension:".html"};
        processors = ["preprocessor","export-html","save-as-file"];
      }else if(format == "dot"){
        saveAsFilePlugin.config = {outputDir: outputDir, sourceFile: file, dataKey:"dot", extension:".dot"};
        processors = ["preprocessor","export-dot","save-as-file"];
      }else if(format == "argml"){
        saveAsFilePlugin.config = {outputDir: outputDir, sourceFile: file, dataKey:"argml", extension:".graphml"};
        processors = ["preprocessor", "export-argml", "save-as-file"];
      }else{
        console.log("Format "+format+" not supported.");
        return;
      }

      var data = fs.readFileSync(file, 'utf8');
      app.parse(data, true);
      app.run(processors);
  } catch(e) {
      console.log('Error:', e.stack);
  }
}
