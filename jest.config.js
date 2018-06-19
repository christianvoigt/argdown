module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["packages/**/*.{ts}", "!**/node_modules/**"],
  roots: ["packages/"],
  setupFiles: ["./babel-polyfill.js"]
};
