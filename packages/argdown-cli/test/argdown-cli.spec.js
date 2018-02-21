const chai = require('chai');
chai.use(require('chai-fs'));
import { expect } from 'chai';
import path from 'path';
import rimraf from 'rimraf';
const fs = require('fs');

describe("argdown-cli", function(){
  this.timeout(15000);
  it('can create dot output', (done) => {
    
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' dot '+filePath+' --stdout', function(error, stdout, stderr) {
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(stdout).to.not.equal('');
        expect(stdout).to.not.equal(null);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        done();
    });
  });
  it('can create html output', (done) => {
    
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' html '+filePath+' --stdout', function(error, stdout, stderr) {
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(stdout).to.not.equal('');
        expect(stdout).to.not.equal(null);

        if (error !== null) {
            console.log('exec error: ' + error);
        }
        done();
    });
  });  
  it('can create json output', (done) => {
    
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' json '+filePath+' --stdout', function(error, stdout, stderr) {
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(stdout).to.not.equal('');
        expect(stdout).to.not.equal(null);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        done();
    });
  });
  it('can load config and run process', (done) => {
    
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    let filePathToConfig = path.resolve(__dirname, './argdown.config.js');
    require('child_process').exec('node ' + filePathToCli + ' --stdout --verbose --config ' + filePathToConfig, function(error, stdout, stderr) {
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(stdout).to.not.equal('');
        expect(stdout).to.not.equal(null);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        done();
    });
  });
  it('can create html file', (done) => {
    
    let htmlFolder = path.resolve(__dirname, './html/');
    rimraf(htmlFolder, {}, function(err){
      if(err){
        console.log(err);
      }
    });
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToHtml = path.resolve(__dirname, './html/test.html');    
    let filePathToCss = path.resolve(__dirname, './html/argdown.css');    
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' html ' + filePath + ' ' + htmlFolder, function(error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        //console.log(stdout);
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(filePathToHtml).to.be.a.file();
        expect(filePathToCss).to.be.a.file();
        rimraf(htmlFolder, {}, function(err){
          if(err){
            console.log(err);
          }
        });
      done();
    });
  });  
  it('can create dot file', (done) => {
    
    let dotFolder = path.resolve(__dirname, './dot/');
    rimraf(dotFolder, {}, function(err){
      if(err){
        console.log(err);
      }
    });
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToDot = path.resolve(__dirname, './dot/test.dot');    
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' dot -f dot ' + filePath + ' ' + dotFolder, function(error, stdout, stderr) {
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(filePathToDot).to.be.a.file();
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        rimraf(dotFolder, {}, function(err){
          if(err){
            console.log(err);
          }
        });
      done();
    });
  });
  it('can create svg file from dot export', (done) => {
    
    let svgFolder = path.resolve(__dirname, './svg/');
    rimraf(svgFolder, {}, function (err) {
      if (err) {
        console.log(err);
      }
    });
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToSvg = path.resolve(__dirname, './svg/test.svg');
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' dot -f svg ' + filePath + ' ' + svgFolder, function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(filePathToSvg).to.be.a.file();
      rimraf(svgFolder, {}, function (err) {
        if (err) {
          console.log(err);
        }
      });
      done();
    });
  });
  it('can create pdf file from dot export', (done) => {

    let pdfFolder = path.resolve(__dirname, './pdf/');
    rimraf(pdfFolder, {}, function (err) {
      if (err) {
        console.log(err);
      }
    });
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToPdf = path.resolve(__dirname, './pdf/test.pdf');
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' dot ' + filePath + ' ' + pdfFolder, function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      //console.log(stdout);
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(filePathToPdf).to.be.a.file();
      rimraf(pdfFolder, {}, function (err) {
        if (err) {
          console.log(err);
        }
      });
      done();
    });
  });
  it('can create json file', (done) => {
    
    let jsonFolder = path.resolve(__dirname, './json');
    rimraf(jsonFolder, {}, function(err){
      if(err){
        console.log(err);
      }
    });
    let filePath = path.resolve(__dirname, './test.argdown');
    let filePathToJson = path.resolve(__dirname, './json/test.json');    
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' json ' + filePath + ' ' + jsonFolder, function(error, stdout, stderr) {
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(filePathToJson).to.be.a.file();
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        rimraf(jsonFolder, {}, function(err){
          if(err){
            console.log(err);
          }
        });
        done();
    });
  });
  it('can include files', (done) => {
    
    let globPath = './test/include-test.argdown';
    let expectedResult = fs.readFileSync(path.resolve(__dirname, './include-test-expected-result.txt'), 'utf8');

    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' compile ' + globPath + ' --stdout', function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(stdout).to.not.equal(null);
        expect(stdout).to.equal(expectedResult);
        done();
    });
  });      
  it('can load glob input', (done) => {
    
    let jsonFolder = path.resolve(__dirname, './json');
    let globPath = './test/*.argdown';
    
    rimraf(jsonFolder, {}, function(err){
      if(err){
        console.log(err);
      }
    });
    let filePathToJson1 = path.resolve(__dirname, './json/test.json');
    let filePathToJson2 = path.resolve(__dirname, './json/include-test.json');    
    let filePathToJson3 = path.resolve(__dirname, './json/_partial1.json');    
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' json \'' + globPath + '\' ' + jsonFolder + ' --verbose', function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(filePathToJson1).to.be.a.file();
        expect(filePathToJson2).to.be.a.file();
        expect(filePathToJson3).to.not.be.a.path();
        rimraf(jsonFolder, {}, function(err){
          if(err){
            console.log(err);
          }
        });
        done();
    });
  });  
});
