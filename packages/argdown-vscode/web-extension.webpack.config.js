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
// const { IgnorePlugin } = require("webpack");
// const optionalPlugins = [];
// if (process.platform !== "darwin") {
//   optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }));
// }

/**@type {import('webpack').Configuration}*/
const webExtensionConfig = {
  mode: "none",
  target: "webworker",
  entry: { "browser-main": path.join(__dirname, "./src/browser-main.ts") }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.join(__dirname, "./dist/web"),
    filename: "[name].js",
    libraryTarget: "commonjs"
  },
  devtool: "nosources-source-map",
  externals: {
    vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
    alias: {
      "unicode-properties": "unicode-properties/unicode-properties.cjs.js",
      pdfkit: "pdfkit/js/pdfkit.standalone.js"
    },
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"],
    // alias: {
    //     pdfkit: path.resolve(__dirname, 'node_modules/pdfkit/js/pdfkit.standalone.js')
    // }
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
      assert: require.resolve("assert"),
      fs: false,
      stream: false,
      crypto: require.resolve("crypto-browserify"),
      path: require.resolve("path-browserify"),
      process: require.resolve("process")
    }
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
    // splitChunks: {
    //   chunks: "all",
    //   cacheGroups: {
    //     svgtopdf: {
    //       name: "svgtopdf",
    //       test: /[\\/]node_modules[\\/]svg-to-pdfkit/,
    //       chunks: "all"
    //     }
    //   }
    // },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        exclude: /svgtopdf/,
        terserOptions: {
          ecma: 2017,
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser" // provide a shim for the global `process` variable
    })
  ],
  performance: {
    hints: false
  }
};
module.exports = [webExtensionConfig];
