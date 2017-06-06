var chai = require('chai');
chai.use(require('chai-fs'));
import { expect } from 'chai';
import path from 'path';
import rimraf from 'rimraf';

describe("argdown-cli", function(){
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
    require('child_process').exec('node ' + filePathToCli + ' --stdout --config ' + filePathToConfig, function(error, stdout, stderr) {
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
    let filePathToCli = path.resolve(__dirname, '../lib/src/cli.js');
    require('child_process').exec('node ' + filePathToCli + ' html ' + filePath + ' ' + htmlFolder, function(error, stdout, stderr) {
        expect(error).to.equal(null);
        expect(stderr).to.equal('');
        expect(filePathToHtml).to.be.a.file();
        if (error !== null) {
            console.log('exec error: ' + error);
        }
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
    require('child_process').exec('node ' + filePathToCli + ' dot ' + filePath + ' ' + dotFolder, function(error, stdout, stderr) {
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
});
