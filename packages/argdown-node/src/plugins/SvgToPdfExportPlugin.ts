import PDFDocument from "pdfkit";
// var fs = require("fs");
import { promises as fs, createWriteStream } from "fs";
let path = require("path");
let mkdirp = require("mkdirp");
import SVGtoPDF from "svg-to-pdfkit";
import defaultsDeep from "lodash.defaultsdeep";
import isFunction from "lodash.isfunction";
import isString from "lodash.isstring";
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
  mergeDefaults,
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
  pdf?: { compress?: boolean };
  svg?: {
    useCSS?: boolean;
    assumePt?: boolean;
    preserveAspectRatio?: string;
  };
  width?: number;
  height?: number;
  padding?: number;
  fonts?: { name: string; path: string }[];
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
    this.defaults = defaultsDeep({}, config, defaultSettings);
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
    } else if (isFunction(settings.fileName)) {
      fileName = settings.fileName.call(this, settings, request, response);
    } else if (isString(settings.fileName)) {
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
      size: [settings.width || 0, settings.height || 0],
      ...settings.pdf
    });
    if (settings.fonts) {
      for (let font of settings.fonts) {
        try {
          const baseDir =
            request.inputPath && !!path.extname(request.inputPath)
              ? path.dirname(request.inputPath)
              : request.inputPath || "";
          const fontPath = path.resolve(baseDir || process.cwd(), font.path);
          const buffer = await fs.readFile(fontPath);
          const arrayBuffer = this.toArrayBuffer(buffer);
          doc.registerFont(font.name, arrayBuffer);
        } catch (e) {
          throw new ArgdownPluginError(
            this.name,
            "pdf-custom-font-load-failed",
            `Could not register custom font ${font.name}.\n` + e.message
          );
        }
      }
    }
    const fontCallback = settings.fonts
      ? (family: string, bold: boolean, italic: boolean, _fontOptions: any) => {
          let face = family.replace(/["']/g, "").replace(/-/g, " ");
          if (bold && italic) face = `${face} Bold Italic`;
          if (bold) face = `${face} Bold`;
          if (italic) face = `${face} Italic`;
          const re = new RegExp(`${face}( Regular)?$`);
          let match = settings.fonts!.find(fontObj => {
            return re.test(fontObj.name);
          });
          if (match !== undefined) {
            return match.name;
          } else {
            throw new ArgdownPluginError(
              this.name,
              "pdf-custom-font-not-found",
              `Could not find custom pdf font: ${face}`
            );
          }
        }
      : null;

    SVGtoPDF(doc, response.svg, settings.padding, settings.padding, {
      width: settings.width! - settings.padding! * 2,
      height: settings.height! - settings.padding! * 2,
      fontCallback,
      ...settings.svg
    });
    await this.savePdfToFile(doc, filePath);
  };
  // https://github.com/devongovett/pdfkit/issues/265
  async savePdfToFile(pdf: any, fileName: string) {
    return new Promise<void>(resolve => {
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

      const writeStream = createWriteStream(fileName);
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
  toArrayBuffer(buf: Buffer) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }
}
