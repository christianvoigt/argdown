// At the moment this is only working in "development" mode. In "production" mode the Argdown in Markdown feature is not working.
// Using PDFKit fix from here: https://github.com/Pzixel/PDFKit-example/blob/master/webpack.config.js

const StringReplacePlugin = require("string-replace-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

//@ts-check

("use strict");

const path = require("path");

/**@type {import('webpack').Configuration}*/
const config = {
  target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"],
    alias: {
      "unicode-properties": "unicode-properties/unicode-properties.cjs.js",
      pdfkit: "pdfkit/js/pdfkit.js"
    }
  },
  plugins: [new StringReplacePlugin()],
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
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: "var fs = _interopDefault(require('fs'));",
              replacement: function() {
                return "var fs = require('fs');";
              }
            }
          ]
        })
      },
      {
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: "transform-loader?brfs"
      },
      { test: /pdfkit[/\\]js[/\\]/, loader: "transform-loader?brfs" },
      { test: /fontkit[\/\\]index.js$/, loader: "transform-loader?brfs" },
      {
        test: /linebreak[\/\\]src[\/\\]linebreaker.js/,
        loader: "transform-loader?brfs"
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        cache: true,
        // sourceMap: true,
        terserOptions: {
          ecma: 8,
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  }
};

module.exports = config;
