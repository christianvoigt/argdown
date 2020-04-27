import hljs from "highlight.js";
import argdown from "../index";
import "../snow-in-spring.argdown-theme.css";
hljs.registerLanguage("argdown", argdown);

const initialInput = `
===
some: 
    frontmatter:
        - data
        - data
        - data
===

// A comment

/* Another comment */

<!-- Another comment -->

# Argdown Test

Some *Argdown* **Text** with a [link](https://argdown.org) #tag1 #(tag 2) :smiley: .V. \\x

[A]: sadasds
    - <B>
        +> <G>
        <+ <H>
        <_ <I>
        _> <J>
    - <C>: asdasdd
        + [D]: asdad {some: data}
        _ <E>: some undercut
        _> <F>

<K>
    >< <L>

<B>: asdadas

(1) Text
(2) Text
-- adsad ------
(3) Text

(1) Text
(2) Text
--
asdsad {data: "test"}
--
(3) Text
`;
const updateOutput = () => {
  const input = document.querySelector("textarea")!.value;
  const output = document.querySelector("#output")!;
  output.innerHTML = `<pre class="language-argdown"><code data="language-argdown" class="language-argdown">${
    hljs.highlight("argdown", input).value
  }</code></pre>`;
};
document.querySelector("textarea")!.innerHTML = initialInput;
updateOutput();
document.querySelector("#submit")!.addEventListener("click", () => {
  updateOutput();
});
