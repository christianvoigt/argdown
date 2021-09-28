// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
module.exports = {
  publicPath: "/sandbox/",
  chainWebpack: (config) => {
    config.resolve.symlinks(false);
    config.optimization.minimize(true);
    config.optimization.usedExports(true);
    // config.plugin("bundle-analyzer").use(BundleAnalyzerPlugin);
  },
};
