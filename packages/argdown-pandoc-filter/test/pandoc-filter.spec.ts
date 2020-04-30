const { execSync } = require("child_process");
import { use } from "chai";
const chaiSnapshot = require("mocha-chai-snapshot");
use(chaiSnapshot);

// const tis = this;
function execPandocOnFile(fileName: string) {
  const stdout = execSync(
    `pandoc -s -t markdown test/${fileName} --filter bin/filter.js`
  );
  return String(stdout);
}

describe("Argdown Pandoc Filter", () => {
  it("replaces code block content with file content", () => {
    const output = execPandocOnFile(`example.md`);
    console.log(output);
    //(expect(output).to as any).matchSnapshot(tis);
  });
});
