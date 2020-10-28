// Using PDFKit fix from here: https://github.com/Pzixel/PDFKit-example/blob/master/webpack.config.js
//@ts-check

("use strict");

const path = require("path");

/**@type {import('webpack').Configuration}*/
const config = {
  target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: "./src/server.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    filename: "server.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js", ".mjs"],
    alias: {
      "unicode-properties": "unicode-properties/unicode-properties.cjs.js",
      pdfkit: "pdfkit/js/pdfkit.js"
    }
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
    },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                sourceMap: true
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: 'string-replace-loader',
        options: {
          search: "var fs = _interopDefault(require('fs'));",
          replace: "var fs = require('fs');",
        },
        enforce: "pre"
      },
      {
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: "transform-loader",
        options:{
          brfs: true
        }
      },
      { test: /pdfkit[/\\]js[/\\]/, loader: "transform-loader",
      options:{
        brfs: true
      } },
      { test: /fontkit[\/\\]index.js$/, loader: "transform-loader",
      options:{
        brfs: true
      } },
      {
        test: /linebreak[\/\\]src[\/\\]linebreaker.js/,
        loader: "transform-loader",
        options:{
          brfs: true
        }
      }
    ]
  },
  experiments: { asyncWebAssembly: true }
};

module.exports = config;
