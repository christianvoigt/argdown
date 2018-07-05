module.exports = {
  config: {
    process: "test",
    processes: {
      test: {
        inputPath: "./test/test.argdown",
        process: "export-svg",
        outputSuffix: "-suffix",
        svg: {
          outputDir: "test/svg"
        }
      }
    }
  }
};
