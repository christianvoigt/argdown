var Parser = require("jison").Parser;
var fs = require('fs');

fs.readFile("./argdown.jison", 'utf8', function(err, data) {
	  if (err) throw err;
	  var grammar = data;

	  var parser = new Parser(grammar);

	  var parserSource = parser.generate({type: "lalr", moduleName: "ArgdownParser"});

	  fs.writeFile("./dist/ArgdownParser.js", parserSource, function(err) {
	      if(err) {
	          console.log(err);
	      } else {
	          console.log("The file was saved!");
	      }
	  });
	});

