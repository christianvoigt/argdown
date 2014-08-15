// Generated on 2013-12-09 using generator-webapp 0.4.4
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // configurable paths
        watch: {
            jison: {
                files: ['argdown-2.jison'],
                tasks: ['jison']
            }
        },
        uglify: {
          options: {},
          dist: {
            files: {
              'dist/ArgdownParser.min.js': ['dist/ArgdownParser.js']
            }
          }
        }

    });

    grunt.registerTask('jison', 'generate jison parser', function(){
        grunt.verbose.writelns('generating jison parser...');
        var Parser = require("jison").Parser;
        var fs = require('fs');

        try{
            var data = fs.readFileSync("./argdown-2.jison", 'utf8');
            grunt.verbose.ok("jison file loaded");
        }catch(error){
          grunt.verbose.errorlns(error.msg);
          grunt.fail.warn('failed to read jison file.');            
        }
        try{
            var grammar = data;
            var parser = new Parser(grammar,{moduleName: "ArgdownParser"});
            var parserSource = parser.generate();
            grunt.verbose.ok("generated parser");
        }catch(error){
          grunt.log.errorlns(error.msg);
          grunt.fail.warn('failed to generate parser.');
        }
        try{
            fs.writeFileSync("./dist/ArgdownParser.js", parserSource);

            grunt.verbose.ok("created parser file");
        }catch(error){
          grunt.verbose.errorlns(error.msg);
          grunt.fail.warn('failed to write parser file.');            
        }

    });

    grunt.registerTask('build', ['jison','uglify']);

    grunt.registerTask('default', [
        'build'
    ]);
};
