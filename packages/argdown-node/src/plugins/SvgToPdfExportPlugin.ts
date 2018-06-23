// We have to use a local file and let babel ignore it, until pdfkit is ported to ES6
var PDFDocument = require("../pdfkit.js");
var fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
import * as SVGtoPDF from "svg-to-pdfkit";
import * as _ from "lodash";
import {
  IAsyncArgdownPlugin,
  IAsyncRequestHandler
} from "../IAsyncArgdownPlugin";
import {
  IArgdownRequest,
  IRequestHandler,
  ArgdownPluginError
} from "@argdown/core";
import { IFileNameProvider } from "./SaveAsFilePlugin";

export interface IPdfSettings {
  outputDir?: string;
}
export interface ISvgToPdfSettings {
  outputDir?: string;
  format?: string;
  fileName?: string | IFileNameProvider;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    /**
     * General pdf settings
     */
    pdf?: IPdfSettings;
    /**
     * Settings for the [[SvgToPdfExportPlugin]]
     */
    svgToPdf?: ISvgToPdfSettings;
  }
}
export class SvgToPdfExportPlugin implements IAsyncArgdownPlugin {
  name = "SvgToPdfExportPlugin";
  defaults: ISvgToPdfSettings;
  constructor(config?: ISvgToPdfSettings) {
    this.defaults = _.defaultsDeep({}, config, {
      outputDir: "./pdf",
      format: "svg"
    });
  }
  getSettings(request: IArgdownRequest): ISvgToPdfSettings {
    request.svgToPdf = request.svgToPdf || {};
    return request.svgToPdf;
  }
  prepare: IRequestHandler = (request, response) => {
    if (!response.svg) {
      throw new ArgdownPluginError(this.name, "Missing svg field in response.");
    }
    _.defaults(this.getSettings(request), this.defaults);
  };
  runAsync: IAsyncRequestHandler = async (request, response) => {
    const settings = this.getSettings(request);
    let fileName = "default";
    let outputDir = settings.outputDir;
    if (request.outputPath) {
      fileName = this.getFileName(request.outputPath);
      outputDir = path.dirname(request.outputPath);
    } else if (request.pdf && request.pdf.outputDir) {
      fileName = this.getFileName(request.pdf.outputDir);
      outputDir = path.dirname(request.pdf.outputDir);
    } else if (_.isFunction(settings.fileName)) {
      fileName = settings.fileName.call(this, request, response);
    } else if (_.isString(settings.fileName)) {
      fileName = settings.fileName;
    } else if (request.inputPath) {
      fileName = this.getFileName(request.inputPath);
    }
    const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
    const filePath = absoluteOutputDir + "/" + fileName + ".pdf";
    await new Promise((resolve, reject) => {
      mkdirp(absoluteOutputDir, function(err: Error) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
    const doc = new PDFDocument(settings);
    SVGtoPDF(doc, response.svg, 0, 0, settings);
    await this.savePdfToFile(doc, filePath);
  };
  // https://github.com/devongovett/pdfkit/issues/265
  async savePdfToFile(pdf: any, fileName: string) {
    return new Promise(resolve => {
      // To determine when the PDF has finished being written successfully
      // we need to confirm the following 2 conditions:
      //
      //   1. The write stream has been closed
      //   2. PDFDocument.end() was called syncronously without an error being thrown

      let pendingStepCount = 2;

      const stepFinished = () => {
        if (--pendingStepCount == 0) {
          resolve();
        }
      };

      const writeStream = fs.createWriteStream(fileName);
      writeStream.on("close", stepFinished);
      pdf.pipe(writeStream);

      pdf.end();

      stepFinished();
    });
  }
  getFileName(file: string): string {
    let extension = path.extname(file);
    return path.basename(file, extension);
  }
}
