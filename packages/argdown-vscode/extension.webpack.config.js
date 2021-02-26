// Using PDFKit fix from here: https://github.com/Pzixel/PDFKit-example/blob/master/webpack.config.js
// Using svg-to-pdfkit fix from here: https://github.com/alafr/SVG-to-PDFKit/issues/137
// transform-loader webpack 5: https://github.com/blikblum/pdfkit-webpack-example/issues/9
const TerserPlugin = require("terser-webpack-plugin");
// const { dirname } = require("path");
// const { fileURLToPath } from "url";

// const __dirname = dirname(fileURLToPath(import.meta.url));
//@ts-check

("use strict");

const path = require("path");
const webpack = require("webpack");

/**@type {import('webpack').Configuration}*/
module.exports = {
  target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    alias: {
      "unicode-properties": "unicode-properties/unicode-properties.cjs.js",
      pdfkit: "pdfkit/js/pdfkit.standalone.js"
    },
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"]
    // alias: {
    //     pdfkit: path.resolve(__dirname, 'node_modules/pdfkit/js/pdfkit.standalone.js')
    // }
  },
  module: {
    rules: [
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
        enforce: "pre",
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: "string-replace-loader",
        options: {
          search: "var fs = _interopDefault(require('fs'));",
          replace: "var fs = require('fs');"
        }
      },
      {
        enforce: "pre",
        test: /import-fresh[\/\\]index\.js/,
        loader: "string-replace-loader",
        options: {
          search:
            "return parent === undefined ? require(filePath) : parent.require(filePath);",
          replace:
            "return parent === undefined ? require(/* webpackIgnore: true */ filePath) : parent.require(/* webpackIgnore: true */ filePath);"
        }
      },
      {
        enforce: "post",
        test: /unicode-properties[\/\\]unicode-properties/,
        use: [
          {
            loader: "transform-loader?brfs"
          }
        ]
      }
    ],
    parser: {
      javascript: {
        commonjsMagicComments: true
      }
    }
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        svgtopdf: {
          name: "svgtopdf",
          test: /[\\/]node_modules[\\/]svg-to-pdfkit/,
          chunks: "all"
        }
      }
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        exclude: /svgtopdf/,
        terserOptions: {
          ecma: 8,
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  }
};
