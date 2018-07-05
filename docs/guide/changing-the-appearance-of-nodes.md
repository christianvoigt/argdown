# Changing the appearance of nodes

## The canonical member

Equivalence classes can have multiple statements as members. Arguments can have multiple descriptions as members. The Argdown parser has to pick one of these statements or descriptions to represent the equivalence class or argument in the argument map. The member that is picked to officially represent an equivalence class or argument is called the _"canonical member"_.

By default the Argdown parser simply picks the statement or description from the last definition in the document. Let's take a look at how this works:

```argdown
===
selection:
    excludeDisconnected: false
===

<a>: the most convincing argument in the world

<a>: quite obviously nothing more than a simple fallacy // automatically picked as canonical
```

To manually change the canonical member of an argument or equivalence class, you can use the `isCanonical: true` data flag:

```argdown
===
selection:
    excludeDisconnected: false
===

<a>: the most convincing argument in the world {isCanonical: true}

<a>: quite obviously nothing more than a simple fallacy
```

Note that it makes only sense to use this flag once. If you use it a second time, the first occurrence will be ignored.

## Changing the label mode

You can use the `argumentLabelMode` and `statementLabelMode` map settings to change the label type of argument and statement nodes:

- `title`: Show only the title of the statement or argument
- `text`: Show only the text of the canonical statement or argument description.
- `hide-untitled` (default): Show title and text, but hide titles if the argument or equivalence class are anonoymous.

In the following example we use `title` for arguments and `text` for statements:

```argdown
===
title: Using the statementLabelMode and argumentLabelMode map settings.
map:
    statementLabelMode: text
    argumentLabelMode: title
===

[S1]: some text
    - <A1>: a description
```

## Removing tags from text

You can remove any tags from statement or description text by using the `removeTagsFromText` model setting:

```argdown
===
model:
    removeTagsFromText: true
selection:
    excludeDisconnected: false
===

<a>: An #tag-1 argument #tag-2 description #tag-3 without #tag-4 any #tag-5 tags #tag-6
```
