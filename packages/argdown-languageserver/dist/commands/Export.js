"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestProviders = {
    "vizjs-to-svg": r => {
        return Object.assign({}, r, { process: [
                "parse-input",
                "build-model",
                "build-map",
                "export-dot",
                "export-svg",
                "save-svg-as-svg"
            ] });
    },
    "vizjs-to-pdf": r => {
        return Object.assign({}, r, { process: [
                "parse-input",
                "build-model",
                "build-map",
                "export-dot",
                "export-svg",
                "save-svg-as-pdf"
            ] });
    },
    "dagre-to-pdf": r => {
        return Object.assign({}, r, { process: ["save-svg-as-pdf"] });
    },
    dot: r => {
        return Object.assign({}, r, { process: [
                "parse-input",
                "build-model",
                "build-map",
                "export-dot",
                "save-as-dot"
            ] });
    },
    html: r => {
        return Object.assign({}, r, { process: [
                "parse-input",
                "build-model",
                "export-html",
                "save-as-html",
                "copy-default-css"
            ] });
    },
    json: r => {
        return Object.assign({}, r, { process: [
                "parse-input",
                "build-model",
                "build-map",
                "export-json",
                "save-as-json"
            ] });
    }
};
exports.exportContent = (argdownEngine, args) => __awaiter(this, void 0, void 0, function* () {
    let request = {};
    if (args.process === "vizjs-to-pdf") {
        request.outputPath = args.target.fsPath;
        const getRequest = requestProviders[args.process];
        request = getRequest(request);
        const response = {
            svg: args.content
        };
        yield argdownEngine.runAsync(request, response);
    }
    else {
        request.input = args.content;
        request.outputPath = args.target.fsPath;
        const getRequest = requestProviders[args.process];
        request = getRequest(request);
        yield argdownEngine.runAsync(request);
    }
});
exports.exportDocument = (argdownEngine, args, doc) => __awaiter(this, void 0, void 0, function* () {
    let request = { logLevel: "verbose" };
    request.inputPath = args.source.fsPath;
    request.outputPath = args.target.fsPath;
    const getRequest = requestProviders[args.process];
    request = getRequest(request);
    if (doc) {
        request.input = doc.getText();
        yield argdownEngine.runAsync(request);
    }
    else {
        yield argdownEngine.load(request);
    }
});
//# sourceMappingURL=Export.js.map