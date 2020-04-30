# @argdown/highlightjs

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

This package is part of the [Argdown project](https://argdown.org) and adds Argdown language support to highlight.js.

## Installation

```bash
yarn add @argdown/highlightjs
```

```javascript
import hljs from "highlight.js";
import argdown from "@argdown/highlightjs";

hljs.registerLanguage("argdown", argdown);
```
