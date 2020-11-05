/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    htmlView: "./preview/htmlView.ts",
    dagreView: "./preview/dagreView.ts",
    vizjsView: "./preview/vizjsView.ts",
    pre: "./preview/pre.ts"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      stream: false
    },
    alias: {
      process: "process/browser",
      crypto: "crypto-browserify",
      path: "path-browserify"
    }
  },
  devtool: 'cheap-module-source-map',
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "media")
  },
  node: {
    global: false
  },
 plugins: [
    new webpack.DefinePlugin({
      global: 'window',		// Placeholder for global used in any node_modules
    }),
    // fix "process is not defined" error:
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProvidePlugin({
      path: "path-browserify",
    })
],
 
};
