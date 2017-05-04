#!/usr/bin/env node

'use strict';
/*jshint esversion: 6 */
/*jslint node: true */

//for some reason this does not work with:
//'import * as program from 'commander-file';

var _argdownParser = require('argdown-parser');

var _argdownMapMaker = require('argdown-map-maker');

var _SaveAsFilePlugin = require('./SaveAsFilePlugin.js');

var program = require('commander');
var glob = require('glob');
var fs = require('fs');
var chokidar = require('chokidar');
var mkdirp = require('mkdirp');

var app = new _argdownParser.ArgdownApplication();
var preprocessor = new _argdownParser.ArgdownPreprocessor();
var htmlExport = new _argdownParser.HtmlExport();
var mapMaker = new _argdownMapMaker.MapMaker();
var dotExport = new _argdownMapMaker.DotExport();
var argmlExport = new _argdownMapMaker.ArgMLExport();
var jsonExport = new _argdownParser.JSONExport();
var saveAsFilePlugin = new _SaveAsFilePlugin.SaveAsFilePlugin();
app.addPlugin(preprocessor, "preprocessor");

app.addPlugin(htmlExport, "export-html");

app.addPlugin(mapMaker, "export-json");
app.addPlugin(jsonExport, "export-json");

app.addPlugin(mapMaker, "export-dot");
app.addPlugin(dotExport, "export-dot");

app.addPlugin(mapMaker, "export-argml");
app.addPlugin(argmlExport, "export-argml");

app.addPlugin(saveAsFilePlugin, "save-as-file");

program.version('0.0.0');

