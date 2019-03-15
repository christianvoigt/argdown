---
title: Creating Argument Maps
meta:
  - name: description
    content: This guide describes how you can create argument maps with the Argdown argumentation syntax.
---

# Creating Argument Maps

This guide describes how you can create argument maps with the Argdown VS Code extension or the Argdown commandline extension. To follow along, you should first [install](/guide/) one of these tools.

Argdown is designed so that you can start writing without having to spend too much thought about the appearance of your argument map. Colors and groups of argument nodes will be automatically generated from the tags and headings you are using in your document. Sometimes, however, these default settings might not be adequate. The configuration options, described in this guide, give you more control over how the generated argument maps look like.

Argdown is also designed to be used as a pure data source that is completely "decoupled" from how the data is visualized. You can produce very different "views" from the same data within an Argdown document by creating different selections of elements and regroup or recolorize them. The only things that will always stay the same is the text of statements and arguments and the relations defined between them.

Throughout this guide, we will use configuration settings in the frontmatter section to change the behaviour of the Argdown parser (the "engine" behind the VS Code extension and the commandline tool). If you want to know more about the configuration options, please read the [configuration guide](/guide/configuration.html).

:::tip
This is an in-depth guide. You do not have to read all of it to get started with Argdown.

If you are new to argument maps, it is probably a good idea to read the [next section](/guide/elements-of-an-argument-map.html). If you are already an expert, the extensive section on [creating statement and argument nodes](/guide/creating-statement-and-argument-nodes.html) might be most interesting for you.
:::
