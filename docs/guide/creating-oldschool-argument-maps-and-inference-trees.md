---
title: Creating oldschool argument maps and inference trees
meta:
  - name: description
    content: How you can create argument maps that represent all inferential steps and premises as nodes
---

# Creating oldschool argument maps and inference trees

Most argument mapping tools visualize _all_ statements and inferential steps in a logical reconstruction as nodes in a map. Premises are combined into "linked argumentation" by adding arrows from the premises to small inference nodes that are connected by arrows to the conclusions.

This is a useful visualization style for small debates or if you want to visualize the "inference tree" of a single complex argumentation with many inferential steps.

In contrast, Argdown (being the successor of [Argunet](https://argunet.org)) will by default "hide" some premises and inferential steps inside of argument nodes to reduce visual complexity and make it possible to visualize complex debates (see the sections above for more information about that).

To change this behaviour so that Argdown creates oldschool argument maps you can use the following configuration options:

- use the **"all" statement selection mode** to insert all statements as nodes
- use the **"explodeArguments" setting** to automatically put all inferential steps of an argument into their separate argument nodes
- list the statements that were used in each inferential steps in the conclusion's or inference's **"uses" metadata**
- use the **argument label mode "none"** and the **shape "circle"** to visualize arguments as small colored circles without any text (you can use the statement label mode "text" to save even more space)
- use the **rank direction "TB"** (top to bottom) to let the arrows flow in the same direction as your premise-conclusion-structures

Here is how this will look like (click on the "Source" button to see the configuration):

```argdown-map
===
selection:
  statementSelectionMode: all # adds all statements as nodes to the map
model:
  explodeArguments: true # adds argument nodes for each inferential step of each argument
map:
  argumentLabelMode: none # no text in argument nodes
  statementLabelMode: text # no titles in statement nodes
dot:
    argument:
        shape: circle # argument nodes are in the shape of circles
        minWidth: 0.2 # let's make those circles really small
    graphVizSettings:
        rankdir: TB # arrows flow from top to bottom (to produce a tree-like structure)
===

<My complex argument>

(1) This is the first premise.
(2) This is the second premise.
----
(3) This is the first intermediary conclusion.
(4) This is the third premise.
(5) This is the fourth premise.
// statements used in an inferential step can be either defined in the inference's metadata...
--
{uses: [4,5]}
--
(6) This is the second intermediary conclusion
----
// ...or in the conclusion's metadata
(7) This is the main conclusion  {uses: [3,6]}

```

If you do not want to add these configuration options to each of your Argdown files, you can simply put this `argdown-config.json` file in the directory where you save your Argdown files:

```json
{
  "selection": {
    "statementSelectionMode": "all"
  },
  "model": {
    "explodeArguments": true
  },
  "map": {
    "argumentLabelMode": "none",
    "statementLabelMode": "text"
  },
  "dot": {
    "argument": {
      "shape": "circle",
      "minWidth": 0.3
    },
    "graphVizSettings": {
      "rankdir": "TB"
    }
  }
}
```
