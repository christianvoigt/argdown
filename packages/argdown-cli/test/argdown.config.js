module.exports = {
  config: {
    inputPath: "./test/test.argdown",
    process: ["load-file", "parse-input", "build-model", "export-html", "stdout-html"],
    tags: [{ tag: "test-1" }, { tag: "test-2" }],
    model: {
      removeTagsFromText: true
    }
  }
};
