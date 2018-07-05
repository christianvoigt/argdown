var testPlugin = {
  name: "TestPlugin",
  run: function() {
    console.log("Hallo World!");
  }
};
module.exports = {
  input: "Hallo Welt!",
  plugins: [{ plugin: testPlugin, processor: "test-processor" }],
  processes: {
    test: { process: ["test-processor"] }
  },
  logLevel: "error"
};
