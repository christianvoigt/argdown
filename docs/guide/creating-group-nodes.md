---
title: Creating group nodes
meta:
  - name: description
    content: How you can assign statements and arguments to group nodes in your argument map.
---

# Creating group nodes

Headings define sections in the Argdown document. In the argument map, sections are represented as groups of arguments and statements (visualized as grey boxes). By default, the following rules decide to which group a statement or argument belongs:

:::definition How groups are assigned to statements and arguments

**Statements:** If a statement (equivalence class) is used in several sections in the Argdown document, it will appear in the group of the section where it was **first defined**. If no definition exists for this statement, it will appear in the group where it was **first referred** to.

**Arguments:** The same is true for arguments, except for recontructed arguments. In this case the argument belongs to the group of the section in which its **premise-conclusion-structure (pcs)** was defined.

:::

Let us look at an example. In the following map, two headings were used to define two groups in the argument map. Click on the "Source" button to see
how it was done.

```argdown-map
===
title: "From headings to groups"
sourceHighlighter:
    removeFrontMatter: true
===

# H1

[p]: text
    - <a> // only referred to, not defined
    + <b>: text // first definition of b

## H2

<a>: text // first definition of a

<b> // only referred to, not defined

// but reconstruction takes precedence over definition:
(1) text
(2) text
-----
(3) text
```

Because **H2** is a subsection of **H1**, its group is a child group of **H1's** group. Notice that argument **a** is first used in section **H1**, but is a member of **H2's** group because it was not defined in **H1**.

On the other hand, argument **b** is defined in **H1**, but it is reconstructed in **H2** and reconstructions take precedence over definitions. So **b** is a member of **H2's** group.

## The `groupDepth` group setting

To understand how the `groupDepth` setting works, we need to first define the level of a group:

:::definition The group and section level
Let us call the number of ancestors a section or group has its "level", starting with level 1 for a section or group that is not a subsection or child group of another one of its kind. So a subsection has level 2, a subsubsection has level 3 and so on (you can simply count the number of # characters in a heading to get the level of a section).
:::

Sometimes it is useful to use the lowest section levels of an Argdown document for structuring the text, while only using the higher levels to define groups in the argument map. You can achieve that by using the `groupDepth` parameter of the group settings. In general, if the following is true for a section, it will be ignored in the map:

:::definition Ignored sections

If the following is true, a section will not be turned into a group:

`sectionLevel <= maxLevel - groupDepth`

where `maxLevel` is the maximum section level in the document.
:::

By default, the groupDepth is set to two, which means that it will only use the two highest levels of sections to define groups in the map. If we use three levels, the lowest level will be ignored in the map (`1 <= 3 - 2`). If we set the `groupDepth` parameter to 1 in the previous example, we get the following result:

```argdown-map
===
group:
    groupDepth: 1
===

# H1 // level 1 will be ignored (1 <= 2 - 1)

[p]: text
    - <a>
    + <b>: text

## H2 // level 2 will not be ignored (2 > 2 - 1)

<a>: text

<b>

(1) text
(2) text
-----
(3) text
```

## The `isGroup` data flag

Sometimes you might want to have even more control over which sections should be used as groups in the argument map.

In this case you can use the `isGroup` data flag to explicitely define which sections are defining groups.

```argdown-map
===
group:
    groupDepth: 1
===

# H1

[p]: text

## H2 {isGroup: false}

[p]
    - <a>: text

## H3 {isGroup: true}

[p]
    + <b>: text
```

## The `isInGroup` data flag

If you want to have more control over which statement or argument is in which group, you can use the `isInGroup` data flag.

The flag will put the statement or argument in the group of the current section, even if it is used with a statement or argument reference.

Note that it makes only sense to set the flag once to true. If you use it a second time in a second section, the first flag will be overriden.

The flag will also be ignored if the `isGroup` flag of the current section is set to false or if the current section is outside of the current `groupDepth`.

```argdown-map
===
group:
    groupDepth: 2
sourceHighlighter:
    removeFrontMatter: true
===

# H1

[p]: text
    - <a> {isInGroup: true} // only referred to, but with flag true
    + <b>: text {isInGroup: false} // first definition of b, but with flag false

## H2

<a>: text // first definition of a

<b> {isInGroup: true} // only referred to, but with flag true
```

## Regrouping

With the `regroup` group setting you can completely overwrite the groups derived from headings. By using this method in your config files, you can apply as many arbitrary groupings to the same Argdown document as you like.

```argdown-map
===
group:
    regroup:  [{
            title: "New group 1",
            statements: ["q"],
            tags: ["tag-1", "tag-2"],
            children: [{
                title: "New group 2",
                arguments: ["a", "c"]
            },
            {
                title: "New group 3",
                arguments: ["b", "d"]
            }]
        }]
===

# H1

[p]: text

[q]: text
    +> <a>

## H2 {isGroup: false}

[p]
    - <a>: text
    - <b>: text

## H3 {isGroup: true}

[p]
    + <c>: text
    + <d>: text
```

## Closing Groups

A group can be closed to hide all its children. This is useful to reduce complexity in huge maps.

### Usage with Data Flag:

```argdown-map
[s1]

<a4>
    -> <a2>

# A Closed Group  {isClosed: true}

[s1]
    - <a2> {isInGroup: true}
    + <a3>
```

### Usage in Group Configuration:

The new `group.sections` setting allows to define which sections are closed and which are not groups:

```argdown
===
group:
    sections: {"A Closed Group": {isClosed: true}, "Just a Heading": {isGroup: false}}
===

# A Closed Group

<s1>: I am hidden.
    -> [s2]

# Just a Heading

[s2]: I am free!
```

This allows to use headings as groups without "polluting" the Argdown document with data flags.

### Usage in Regroup Configuration:

```argdown
===
group:
    regroup: [{
            title: "first group",
            statements: ["s1"], arguments: ["a1"],
            children: [
                {
                    title: "some other group",
                    isClosed: true,
                    arguments: ["a2"]
                }
            ]
            }]
===


[s1]: I am a proud member of the first group
    - <a1>: I am a proud member of the first group
        - <a2>: The other group is much more exclusive!

<a3>: Who needs groups?
    -> [s1]
```

## Ignoring Group Data flags

Group data flags can be ignored by using `group.ignoreIsGroup` and `group.ignoreIsClosed`

```argdown
===
group:
    ignoreIsClosed: true
===

[s1]

<a4>
    -> <a2>

# A Closed Group  {isClosed: true}

[s1]
    - <a2> {isInGroup: true}
    + <a3>
```
