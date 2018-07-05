# Introduction

This guide describes how you can create argument maps with the Argdown VS Code extension or the Argdown commandline extension. To follow along, you should first [install](/guide/) one of these tools.

Argdown is designed so that you can start writing without having to spend too much thought about the appearance of your argument map. Colors and groups of argument nodes will be automatically generated from the tags and headings you are using in your document. The configuration options described in this guide are for the cases in which these default settings are not enough and you wish to have more control over how the generated argument maps look.

On the other hand, Argdown is also designed to be used as a pure data source that is completely "decoupled" from how the data is visualized. You can produce very different "views" from the same data within an Argdown document. You do not have to change anything in the Argdown document, to create different selections of elements and regroup or recolorize them. The only things that will always stay the same is the "pure data", the content of statements and arguments and the relations defined between them.

Throughout this guide, we will use configuration settings to change the behaviour of the Argdown parser (the "engine" behind the VS Code extension and the commandline tool). We will use the frontmatter section for this purpose so you can see the configuration settings right at the top of each code snippet. In practice it is often better to use external config files. If you want to know more about the configuration options, please read the [configuration guide](/guide/configuration-introduction.html).

:::tip
This is an in-depth guide. You do not have to read all of it to get started with Argdown. The syntax is designed to be self-explaining and easy. You can just start writing and come back whenever you want to know how you can achieve a specific result.

Each section of the guide can be read separately and you can jump right to the sections that you are most interested in.

If you are new to argument maps, it would be a good idea to read the [next two sections](/guide/elements-of-an-argument-map.html). If you are already an expert, the extensive section on [creating statement and argument nodes](/guide/creating-statement-and-argument-nodes.html) might be most interesting for you.
:::
