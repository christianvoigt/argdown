---
title: Configuration in the Frontmatter section
meta:
  - name: description
    content: How to use the frontmatter section of your Argdown document to change the behaviour of the Argdown tools.
---

# Configuration in the Frontmatter section

While using config files is in most cases the better solution, adding configuration options to your Argdown document has the advantage of being comfortable. It is a good option for quick experimentation or demonstrations.

The Frontmatter section of an Argdown document uses [YAML](yaml.org) as its data format. If you are unfamiliar with YAML or the syntax of the Frontmatter section please read the [section](/syntax/#frontmatter) in the Argdown syntax documentation.

Here is the configuration from the previous section as YAML data in the frontmatter section of an Argdown document:

```argdown
===
  selection:
    excludeDisconnected: false
    selectedSections:
        - H1
    statementSelectionMode: with-relations
  map:
    statementSelectionMode: text
  model:
    removeTagsFromText: true
===

[t1]: s1
    - <a>
    + <b>
```

Throughout the Argdown guides and syntax documentation the Frontmatter configuration option is used extensively to demonstrate the different configuration options.
