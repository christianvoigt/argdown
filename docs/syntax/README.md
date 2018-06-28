---
sidebar: auto
---

# The Argdown Syntax

## Relations

### Defining relations

A single tree of Argdown relations can define an arbitrarily complex non-hierarchical graph of relations.

```argdown-cheatsheet
===
explanation: A simple pro/contra list of arguments for and against statement p.
hide: true
===
[p]
    + <a>
    + <b>
    - <c>
    - <d>
```

```argdown-cheatsheet
===
explanation: A hierarchic tree of relations. Argument a is supporting statement p. Argument b is attacking argument a. Argument c is supporting argument b. Argument d is supporting argument a. Argument e is attacking statement p.
hide: true
===
[p]
    + <a>
        - <b>
            + <c>
        + <d>
    - <e>
```

```argdown-cheatsheet
===
explanation: "A non-hierarchical cycle of relations:  Argument b attacks argument a. Argument c supports argument b. Argument a attacks argument c."
hide: true
===
<a>
    - <b>
        + <c>
            - <a>
```

### Statement relations

```argdown-cheatsheet
===
title: Contrary (implicit incoming relation of p)
explanation: Statement q entails statement p
hide: true
===
[p]
    + [q]
```

```argdown-cheatsheet
===
title: Contrary (explicit incoming relation of p)
explanation: Statement q entails statement p
hide: true
===
[p]
    <+ [q]
```

```argdown-cheatsheet
===
title: Contrary (explicit outgoing relation of p)
explanation: Statement p entails statement q
hide: true
===
[p]
    +> [q]
```

```argdown-cheatsheet
===
title: Contrary (implicit incoming relation of p)
explanation: Statement q is contrary to statement p
hide: true
===
[p]
    - [q]
```

```argdown-cheatsheet
===
title: Contrary (explicit incoming relation of p)
explanation: Statement q is contrary to statement p
hide: true
===
[p]
    <- [q]
```

```argdown-cheatsheet
===
title: Contrary (explicit outgoing relation of p)
explanation: Statement p is contrary to statement q
hide: true
===
[p]
    -> [q]
```

```argdown-cheatsheet
===
title: Contradiction (incoming and outgoing relations of p and q)
explanation: Statement p and statement q are contradictory
hide: true

===
[p]
    >< [q]
```

### Argument relations

```argdown-cheatsheet
===
explanation: Argument a is supported by argument b
hide: true
===
<a>
    + <b>
```

```argdown-cheatsheet
===
explanation: Argument a is supported by argument b
hide: true
===
<a>
    <+ <b>
```

```argdown-cheatsheet
===
explanation: Argument b is supported by argument a
hide: true
===
<a>
    +> <b>
```

```argdown-cheatsheet
===
explanation: Argument a is attacked by argument b
hide: true
===
<a>
    - <b>
```

```argdown-cheatsheet
===
explanation: Argument a is attacked by argument b
hide: true
===
<a>
    <- <b>
```

```argdown-cheatsheet
===
explanation: Argument b is attacked by argument a
hide: true
===
<a>
    -> <b>
```

```argdown-cheatsheet
===
explanation: Argument b is an undercut against argument a
hide: true
===
<a>
    <_ <b>
```

```argdown-cheatsheet
===
explanation: Argument a is an undercut against argument b
hide: true
===
<a>
    _> <b>
```

### Relations of reconstructed arguments

Arguments are considered as "reconstructed" if they have a premise-conclusion-structure.

```argdown-cheatsheet
===
explanation: Statement p' is attacked by argument a. Because argument a is reconstructed, that also means that a's conclusion r is contrary to statement p'.
hide: true
===
<a>

(1) p
(2) q
-----
(3) r

[p']
    <- <a>
```

```argdown-cheatsheet
===
explanation: Statement p' is supported by argument a. Because argument a is reconstructed, that also means that a's conclusion r entails statement p'.
hide: true
===
<a>

(1) p
(2) q
-----
(3) r

[p']
    <+ <a>
```

