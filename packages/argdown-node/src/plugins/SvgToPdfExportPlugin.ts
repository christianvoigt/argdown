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
  checkResponseFields,
  ensure,
  DefaultSettings,
  mergeDefaults
} from "@argdown/core";
import { IFileNameProvider } from "./SaveAsFilePlugin";

export interface IPdfSettings {
  outputDir?: string;
}
export interface ISvgToPdfSettings {
  outputDir?: string;
  format?: string;
  fileName?: string | IFileNameProvider;
  pdf?: { compress?: boolean };
  svg?: {
    useCSS?: boolean;
    assumePt?: boolean;
    preserveAspectRatio?: string;
  };
  width?: number;
  height?: number;
  padding?: number;
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
const defaultSettings: DefaultSettings<ISvgToPdfSettings> = {
  outputDir: "./pdf",
  format: "svg",
  width: 612,
  height: 792,
  padding: 10,
  pdf: ensure.object({
    compress: false
  }),
  svg: ensure.object({
    useCss: true,
    assumePt: true,
    preserveAspectRatio: "xMidYMid meet"
  })
};
export class SvgToPdfExportPlugin implements IAsyncArgdownPlugin {
  name = "SvgToPdfExportPlugin";
  defaults: ISvgToPdfSettings;
  constructor(config?: ISvgToPdfSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings(request: IArgdownRequest): ISvgToPdfSettings {
    request.svgToPdf = request.svgToPdf || {};
    return request.svgToPdf;
  }
  prepare: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, ["svg"]);
    mergeDefaults(this.getSettings(request), this.defaults);
  };
  runAsync: IAsyncRequestHandler = async (request, response) => {
    const settings = this.getSettings(request);
    let fileName = "default";
    let outputDir = settings.outputDir;
    if (request.outputPath) {
      outputDir = path.dirname(request.outputPath);
    } else if (request.pdf && request.pdf.outputDir) {
      outputDir = path.dirname(request.pdf.outputDir);
    }
    if (request.outputPath) {
      fileName = this.getFileName(request.outputPath);
    } else if (_.isFunction(settings.fileName)) {
      fileName = settings.fileName.call(this, settings, request, response);
    } else if (_.isString(settings.fileName)) {
      fileName = settings.fileName;
    } else if (request.inputPath) {
      fileName = this.getFileName(request.inputPath);
    }
    if (request.outputSuffix) {
      fileName = fileName + request.outputSuffix;
    }
    const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
    const filePath = absoluteOutputDir + "/" + fileName + ".pdf";
    await mkdirp(absoluteOutputDir);
    const doc = new PDFDocument({
      size: [settings.width, settings.height],
      ...settings.pdf
    });
    SVGtoPDF(doc, response.svg, settings.padding, settings.padding, {
      width: settings.width! - settings.padding! * 2,
      height: settings.height! - settings.padding! * 2,
      ...settings.svg
    });
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
