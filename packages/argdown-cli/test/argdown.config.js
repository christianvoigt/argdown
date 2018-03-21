module.exports = {
    config: {
        inputPath: "./test/test.argdown",
        process: ["build-model", "export-html", "stdout-html"],
        tags: [{ tag: "test-1" }, { tag: "test-2" }],
        model: {
            removeTagsFromText: true
        }
    }
};