```argdown-cheatsheet
===
explanation: Statement p is attacked by argument b. Because p is used as premise in argument a, argument b attacks argument a. Because argument b is also reconstructed, c' is contrary to p.
hide: true
===
<a>

(1) p
    <- <b>
(2) q
-----
(3) c

<b>

(1) p'
(2) q'
-----
(3) c'
```

```argdown-cheatsheet
===
explanation: Statement c' is contrary to statement p. Because p is used as premise in argument a and c' is used as conclusion in argument b, argument b is attacking argument a.
hide: true
===
<a>

(1) p
    <- [c']
(2) q
-----
(3) c

<b>

(1) p'
(2) q'
-----
(3) [c']
```

```argdown-cheatsheet
===
explanation: Argument a is a complex argument with two inferential steps. Argument b is attacking argument a with an undercut against its first inferential step.
hide: true
===
<a>

(1) s1
(2) s2
-----
    <_ <b>
(3) s3
(4) s4
-----
(5) s5
```

## Headings

Headings define sections in the Argdown document. In the argument map sections are represented as groups of arguments and statements (visualized as grey boxes).

If a statement is used in several sections in the Argdown document, it will appear in the group of the section in which it was _first_ defined.

The same is true for arguments, except for arguments that are reconstructed and have a premise-conclusion-structure. In this case the argument belongs to the group of the section in which its premise-conclusion-structure (pcs) was defined. If you have defined several different pcss for the same argument, the _last_ one wins as an argument can currently only have one pcs and preceding ones are always overwritten.

Let us look at an example. In the following map, two headings were used to define two groups in the argument map. Click on the "Source" button to see
how it was done.

```argdown-map
===
title: "From headings to groups"
hide: true
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

Because H2 is a subsection of H1, its group is a child group of H1's group. Notice that argument a is first used in section H1, but is a member of H2's group because it was not defined in H1.

On the other hand, argument b _is_ defined in H1, but it is reconstructed in H2 and reconstruction take precedence over definitions. So b is a member of H2's group.

### The `groupDepth` map setting

Let us call the number of ancestors a section or group has its "level", starting with level 1 for a section/group that is not a subsection/child group of another section/group. So a subsection has level 2, a subsubsection has level 3 and so on (you can simply count the number of # characters in a heading to get the level of a section).

Sometimes it is useful to use the lowest section levels of an Argdown document for structuring the text, while only using the higher levels to define groups in the argument map. You can achieve that by using the `groupDepth` parameter of the map settings. In general, if the following is true for a section, it will be ignored in the map: `sectionLevel <= maxLevel - groupDepth`.

By default, the groupDepth is set to two, which means that it will only use the two highest levels of sections to define groups in the map. If we use three levels, the lowest level will be ignored in the map (`1 <= 3 - 2`). If we set the `groupDepth` parameter to 1 in the previous example, we get the following result:

```argdown-map
===
map:
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

### The `isGroup` data flag

Sometimes you might want to have even more control over which sections should be used as groups in the argument map.

In this case you can use the `isGroup` data flag to explicitely define which sections are defining groups.

```argdown-map
===
map:
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

### The `isInGroup` data flag

If you want to have more control over which statement or argument is in which group, you can use the `isInGroup` data flag.

The flag will put the statement or argument in the group of the current section, even if it is used with a statement or argument reference.

Note that it makes only sense to set the flag once to true. If you use it a second time in a second section, the first flag will be overriden.

The flag will also be ignored if the `isGroup` flag of the current section is set to false or if the current section is outside of the current `groupDepth`.

```argdown-map
===
map:
    groupDepth: 2
hide: true
===

# H1

[p]: text
    - <a> {isInGroup: true} // only referred to, but with flag true
    + <b>: text {isInGroup: false} // first definition of b, but with flag false

## H2

<a>: text // first definition of a

<b> {isInGroup: true} // only referred to, but with flag true
```
