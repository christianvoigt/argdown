const chai = require("chai");
chai.use(require("chai-fs"));
import { expect } from "chai";
import { describe, it } from "mocha";
import * as path from "path";
import rimraf from "rimraf";
const fs = require("fs");

const rimrafPromise = function(path: string) {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, {}, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
interface IExecCallback {
  (error: Error | null, stdout: any, stderr: any): void;
}
const execPromise = (cmd: string, callback: IExecCallback) => {
  return new Promise<void>((resolve, reject) => {
    require("child_process").exec(
      cmd,
      (error: Error | null, stdout: any, stderr: any) => {
        if (error !== null) {
          reject(error);
        }
        callback(error, stdout, stderr);
        resolve();
      }
    );
  });
};

describe("argdown-cli", function() {
  this.timeout(20000);
  it("can create dot output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f dot " + filePath + " --stdout";
    const cb: IExecCallback = (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    };
    return execPromise(cmd, cb);
  });
  it("can create graphml output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f graphml " + filePath + " --stdout";
    const cb: IExecCallback = (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    };
    return execPromise(cmd, cb);
  });
  it("can create html output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd = "node " + filePathToCli + " html " + filePath + " --stdout";
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can create web-component output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " web-component " + filePath + " --stdout";
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can create json output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd = "node " + filePathToCli + " json " + filePath + " --stdout";
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can create markdown output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd = "node " + filePathToCli + " markdown " + filePath + " --stdout";
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can create png output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f png " + filePath + " --stdout";
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can create jpg output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f jpg " + filePath + " --stdout";
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can create webp output", () => {
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f webp " + filePath + " --stdout";
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can load config and run process", () => {
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    let filePathToConfig = path.resolve(__dirname, "./argdown.config.js");
    const cmd =
      "node " + filePathToCli + " --stdout --config " + filePathToConfig;
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal("");
      expect(stdout).to.not.equal(null);
    });
  });
  it("can run custom process defined in config.processes", () => {
    let svgFolder = path.resolve(__dirname, "./svg/");
    let filePathToSvg = path.resolve(__dirname, "./svg/test-suffix.svg");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    let filePathToConfig = path.resolve(
      __dirname,
      "./custom-process.argdown.config.js"
    );
    const cmd =
      "node " + filePathToCli + " run test --config " + filePathToConfig;
    return rimrafPromise(svgFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToSvg).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(svgFolder);
      });
  });
  it("can load plugin from config and run process defined in config.processes", () => {
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    let filePathToConfig = path.resolve(
      __dirname,
      "./add-plugin.argdown.config.js"
    );
    const cmd =
      "node " + filePathToCli + " run test --config " + filePathToConfig;
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.equal("Hallo World!\n");
    });
  });
  it("can create html file", () => {
    let htmlFolder = path.resolve(__dirname, "./html/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToHtml = path.resolve(__dirname, "./html/test.html");
    let filePathToCss = path.resolve(__dirname, "./html/argdown.css");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " html " + filePath + " " + htmlFolder;
    return rimrafPromise(htmlFolder)
      .then(() => {
        return execPromise(cmd, function(error, _stdout, stderr) {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToHtml).to.be.a).file();
          (<any>expect(filePathToCss).to.be.a).file();
        });
      })
      .then(()=>{
        // Let's do it a second time to check if the copy css plugin swallows the eexist error
        return execPromise(cmd, function(error, _stdout, stderr) {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToHtml).to.be.a).file();
          (<any>expect(filePathToCss).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(htmlFolder);
      });
  });
  it("can create web-component file", () => {
    let htmlFolder = path.resolve(__dirname, "./html/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToWebComponentHtml = path.resolve(
      __dirname,
      "./html/test.component.html"
    );
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " web-component " + filePath + " " + htmlFolder;
    return rimrafPromise(htmlFolder)
      .then(() => {
        return execPromise(cmd, function(error, _stdout, stderr) {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToWebComponentHtml).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(htmlFolder);
      });
  });
  it("can create dot file from map", () => {
    let dotFolder = path.resolve(__dirname, "./dot/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToDot = path.resolve(__dirname, "./dot/test.dot");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f dot " + filePath + " " + dotFolder;
    return rimrafPromise(dotFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToDot).to.be.a).file();
          if (error !== null) {
            console.log("exec error: " + error);
          }
        });
      })
      .then(() => {
        return rimrafPromise(dotFolder);
      });
  });
  it("can create graphml file from map", () => {
    let dotFolder = path.resolve(__dirname, "./graphml/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToDot = path.resolve(__dirname, "./graphml/test.graphml");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f graphml " + filePath + " " + dotFolder;
    return rimrafPromise(dotFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToDot).to.be.a).file();
          if (error !== null) {
            console.log("exec error: " + error);
          }
        });
      })
      .then(() => {
        return rimrafPromise(dotFolder);
      });
  });
  it("can create svg file from map", () => {
    let svgFolder = path.resolve(__dirname, "./svg/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToSvg = path.resolve(__dirname, "./svg/test.svg");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f svg " + filePath + " " + svgFolder;
    return rimrafPromise(svgFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToSvg).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(svgFolder);
      });
  });
  it("can create pdf file from map", () => {
    let pdfFolder = path.resolve(__dirname, "./pdf/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToPdf = path.resolve(__dirname, "./pdf/test.pdf");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd = "node " + filePathToCli + " map " + filePath + " " + pdfFolder;
    return rimrafPromise(pdfFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToPdf).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(pdfFolder);
      });
  });
  it("can create json file", () => {
    let jsonFolder = path.resolve(__dirname, "./json");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToJson = path.resolve(__dirname, "./json/test.json");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " json " + filePath + " " + jsonFolder;
    return rimrafPromise(jsonFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToJson).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(jsonFolder);
      });
  });
  it("can create png file from map", () => {
    let imagesFolder = path.resolve(__dirname, "./images/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToPng = path.resolve(__dirname, "./images/test.png");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f png " + filePath + " " + imagesFolder;
    return rimrafPromise(imagesFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToPng).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(imagesFolder);
      });
  });
  it("can create jpg file from map", () => {
    let imagesFolder = path.resolve(__dirname, "./images/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToJpg = path.resolve(__dirname, "./images/test.jpg");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f jpg " + filePath + " " + imagesFolder;
    return rimrafPromise(imagesFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToJpg).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(imagesFolder);
      });
  });
  it("can create webp file from map", () => {
    let imagesFolder = path.resolve(__dirname, "./images/");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToWebp = path.resolve(__dirname, "./images/test.webp");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " map -f webp " + filePath + " " + imagesFolder;
    return rimrafPromise(imagesFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToWebp).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(imagesFolder);
      });
  });
  it("can create html file from markdown", () => {
    let htmlFolder = path.resolve(__dirname, "./html");
    let filePath = path.resolve(__dirname, "./test.argdown");
    let filePathToHtml = path.resolve(__dirname, "./html/test.html");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + " markdown " + filePath + " " + htmlFolder;
    return rimrafPromise(htmlFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToHtml).to.be.a).file();
        });
      })
      .then(() => {
        return rimrafPromise(filePathToHtml);
      });
  });
  it("can include files", () => {
    let globPath = path.resolve(__dirname, "./include-test.argdown");
    let expectedResult = fs.readFileSync(
      path.resolve(__dirname, "./include-test-expected-result.txt"),
      "utf8"
    );
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd = `node ${filePathToCli} --silent compile ${globPath} --stdout`;
    return execPromise(cmd, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal("");
      expect(stdout).to.not.equal(null);
      expect(
        stdout.replace(
          /File \'.+\' already included./g,
          "File already included."
        )
      ).to.equal(
        expectedResult.replace(
          /File \'.+\' already included./g,
          "File already included."
        )
      );
    });
  });
  it("can load glob input", () => {
    let jsonFolder = path.resolve(__dirname, "./json");
    let globPath = path.resolve(__dirname, "./*.argdown");
    let filePathToJson1 = path.resolve(__dirname, "./json/test.json");
    let filePathToJson2 = path.resolve(__dirname, "./json/include-test.json");
    let filePathToJson3 = path.resolve(__dirname, "./json/_partial1.json");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd =
      "node " + filePathToCli + ' json "' + globPath + '" ' + jsonFolder;
    return rimrafPromise(jsonFolder)
      .then(() => {
        return execPromise(cmd, (error, _stdout, stderr) => {
          expect(error).to.equal(null);
          expect(stderr).to.equal("");
          (<any>expect(filePathToJson1).to.be.a).file();
          (<any>expect(filePathToJson2).to.be.a).file();
          (<any>expect(filePathToJson3).to.not.be.a).path();
        });
      })
      .then(() => {
        return rimrafPromise(jsonFolder);
      });
  });
  it("can throw parser error", async () => {
    let invalidArgdownPath = path.resolve(__dirname, "./invalid-argdown.txt");
    let filePathToCli = path.resolve(__dirname, "../dist//cli.js");
    const cmd = `node ${filePathToCli} --logParserErrors=false "${invalidArgdownPath}"`;
    await execPromise(cmd, (error, _stdout, stderr) => {
      console.log(stderr);
      expect(error).to.not.equal(null);
      expect((<any>error).code).to.equal(1);
      // expect(stderr).to.not.equal("");
    }).catch(() => {});
  });
});
