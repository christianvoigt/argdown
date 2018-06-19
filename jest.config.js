module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["packages/**/*.{ts}", "!**/node_modules/**"],
  roots: ["packages/"],
  setupFiles: ["./babel-polyfill.js"],
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.ts$": "babel-jest"
  }
};
