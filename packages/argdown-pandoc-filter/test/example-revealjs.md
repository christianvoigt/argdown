---
title: Reveal Js Test
argdown:
  config: "./argdown.config.json"
  mode: "web-component"
  sourceHighlighter: "web-component"
---

# Test 1

```argdown
===
webComponent:
    withoutHeader: true
    views:
        map: false
        source: true
===

[s]
    - <a>
```

<div><span>Some really boring html</span></div>

# Test 2

```argdown
===
webComponent:
    withoutHeader: true
    views:
        map: false
        source: true
===

[s]
    + <b>
```

# Test 3

```argdown-map
[s]
    + <b>
```
