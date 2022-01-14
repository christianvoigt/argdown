// Using PDFKit fix from here: https://github.com/Pzixel/PDFKit-example/blob/master/webpack.config.js
//@ts-check

("use strict");
const webpack = require("webpack");
const path = require("path");
const { IgnorePlugin } = require("webpack");
const optionalPlugins = [];
if (process.platform !== "darwin") {
  optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }));
}

/**@type {import('webpack').Configuration}*/
const config = {
  mode: "none",
  target: "webworker", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: { "server-browser": "./src/server-browser.ts" }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    path: path.resolve(__dirname, "dist/web"),
    filename: "[name].js",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },
  devtool: "nosources-source-map",
  externals: {
    vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js", ".mjs", ".cjs"],
    alias: {
      "unicode-properties": "unicode-properties/unicode-properties.cjs.js",
      pdfkit: "pdfkit/js/pdfkit.js"
    },
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
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: "string-replace-loader",
        options: {
          search: "var fs = _interopDefault(require('fs'));",
          replace: "var fs = require('fs');"
        },
        enforce: "pre"
      },
      {
        test: /unicode-properties[\/\\]unicode-properties/,
        loader: "transform-loader",
        options: {
          brfs: true
        }
      },
      {
        test: /pdfkit[/\\]js[/\\]/,
        loader: "transform-loader",
        options: {
          brfs: true
        }
      },
      {
        test: /fontkit[\/\\]index.js$/,
        loader: "transform-loader",
        options: {
          brfs: true
        }
      },
      {
        test: /linebreak[\/\\]src[\/\\]linebreaker.js/,
        loader: "transform-loader",
        options: {
          brfs: true
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
      }
    ],
    parser: {
      javascript: {
        commonjsMagicComments: true
      }
    }
  },
  plugins: [
    ...optionalPlugins,
    new webpack.ProvidePlugin({
      process: "process/browser" // provide a shim for the global `process` variable
    })
  ],
  performance: {
    hints: false
  },
  experiments: { asyncWebAssembly: true }
};

module.exports = config;
