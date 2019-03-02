module.exports = {
  publicPath: "/sandbox/",
  chainWebpack: config => config.resolve.symlinks(false)
};
