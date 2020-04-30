import { expect } from "chai";
import { addLineBreaks, RangeType } from "../src";

describe("Utils", function() {
  it("can add ranges to text", () => {
    const str = "Test test test";
    const options = {
      maxWidth: 1000,
      applyRanges: [
        { start: 0, stop: 3, type: RangeType.ITALIC },
        { start: 5, stop: 8, type: RangeType.BOLD }
      ]
    };
    const result = addLineBreaks(str, true, options);
    expect(result.text).to.equal(
      "<i>Test</i> &#x20;<b>test</b> &#x20;test&#x20;"
    );
  });
  it("can add nested ranges to text", () => {
    const str = "Test test test";
    const options = {
      maxWidth: 1000,
      applyRanges: [
        { start: 0, stop: 14, type: RangeType.ITALIC },
        { start: 5, stop: 8, type: RangeType.BOLD }
      ]
    };
    const result = addLineBreaks(str, true, options);
    expect(result.text).to.equal(
      "<i>Test&#x20;<b>test</b> &#x20;test&#x20;</i> "
    );
  });
  // it("can add link ranges to text", () => {
  //   const str = "Test test test";
  //   const options = {
  //     maxWidth: 1000,
  //     applyRanges: [
  //       { start: 0, stop: 14, type: RangeType.ITALIC },
  //       { start: 5, stop: 8, type: RangeType.LINK, url: "https://argdown.org" }
  //     ]
  //   };
  //   const result = addLineBreaks(str, true, options);
  //   expect(result.text).to.equal(
  //     `<i>Test&#x20;<a href="https://argdown.org">test</a>&#x20;test&#x20;</i>`
  //   );
  // });
  it("can add nested ranges to multiline text", () => {
    const str = "Test test test";
    const options = {
      lineBreak: "<br/>",
      maxWidth: 20,
      applyRanges: [
        { start: 0, stop: 14, type: RangeType.ITALIC },
        { start: 5, stop: 8, type: RangeType.BOLD }
      ]
    };
    const result = addLineBreaks(str, true, options);
    expect(result.text).to.equal(
      "<i>Test&#x20;<br/><b>test</b> &#x20;<br/>test&#x20;</i> "
    );
  });
});