program.command('html [input] [output]').description('export Argdown input as HTML files').option('-hl, --headless', 'Export without Html, Head and Body elements (default:false)').option('-c, --css <file>', 'CSS file to include in the HTML head (default:./argdown.css)').option('-l, --lang <language>', 'Language of HTML document (default:en)').option('-t, --title <title>', 'Title for HTML document (default: H1 element content)').option('-w, --watch', 'Continuously watch files for changes and update exported HTML files.').action(function (_input, _output, options) {
  var input = _input;
  var config = {};

  if (options.headless) config.headless = true;

  if (options.css) config.css = options.css;

  if (options.title) config.title = options.title;

  htmlExport.config = config;

  if (!input) input = "./*.argdown";

  var output = _output;
  if (!output) output = "./html";

  if (options.watch) {
    var watcher = chokidar.watch(input, {});
    watcher.on('add', function (path) {
      console.log('File ' + path + ' has been added.');
      exportFile(path, output, "html");
    }).on('change', function (path) {
      console.log('File ' + path + ' has been changed.');
      exportFile(path, output, "html");
    }).on('unlink', function (path) {
      console.log('File ' + path + ' has been removed.');
    });
  } else {
    glob(input, function (er, files) {
      if (er) {
        console.log(er);
        return;
      } else {
        console.log("glob files: " + files);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            exportFile(file, output, "html");
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    });
  }
  if (!options.css) {
    mkdirp(output, function (err) {
      if (err) {
        console.log(err);
      }
      console.log("Copying default argdown.css to folder: " + output);
      var pathToDefaultCssFile = __dirname + '/../../node_modules/argdown-parser/lib/src/plugins/argdown.css';
      copySync(pathToDefaultCssFile, output + "/argdown.css");
    });
  }
});

program.command('dot [input] [output]').description('export Argdown graph as .dot files').option('-h, --html', 'Use HTML node labels (default:false)').option('-t, --titles', 'Use only titles in HTML labels (default:false)').option('-m, --mode <mode>', 'Set the statement selection mode (all|titled|roots|statement-trees|with-relations)').option('-i, --inclusive', 'Include disconnected nodes').option('-n, --graphname <graphname>', 'Name of the graph (default: Argument Map)').option('-w, --watch', 'Continuously watch files for changes and update exported dot files.').action(function (_input, _output, options) {
  var input = _input;
  var config = {};

  if (options.html) config.useHtmlLabels = true;

  if (options.titles) config.onlyTitlesInHtmlLabels = options.onlyTitlesInHtmlLabels;

  if (options.graphname) config.graphname = options.graphname;

  dotExport.config = config;

  if (!input) input = "./*.argdown";

  var output = _output;
  if (!output) output = "./dot";

  var statementSelectionMode = "statement-trees";
  if (options.mode) {
    statementSelectionMode = options.mode;
  }
  var excludeDisconnected = true;
  if (options.inclusive) {
    excludeDisconnected = false;
  }
  mapMaker.config = {
    statementSelectionMode: statementSelectionMode,
    excludeDisconnected: excludeDisconnected
  };

  if (options.watch) {
    var watcher = chokidar.watch(input, {});
    watcher.on('add', function (path) {
      console.log('File ' + path + ' has been added.');
      exportFile(path, output, "dot");
    }).on('change', function (path) {
      console.log('File ' + path + ' has been changed.');
      exportFile(path, output, "dot");
    }).on('unlink', function (path) {
      console.log('File ' + path + ' has been removed.');
    });
  } else {
    glob(input, function (er, files) {
      if (er) {
        console.log(er);
        return;
      } else {
        console.log("glob files: " + files);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var file = _step2.value;

            exportFile(file, output, "dot");
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    });
  }
});

program.command('argml [input] [output]').description('export Argdown graph as .graphml files (with argML extensions)').option('-i, --inclusive', 'Include disconnected nodes').option('-m, --mode <mode>', 'Set the statement selection mode (all|titled|roots|statement-trees|with-relations)').option('-w, --watch', 'Continuously watch files for changes and update exported dot files.').action(function (_input, _output, options) {
  var input = _input;
  var config = {};

  argmlExport.config = config;

  if (!input) input = "./*.argdown";

  var output = _output;
  if (!output) output = "./graphml";

  var statementSelectionMode = "statement-trees";
  if (options.mode) {
    statementSelectionMode = options.mode;
  }
  var excludeDisconnected = true;
  if (options.inclusive) {
    excludeDisconnected = false;
  }
  mapMaker.config = {
    statementSelectionMode: statementSelectionMode,
    excludeDisconnected: excludeDisconnected
  };

  if (options.watch) {
    var watcher = chokidar.watch(input, {});
    watcher.on('add', function (path) {
      console.log('File ' + path + ' has been added.');
      exportFile(path, output, "argml");
    }).on('change', function (path) {
      console.log('File ' + path + ' has been changed.');
      exportFile(path, output, "argml");
    }).on('unlink', function (path) {
      console.log('File ' + path + ' has been removed.');
    });
  } else {
    glob(input, function (er, files) {
      if (er) {
        console.log(er);
        return;
      } else {
        console.log("glob files: " + files);
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var file = _step3.value;

            exportFile(file, output, "argml");
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    });
  }
});

program.command('json [input] [output]').description('export Argdown data as JSON file').option('-s, --spaces', 'Spaces used for indentation (default 2)').option('-rm, --remove-map', 'Remove map data').option('-rer, --remove-embedded-relations', 'Remove relations embedded in statement and relation objects').action(function (_input, _output, options) {
  var input = _input;
  var config = {};

  argmlExport.config = config;

  if (!input) input = "./*.argdown";

  var output = _output;
  if (!output) output = "./json";

  var spaces = 2;
  if (options.spaces !== null) {
    spaces = options.spaces;
  }
  var removeEmbeddedRelations = false;
  if (options.removeEmbeddedRelations) {
    removeEmbeddedRelations = true;
  }
  var exportMap = true;
  if (options.removeMap) {
    exportMap = false;
  }

  mapMaker.config = {
    spaces: spaces,
    removeEmbeddedRelations: removeEmbeddedRelations,
    exportMap: exportMap
  };

  if (options.watch) {
    var watcher = chokidar.watch(input, {});
    watcher.on('add', function (path) {
      console.log('File ' + path + ' has been added.');
      exportFile(path, output, "json");
    }).on('change', function (path) {
      console.log('File ' + path + ' has been changed.');
      exportFile(path, output, "json");
    }).on('unlink', function (path) {
      console.log('File ' + path + ' has been removed.');
    });
  } else {
    glob(input, function (er, files) {
      if (er) {
        console.log(er);
        return;
      } else {
        console.log("glob files: " + files);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = files[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var file = _step4.value;

            exportFile(file, output, "json");
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
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

function exportFile(file, outputDir, format) {
  try {
    var processors = void 0;
    if (format == "html") {
      saveAsFilePlugin.config = { outputDir: outputDir, sourceFile: file, dataKey: "html", extension: ".html" };
      processors = ["preprocessor", "export-html", "save-as-file"];
    } else if (format == "dot") {
      saveAsFilePlugin.config = { outputDir: outputDir, sourceFile: file, dataKey: "dot", extension: ".dot" };
      processors = ["preprocessor", "export-dot", "save-as-file"];
    } else if (format == "argml") {
      saveAsFilePlugin.config = { outputDir: outputDir, sourceFile: file, dataKey: "argml", extension: ".graphml" };
      processors = ["preprocessor", "export-argml", "save-as-file"];
    } else if (format == "json") {
      saveAsFilePlugin.config = { outputDir: outputDir, sourceFile: file, dataKey: "json", extension: ".json" };
      processors = ["preprocessor", "export-json", "save-as-file"];
    } else {
      console.log("Format " + format + " not supported.");
      return;
    }

    var data = fs.readFileSync(file, 'utf8');
    app.parse(data, true);
    app.run(processors);
  } catch (e) {
    console.log('Error:', e.stack);
  }
}
//# sourceMappingURL=index.js.map