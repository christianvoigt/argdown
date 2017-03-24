#!/usr/bin/env node
'use strict';
/*jshint esversion: 6 */
/*jslint node: true */

//for some reason this does not work with:
//'import * as program from 'commander-file';
let program = require('commander');
let glob = require('glob');
let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let chokidar = require('chokidar');

import {ArgdownApplication, ArgdownPreprocessor, HtmlExport, MapMaker, DotExport} from '../index.js';


let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
let htmlExport = new HtmlExport();
let mapMaker = new MapMaker();
let dotExport = new DotExport();
app.addPlugin(preprocessor, "preprocessor");
app.addPlugin(htmlExport, "export-html");

app.addPlugin(mapMaker, "export-dot");
app.addPlugin(dotExport, "export-dot");

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

    console.log("HtmlExport: "+input+" "+output+" "+options.title);

    createDir(output);

    if(!options.css){
      console.log("Copying default argdown.css to folder: "+output);
      let pathToDefaultCssFile = __dirname + '/../plugins/argdown.css';
      copySync(pathToDefaultCssFile, output+"/argdown.css");
    }
    if(options.watch){
      var watcher = chokidar.watch(input, {});
      watcher
      .on('add', path => {
        console.log(`File ${path} has been added.`);
        exportFileToHtml(path, output);
      })
      .on('change', path => {
        console.log(`File ${path} has been changed.`);
        exportFileToHtml(path, output);
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
            exportFileToHtml(file, output);
          }
        }
      });
    }
  });

  program
    .command('dot [input] [output]')
    .description('export Argdown graph as .dot files')
    .option('-h, --html', 'Use HTML node labels (default:false)')
    .option('-t, --titles','Use only titles in HTML labels (default:false)')
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

      console.log("DotExport: "+input+" "+output+" "+options.title);

      createDir(output);

      if(options.watch){
        var watcher = chokidar.watch(input, {});
        watcher
        .on('add', path => {
          console.log(`File ${path} has been added.`);
          exportFileToDot(path, output);
        })
        .on('change', path => {
          console.log(`File ${path} has been changed.`);
          exportFileToDot(path, output);
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
              exportFileToDot(file, output);
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
function createDir(output){
  mkdirp(output, function (err) {
    if (err){
      console.log(err);
    }
  });
}
function saveFile(data, extension, argdownFile, outputDir){
  let oldExtension = path.extname(argdownFile);
  let fileName = path.basename(argdownFile,oldExtension);
  //let dirName = path.dirname(output);
  fs.writeFile(outputDir +'/'+fileName+extension, data, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("Exported "+argdownFile+" to "+outputDir+"/"+fileName+extension);
  });
}
function exportFileToHtml(file, output){
  try {
      var data = fs.readFileSync(file, 'utf8');
      app.parse(data);
      if(app.lexerErrors && app.lexerErrors.length > 0){
        console.log(app.lexerErrors);
      }
      if(app.parserErrors && app.parserErrors.length > 0){
        console.log(app.parserErrors);
      }
      let result = app.run(["preprocessor","export-html"]);
      saveFile(result.html, ".html", file, output);
  } catch(e) {
      console.log('Error:', e.stack);
  }
}
function exportFileToDot(file, output){
  try {
      var data = fs.readFileSync(file, 'utf8');
      app.parse(data);
      if(app.lexerErrors && app.lexerErrors.length > 0){
        console.log(app.lexerErrors);
      }
      if(app.parserErrors && app.parserErrors.length > 0){
        console.log(app.parserErrors);
      }
      let result = app.run(["preprocessor","export-dot"]);
      saveFile(result.dot, ".dot", file, output);
  } catch(e) {
      console.log('Error:', e.stack);
  }
}
