---
sidebar: auto
title: The Syntax
meta:
  - name: description
    content: Official documentation of the Argdown argumentation syntax.
---

<!--ToDo: Verlinkung innerhalb des Dokuments, z.B. equivalence class, relation, etc. -->

# The Syntax

An Argdown document is separated by empty lines into succesive segments of text. Each such segment is a so-called top-level block element.

:::definition Top-level block elements
A top-level block element is an element that is defined in one or more consecutive lines of text and is

- at the document start or preceded by an empty line, and
- at the document end or followed by an empty line.
  :::

**Block elements** may also be used as children of other block elements. In this case they are not separated from their parent element or their siblings by empty lines. Instead they are preceded by a simple line break, indentation and a list item or relation symbol (for example (1) or +).

Each block element that is a child of another block element may have its own children. These are assigned to it by increasing their indentation level by one step. A top level block element may thus have several levels of descendant block elements attached to it.

Other Argdown elements may never be used on their own as top-level elements or as child elements separated by list item or relations symbols. They only appear within a block element and are only separated from other elements by empty spaces. Because they only appear within other block elements they are called **inline elements**.

All but one of the main sections of this documentation describe the block elements of Argdown (of which **statements** and **arguments** are the most important ones ). The subsections of each of these main sections describe the different subtypes of each block element and the elements that they may contain as child elements.

The one main section that does not describe a block element, is the section about Argdown relations. Argdown relations do not occur at the top level and may _not_ be preceded by an empty line. They always connect a new child block element (a statement or an argument) to a preceding parent block element. But it makes sense to give them their own section to avoid repetition and because of their fundamental importance.

## Statements

```argdown-cheatsheet
===
explanation: >
    A paragraph with text is called a "statement" and forms the most basic block element in Argdown.
sourceHighlighter:
    removeFrontMatter: true
===
This is a statement.

This is another statement. It consists
of several sentences and
spans multiple lines. Actually, you can
use
as
many
linebreaks
and
lines
as
you
want.

As long as you leave no empty line,
the statement is not finished.

A statement does not have to
contain a sentence.
It can also consist
of a single letter.

The following
lines contain each an Argdown statement:

a

1

!
```

Statements are used on their own, as members of relations or as premises and conclusions of arguments. They contain the propositional content of an Argdown document. You can also use them to introduce, structure, comment or analyze the argumentation (meta-statements). On the other hand, you may prefer to use Argdown comments for that purpose to keep the meta-commentary clearly separated. Which option you choose is up to you.

```argdown-cheatsheet
===
explanation: >
    A statement in Argdown is a non-repeatable occurrence of characters at a
    specific location within the Argdown document. It is a sequence of token
    instances. That means, for instance, if you copy & paste a statement, you
    define a new statement.
sourceHighlighter:
    removeFrontMatter: true
===
The following two paragraphs
contain two different Argdown
statements:

I am a statement which is
string-identical with another
statement in this document.

I am a statement which is
string-identical with another
statement in this document.
```

### Equivalence classes

As we have seen at the end of the previous section, **statements** in Argdown are defined as **non-repeatable string occurrences**. This may seem counter-intuitive at first but it helps keeping Argdown really simple. Interpreting the same string sequence as referring to the same "propositional content" would create many problems.

Consider for example statements that refer to different things in the same way ("He is the best football player in the world." referring once to Ronaldo and once to Messi). Both statements may contain the same characters but mean different things.

Consider on the other hand statements that have the same meaning but express it differently ("Messi is the best football player in the world.", "The best football player in the world is Messi."). We need to be able to express that these two statements are logically and semantically equivalent. String identity will not help us here.

Still, one might think it absurd that it is impossible in the Argdown syntax to use the same "statement" twice. For example, how do you express that two arguments share a premise or a conclusion?

The solution is simple: Instead of automatically treating identical strings as logically and semantically equivalent, we explicitly state which string occurrences (which "statements") really are equivalent and which are not. By doing so we sort statements into different sets. In Argdown these sets are called **equivalence classes**.

If you want to express that two arguments share the same premise or conclusion or that two differently formulated statements basically mean the same thing, you put them into the same equivalence class. If you want to express that two identical string occurrences mean two different things, you put them in two different equivalence classes.

Actually, to do the latter, you do not have to do anything. By default, every statement is already put into its own equivalence class. You only have to explicitly create a new equivalence class, if you want to populate it with more than one member.

So how do you put two statements into the same equivalence class? You do that by giving them the same title.

### Statement titles

Statement titles are used to explicitly assign the statement to an equivalence class. Each statement is member of one and only one equivalence class and accordingly can have one and only one title.

"Statement titles" look like identifiers for statements, but are actually identifiers of whole equivalence classes with potentially many statements as members. Each statement that does not have a title is automatically member of an untitled equivalence class that can only ever have this one lonely member (because it is impossible to refer to an untitled equivalence class twice).

#### Statement definitions

A statement title followed by a statement text is called a "statement definition":

```argdown-cheatsheet
===
explanation: >
    Statements are given titles by putting the title in square brackets in front of the statement, followed by a colon. If the title is used the first time for a statement, a new equivalence class is created with this title as identifier. If a previously defined statement already has the same title, the new statement is put as a new member into the same equivalence class. (Of course, Argdown can not and will not check if the members of an equivalence class really are logically and semantically equivalent.) In this example, we create an equivalence class with six members.
sourceHighlighter:
    removeFrontMatter: true
===

[First letter]: A is the first letter
of the alphabet.

[First letter]: A is the first letter
of the alphabet.

[First letter]: The first letter
of the alphabet is A.

[First letter]: The alphabet has A
as its first letter.

[First letter]: First in the alphabet's
letters comes A.

[First letter]: The lowest positive
integer is 1. // oops
```

A statement text without a statement title is a statement definition of an "anonymous" statement (belonging to an anonymous equivalence class).

#### Statement references

While you can not repeat a statement in Argdown (because statements are not strings, but string occurrences), you do not have to assign a new member to an equivalence class each time you want to use it.

If you are too lazy to retype a whole statement, you can simply refer to its equivalence class:

```argdown-cheatsheet
===
explanation: >
    Statement titles can also be used without defining a new statement. In this case there is no new member assigned to the equivalence class of this title. Instead, one only refers to the members of this class without changing it.
sourceHighlighter:
    removeFrontMatter: true
===
[Life moves fast]: I said it before
and I'll say it again.
Life moves pretty fast.
If you don’t stop and
look around once in a while,
you might miss it.

// too lazy to type the whole thing again
// let's just refer to it:
[Life moves fast]
```

```argdown-cheatsheet
===
explanation: >
    We do not have to assign members to an equivalence class before we can refer to it. We even can refer to an empty equivalence class to which we will never assign a statement (though it probably doesn't make much sense).
sourceHighlighter:
    removeFrontMatter: true
===
[Back to the future]

[Back to the future]: Meet Marty McFly.
He's broken the time barrier.
Busted his parents' first date.
And, maybe, botched his chances
of ever being born.
```

#### Statement mentions

Sometimes you want to talk about a statement in another statement without actually claiming that it is true. You only want to "mention" it and not "use" it. You can do it by using "statement mentions":

```argdown-cheatsheet
===
explanation: By using an "@" sign before the statement title you can mention an equivalence class within another statement.
sourceHighlighter:
    removeFrontMatter: true
===
[Nietzsche's Slogan]: God is dead.

I do not think that @[Nietsche's Slogan]
makes much sense if you think about it.
```

You can also mention arguments in statements. Take a look at the section on [argument mentions](#argument-mentions) for the details.

Note: By mentioning another element in a statement, you do _not_ define a [relation](#relations) with that element.

### Bold and italic statement text

```argdown-cheatsheet
===
explanation: >
    Statements may contain bold and italic text. The syntax is the same as in Markdown. You can either use asterisks (*) or underscores (_). If you surround text with one asterisk or underscore, it will be turned into italic text. If you surround it with two asterisks or underscores it will be turned into bold text.
sourceHighlighter:
    removeFrontMatter: true
===

This is a statement with _italic text_.

This is a statement with __bold text__.

This is a statement with
__*bold italic text*__.
```

### Links in statement text

```argdown-cheatsheet
===
explanation: >
    Statements may contain links. The syntax is the same as in Markdown. The link text is surrounded by square brackets. The url of the link is surrounded by round brackets.
sourceHighlighter:
    removeFrontMatter: true
===
This is a statement containing
a link to
[wikipedia](https://wikipedia.org).
```

You can link to headings, arguments or statements. To link to a heading, use the heading text in ["slugified"](https://blog.tersmitten.nl/slugify/) form (lowercase, hyphens instead of spaces, removed special characters and punctuation) preceded by "#heading-". To link to an argument or statement, use the title's slugified form, preceded by "#argument-" or "#statement-".

Currently these links will only work in the exported HTML. For arguments and statements it is recommended to use mentions instead.

```argdown-cheatsheet
===
explanation: How to link to headings, statements and arguments.
sourceHighlighter:
    removeFrontMatter: true
===

# This is a heading

[This is a statement]: bla

<This is a an argument>: blabla

[link to heading](#heading-this-is-a-heading)

[link to statement](#statement-this-is-a-statement)

[link to argument](#argument-this-is-an-argument)
```

### Hashtags

```argdown-cheatsheet
===
explanation: >
    Statements may contain hashtags to categorize them according to your own category scheme. Tags will be used in argument maps to colorize statement maps. There are two kinds of tags: hyphenized tags and bracketed tags that may contain empty spaces and punctuation. You can apply as many tags as you want to a statement.
sourceHighlighter:
    removeFrontMatter: true
===
This is a statement categorized
by three tags.
#hyphenized-tag #another-hyphenized-tag
#(bracketed tag!)
```

You can also add hashtags to statements by using statement references.

```argdown-cheatsheet
===
explanation: Adding hashtags to a statement reference.

sourceHighlighter:
    removeFrontMatter: true
===
[Nietzsche's slogan] #atheism #nietzsche
```

### Special Character Shortcodes (for Logical Symbols & Emojis)

```argdown-cheatsheet
===
explanation: >
    Statements may contain shortcodes for special unicode characters. The shortcodes are surrounded by colons or full stops. The parser will transform these shortcodes into unicode characters.
sourceHighlighter:
    removeFrontMatter: true
===
[De Morgan]: .~.(p.^.q) .<->. (.~.p) .v. (.~.q)
    + :happy: :up: :love:
```

This is especially useful if you want to use logical symbols without having to copy & paste the characters into the Argdown document. It is also useful if you want to have some fun with emojis.

[Here](https://argdown.org/guide/using-logical-symbols-and-emojis.html#using-logical-symbols-and-emojis) is a list with all shortcodes currently supported by default. You can add your own [custom shortcodes](https://argdown.org/guide/using-logical-symbols-and-emojis.html#adding-custom-shortcodes) in the Argdown configuration.

:::tip Logical Symbols with ArgVu Ligatures

The shortcodes for logical symbols are even more useful if you use our ArgVu font for Argdown source code and activate the ligatures for these shortcodes. They will then be displayed as the unicode characters they represent _without actually changing the Argdown source code_.

:::

### Statement YAML data

You can add metadata in the [YAML data format](http://yaml.org) to any statement definition or reference. For a quick introduction to YAML see [here](https://www.codeproject.com/Articles/1214409/Learn-YAML-in-five-minutes) or [here](https://learnxinyminutes.com/docs/yaml/).

:::tip Always add empty spaces after colons
The most common pitfall with YAML is that you forget to insert an empty space after the colon that divides a key from its value.

**Wrong:** `key:value`

**Right:** `key: value`

If your YAML code creates errors, you should check this first.
:::

```argdown-cheatsheet
===
explanation: >
    You can put any metadata into curly brackets behind a statement definition or reference. In this case, we save different sources for the statement (the ealiest of which is not even from Nietzsche). In what format you save sources (or other metadata) is up to you or the plugins that work with this data. For example you, could also save sources with additional data like page, year and city of publication.
sourceHighlighter:
    removeFrontMatter: true
===
[Nietzsche's Slogan]: God is dead.
{sources: [
    "Nietzsche, Thus Spoke Zarathustra",
    "Nietzsche, The Gay Science",
    "Mainländer, Die Philosophie der Erlösung"
]}
```

Note that, by default, YAML can be used only in "inline format" which looks just like JSON (YAML is a superset of JSON). If you want to use the block format of YAML as well, you have to insert a linebreak directly after the opening bracket. Doing so, you _have_ to use block format and can _not_ use the inline format (this is because of limitations within Argdown, not within YAML).

```argdown-cheatsheet
===
explanation: YAML block format is activated if the opening bracket is followed by a line break. In this case the YAML parser will ignore the opening and closing brackets and just parse the content between the brackets.
sourceHighlighter:
    removeFrontMatter: true
===
[Nietzsche's Slogan] {
sources:
    - Nietzsche, Thus Spoke Zarathustra
    - Nietzsche, The Gay Science
    - Mainländer, Die Philosophie der Erlösung
}
```

:::warning
Do not use [comments](#comments) instead of YAML data elements to save your data.

```argdown-cheatsheet
===
explanation: If you use comments instead of a YAML data element, the result looks very similar.
sourceHighlighter:
    removeFrontMatter: true
===
[Nietzsche's Slogan] /*
sources:
    - Nietzsche, Thus Spoke Zarathustra
    - Nietzsche, The Gay Science
    - Mainländer, Die Philosophie der Erlösung
*/
```

While it is just as easy to read the comments for humans like yourself, for a computer it is much harder to extract reliable data from comments. Comments do not have to follow any syntax rules at all. Because of this comments are completely ignored by the Argdown parser and its plugins. If you want to make your data accessible for plugins (or other code) you have to save it in the YAML data element.
:::

## Arguments

Arguments are the second basic block elements of Argdown. What is the conceptual difference between an argument and a statement?

Somebody who makes a statement claims that something is true. If you do not know anything about it, this claim alone will not help you much in deciding if you should accept it or not. Somebody who makes an argument for a claim tries to show (by logical inference) that if you already accept some other statements (the premises) you should also accept (and believe) the statement in question (the conclusion).

So while a statement is structurally simple, an argument always has to consist of at least three elements:

- one (or more) premises,
- a conclusion and
- an inference from the premises to the conclusion.

This internal structure is called a **premise-conclusion-structure** (pcs) and we will see in [the next section](#Premise-conclusion-structures) how you can define it in Argdown.
The act of working out an argument's pcs is called **reconstruction** because we often have to add or reformulate parts of the argument that were left implicit.
An argument to which we have assigned a pcs is "reconstructed." If a pcs has not been assigned yet, the argument is still "unreconstructed."

Argdown also supports reconstructing more **complex arguments**: A complex argument consists of a sequence of "inferential steps" from premises to conclusions in which each conclusion is used together with new premises to derive the next conclusion. The last conclusion of such a complex argument is called the **main conclusion**, the others are called **intermediary conclusions**. In contrast, a simple argument only contains one inferential step.

:::tip
A complex argument is logically equivalent to a series of simple arguments that are connected by support relations. In some cases, it may be better to hide the complexity within a complex argument to simplify the argument map. In others, it may be better to show the internal workings between the inferential steps in the argument map. This is a question of complexity managment and style, which is up to you.
:::

The process of working out an argument's premise-conclusion-structure can be tedious and difficult. If you just want to quickly sketch the different arguments in a debate or the main inferential steps in a complex argumentation, defining the pcs of every argument would be reconstructive overkill. Instead, you can simply give all arguments a short title and describe their main drift in a sentence or two.

This section first describes how to **sketch arguments** in Argdown. The next section will turn onto the detailed reconstruction in Argdown and describe premise-conclusion-structures.

:::tip
Even if your ultimate aim is a precise analysis of all arguments in a debate, sketching the arguments is typically a useful first step and should precede detailed reconstruction.
:::

### Argument titles

As we have learned in the [previous main section](#statement-titles), statement titles come in square brackets and assign a statement to an [equivalence class](#equivalence-classes).

Argument titles come in _angle brackets_ and assign a description to an _argument_.

#### Argument definitions

```argdown-cheatsheet
===
explanation: >
    Two sketched arguments supporting a central claim. Each argument is defined by giving it a title in angle brackets, followed by an informal description. In both cases, the description already hints at how the complex premise-conclusion-structure of the argument will look like, even though they both do not mention the main conclusion "God", but only intermediary conclusions from which another inferential step is needed to get to "God".
sourceHighlighter:
    removeFrontMatter: true
===
[God]: There is a god.
    + <Teleological Proof>:
      Since the world is
      intelligently designed,
      there has to be an
      intelligent creator.
    + <Ontological Proof>:
      Whatever is contained
      in a clear and distinct idea
      of a thing must be
      predicated of that thing;
      but a clear and distinct idea
      of an absolutely perfect Being
      contains the idea of
      actual existence;
      therefore, since we have the idea
      of an absolutely perfect Being,
      such a Being must really exist.
```

Argument descriptions can, informally, be thought of as a statement that follows an argument title. But, in Argdown terminology, they are no statements at all, because they do _not_ belong to any equivalence class. You can not give them a statement title. Instead, you assign them to an argument in an argument definition.

An argument can have multiple descriptions as members. An argument can thus be thought of as being something similar to an "equivalence class for argument descriptions". Each argument description belongs to one and only one argument. And just like equivalence classes, arguments can stand in [relation](#relations) to each other or to equivalence classes. While you can _not_ repeat an argument description (because just like a statement it is a string occurrence, not a string, see beginning of Section [Statements](#statements)), you can repeat argument titles, thus assigning different argument descriptions to the same argument.

But this analogy has its limits: Argument descriptions are _not_ supposed to be logically and semantically equivalent. They can summarize an argument very differently:

```argdown-cheatsheet
===
explanation: different descriptions for the same argument that are not logically and semantically equivalent.
sourceHighlighter:
    removeFrontMatter: true
===
<Teleological Proof>:
    Since the world is
    intelligently designed,
    there has to be an
    intelligent creator.

<Teleological Proof>:
    God exists, because
    someone must have designed
    this world.

<Teleological Proof>:
    This world is
    intelligently designed.

<Teleological Proof>:
    Someone must have
    designed this world.
```

#### Argument references

Like [statement titles](#statement-references), you can also use argument titles to refer to an argument without assigning a new description to it:

```argdown-cheatsheet
===
explanation: After defining "Teleological Proof" it is referred to again and attacked by "Evolution explains better".
sourceHighlighter:
    removeFrontMatter: true
===

<Teleological Proof>:
    Because the world is
    intelligently designed
    there has to be an
    intelligent creator.

/* yada yada yada ...*/

<Teleological Proof>
    - <Evolution explains better>:
      The world may seem intelligently
      designed but
      unintelligent
      evolutionary selection
      is a better explanation
      for this than an
      intelligent creator.
```

```argdown-cheatsheet
===
explanation: An argument does not have to be defined first before one can refer to it. It does not even have to be defined at all. In this example, "Ontological Proof" is never defined with an argument description. It is only referred to -- while "Teleological Proof" is referred to before it is defined.
sourceHighlighter:
    removeFrontMatter: true
===
[God]: God exists.
    + <Ontological Proof>
    + <Teleological Proof>

/* yada yada yada ...*/

<Teleological Proof>:
    Because the world is
    intelligently designed
    there has to be an
    intelligent creator.
```

#### Argument mentions

Just like [statements](#statement-mentions), arguments can also be mentioned within other statements or argument descriptions.

```argdown-cheatsheet
===
explanation: Mentioning an argument in a statement
sourceHighlighter:
    removeFrontMatter: true
===
<Teleological Proof>:
    Because the world is
    intelligently designed
    there has to be an
    intelligent creator.

[Wishful thinking]:
    The @<Teleological Proof>
    argument is a good example
    for wishful thinking.
```

For the difference between mentioning something or using it, take a look at the section on [statement mentions](#statement-mentions).

### Argument descriptions

The text of an argument description can contain all child-elements of a normal [statement text](#statements):

- [bold](#bold-and-italic-statement-text) text ranges
- [italic](#bold-and-italic-statement-text) text ranges
- [links](#links-in-statement-text)
- [statement mentions](#statement-mentions)
- [argument mentions](#argument-mentions)
- [tags](#hashtags-in-statement-text)

Tags are especially useful to categorize an argument or the inferences used within the argument.
In the argument map, tags will be used to colorize the argument nodes.

```argdown-cheatsheet
===
explanation: An argument description with text formatting and other inline elements
sourceHighlighter:
    removeFrontMatter: true
===
<Teleological Proof>:
    Because the world is
    [intelligently designed](https://en.wikipedia.org/wiki/Intelligent_design)
    there *has* to be an
    **intelligent creator**.
    #deism #best-explanation
    #inductive
```

You can also assign tags directly to an argument reference.

### Argument YAML data

You can add metadata in the [YAML data format](http://yaml.org) to any argument definition or reference. For more details about YAML data elements see the section on [statement YAML data](#statement-yaml-data).

```argdown-cheatsheet
===
explanation: >
    Two links are added as YAML metadata to the agument "Teleological proof". Note that you do not have to add the YAML data to an argument definition. In this case we simply use an argument reference.

sourceHighlighter:
    removeFrontMatter: true
===
<Teleological proof> {
    links:
        - https://en.wikipedia.org/wiki/Teleological_argument
        - https://plato.stanford.edu/archives/win2016/entries/teleological-arguments/
}
```

## Premise-conclusion-structures

An argument can be reconstructed in detail by assigning a premise-conclusion-structure to it.
You can assign a premise-conclusion-structure to any top-level definition or reference of an argument.
Premise-conclusion-structures are list-like block elements with [pcs-statements](#pcs-statements) as numbered list items.
Pcs-statements are normal statements preceded by a pcs index number in round brackets. A pcs may not contain an empty line.

There are currently two types of pcs-statements: premises and conclusions. Conclusions look like premises, except that they are preceded by an inference. An inference element is separating a conclusion from preceding pcs-statements by a series of hyphens.

:::definition Composition of a premise-conclusion-structure
A pcs is well-formed if and only if it complies with the following rules:

- It is a consecutively numbered list of at least two pcs-statements without any blank lines.
- The second-last and the last pcs-statement in the list are separated by an inference.
- Any other two pcs-statements in the list may be separated by an inference.
  :::

:::definition Premisses, intermediary conclusion, main conclusion
In a well well-formed pcs, every pcs-statement which is preceded by an inference-marker is a conclusion. The last pcs-statement in the list is the **main conclusion**, all other conclusions are **intermediary conclusions**. Pcs-statements that are not conclusions are **premises**.  
:::

```argdown-cheatsheet
===
explanation: >
    A premise-conclusion-structure is assigned to the "Teleological proof" argument. Its pcs-statements consist of one intermediary conclusion (3), one main conclusion (5) and three premises (1, 2, 4). The example makes use of the default inference-marker: a line which contains only a series of hyphens.
sourceHighlighter:
    removeFrontMatter: true
===
<Teleological proof>

(1) The world seems intelligently designed.
(2) The best explanation for
    why the world seems intelligently designed,
    is that there is an
    intelligent being designing it.
-----
(3) Some intelligent being
    designing the world exists.
(4) The only intelligent being
    that could design the world is God.
-----
(5) God exists.
```

A pcs is a block element that can only occur at the top-level of the document, never inside other block elements. You assign a pcs to an argument, by inserting it as next top-level element directly behind an argument definition or reference.

If you are inserting a pcs at the start of the document or after a top-level block element that is not an argument definition or reference, you are creating an _anonymous argument_ without a title. This is similar to using a statement without a title. You can still attack or support this anonymous argument (see Section on [relations](#relations)), but you can not refer to it or add an argument description to it.

### Pcs-statements

Pcs-statements are simply [statements](#statements) preceded by a pcs index number in round brackets and an empty space. Any Argdown statement, including its permissible child elements, may be used in a pcs-statement.

```argdown-cheatsheet
===
explanation: >
    Essentially the same argument as before, articulated and enhanced with statement titles, references, mentions, links, tags and YAML-data.
sourceHighlighter:
    removeFrontMatter: true
===

[Intelligent Design]: The world seems
intelligently designed.

[God]: God exists.

<Teleological proof>

(1) [Intelligent Design]
(2) [Best Explanation]: The best
    explanation for why the world seems
    intelligently designed
    (cf. @[Intelligent Design]),
    is that _there is_ an
    intelligent being designing it.
-----
(3) **Some** intelligent being
    designing the world exists.
    {sources: [
        "Cleanthes"
    ]}
(4) The only intelligent being
    that could [design the world](https://en.wikipedia.org/wiki/Intelligent_design)
    is God. #deism
-----
(5) [God]
```

As explained further below, you can also define relations to other arguments or statements directly below a pcs-statement (see [relations of reconstructed arguments](#relations-of-reconstructed-arguments)).

### Inferences

Inferences in premise-conclusion-structures can be marked simply by a line of at least four hyphens.
This is called a "collapsed inference".

```argdown-cheatsheet
===
explanation: Using a collapsed inference in a pcs.
sourceHighlighter:
    removeFrontMatter: true
===

(1) s1
(2) s2
----
(3) s3
```

You can also specify which inference rules were used or add YAML data to the inference. In this case you have to use the "expanded" inference mode. An expanded inference starts and ends with a line of at least two hyphens. In between these lines you can add a list of inference rules and/or a YAML data element. For more details about YAML data elements see the section on [statement YAML data](#statement-yaml-data).

```argdown-cheatsheet
===
explanation: >
    Using an expanded inference in a pcs. Two inference rules are specified and YAML metadata is added, containing the statements used in the inference and the kind of logic the inference rules are part of.
sourceHighlighter:
    removeFrontMatter: true
===

(1) All humans are mortal.
(2) Socrates is a human.
--
Universal instantiation, Modus Ponens
{uses: [1,2], logic: ["deductive", "predicate logic"]}
--
(3) Socrates is mortal.
```

## Relations

Relations can be defined below statements, arguments, pcs-statements and inferences.
You can express the same relation multiple times in different places and in different ways in the same Argdown document.
The Argdown parser will recognize that you mean the same relation and not draw redundant arrows in the map.

:::definition Defining relations of an element
You define a single relation **r** for any parent relation member **x** (where x can be a statement, argument, pcs-statement or inference) in the following way:

- Insert a _new line_ directly below **x**.
- Indent the line more than **x** is indented.
- Add a _relation symbol_ (+, -, \_, \>\<) plus, possibly, a _direction symbol_ (< or >) to define the type of relation.
- Add the child relation member **y** (a statement or an argument definition or reference).

You can define several relations of **x** in a list by following the steps above for each new relation,
creating a sequence of consecutive lines below **x**, each starting with the same indentation and a relation symbol.
:::

```argdown-cheatsheet
===
explanation: A simple list of pros & cons for and against statement s1.
sourceHighlighter:
    removeFrontMatter: true
===
s1
    + <a>
    + <b>
    - <c>
    - <d>
```

By following these rules you can specify any structure of relations on a given set of elements.

```argdown-cheatsheet
===
explanation: A hierarchic tree of relations, notated in several "flat" lists. Argument a is supporting statement s1. Argument b is attacking argument a. Argument c is supporting argument b. Argument d is supporting argument a. Argument e is attacking statement s1.
sourceHighlighter:
    removeFrontMatter: true
===
s1
    + <a>
    - <e>

<a>
    - <b>
    + <d>

<b>
    + <c>
```

Argdown also allows you to nest definitions of relations in a hierarchical-lists-like fashion:

```argdown-cheatsheet
===
explanation: The same hierarchic tree of relations as before, now defined by nesting relations in multi-level lists.
sourceHighlighter:
    removeFrontMatter: true
===
s1
    + <a>
        - <b>
            + <c>
        + <d>
    - <e>
```

While it is easy to see in this example how such a multi-level tree structure of relations works, it is harder to exactly define its syntax.
Before we can do so, we have to introduce some additional terminology:

:::definition Child and parent members of a relation
Each relation in such a tree consists of a **parent relation member** and a **child relation member**:

- The **child relation member** comes directly behind the relation symbol of this relation (same line).
- The **parent relation member** is the _first_ relation member above the child relation member whose line is indented less than the line of the child relation member.

A relation member can act as parent member in one relation and as a child member in another.
:::

:::definition Root of a relation tree
The **root** of a multi-level tree is the relation member in the first line of the tree.
:::

:::definition Tree level
A relation member's **tree level** is determined by the number of elements in the chain of parent relation members reaching from the relation's child member back to the root element of the tree.
:::

:::definition Composition of a relation tree
A multi-level tree of relations is well-formed if

- there are no empty lines
- all relation members of the same tree level are indented the same number of steps
- all relation members of higher tree levels are indented more steps than relation members of lower tree levels.

:::

Because we can refer to the same argument or eqivalence class several times in the same relation tree, it is possible to define non-hierarchical relations in a single relation tree:

```argdown-cheatsheet
===
explanation: "A non-hierarchical cycle of relations:  Argument b attacks argument a. Argument c supports argument b. Argument a attacks argument c."
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    - <b>
        + <c>
            - <a>
```

### Relation direction

Relations can have two directions: forward-pointing (>) or backward-pointing (<). Relative to the child relation member (the one that is in the same line as the relation and direction symbols) backward-pointing relations are _outgoing_ and forward-pointing relations are _incoming_ relations. The direction of the relation is important for asymmetric relations like attack and support (in which R(A,B) is not the same as R(B,A)). Because the contrary and contradictory relations between statements are symmetric, the relation direction does not matter in these two cases.

For outgoing (backward-pointing) relations the direction can be left implicit (i.e., `<+`=`+`, `<-`=`-` and `<_`=`_`):

```argdown-cheatsheet
===
explanation: two outgoing supports of a and b for s1 and one incoming support of c from s1.
sourceHighlighter:
    removeFrontMatter: true
===

s1
    + <a> // implicit direction
    <+ <b> // explicit direction
    +> <c> // explicit direction
```

### Relations of unreconstructed arguments

Possible relations between arguments are the three dialectical relations _support_, _attack_ and _undercut_.

_Support_ and _attack_ relations can also be defined between arguments and statements.

```argdown-cheatsheet
===
explanation: >
    With implicit relation direction: Statement a is supported by argument b, which is in turn supported by argument c.
sourceHighlighter:
    removeFrontMatter: true
===
[a]
    + <b>
        + <c>
```

```argdown-cheatsheet
===
explanation: >
    With explicit relation direction: Argument a is supported by argument b and statement c.
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    <+ <b>
    <+ [c]
```

```argdown-cheatsheet
===
explanation: Argument a supports argument b and statement c
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    +> <b>
    +> [c]
```

```argdown-cheatsheet
===
explanation: >
    With implicit relation direction: Statement a is attacked by argument b, which is in turn attacked by argument c.
sourceHighlighter:
    removeFrontMatter: true
===
[a]
    - <b>
        - <c>
```

```argdown-cheatsheet
===
explanation: >
    With explicit relation direction: Argument a is attacked by argument b and statement c.
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    <- <b>
    <- [c]
```

```argdown-cheatsheet
===
explanation: Argument a attacks argument b and statement c.
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    -> <b>
    -> [c]
```

```argdown-cheatsheet
===
explanation: >
    With implicit relation direction: Argument a is undercut by argument b
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    _ <b>
```

```argdown-cheatsheet
===
explanation: >
    With explicit relation direction: Argument a is undercut by argument b
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    <_ <b>
```

```argdown-cheatsheet
===
explanation: Argument a undercuts argument b
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    _> <b>
```

### Relations between statements

The Argdown syntax for relations between two statements can be interpreted in two ways. In **loose mode** the possible relations between two statements are "support" and "attack". In **strict mode** the possible relations between two statements are "entailment", "contrariness" and "contradiction".

#### Loose interpretation

The loose interpretation mode is useful for the first rough sketch of a debate or for newcomers to argument reconstruction, who often do not distinguish clearly between arguments and statements. In both cases, statement elements are often used to describe the central claims as well as the arguments of a debate and arrows are used to simply define support and attack relations. Relations between statements are therefore expected to have roughly the same meaning as relations between arguments.

In **loose interpretation mode** relations between two statements that use the + or - relation symbols are therefore interpreted as support and attack relations just like such relations between two arguments or an argument and a statement:

```argdown-cheatsheet
===
explanation: >
    Loose interpretation: statement a is supporting statement b and attacking statement c. Statement a is supported by statement d and is attacked by statement e.
sourceHighlighter:
    removeFrontMatter: true
model:
    mode: loose
===
[a]
    +> [b]
    -> [c]
    <+ [d]
    <- [e]
```

Because the loose interpretation is useful for starting out it is activated by default in Argdown.

#### Strict interpretation

The strict interpretation mode is useful if you want to logically reconstruct a debate in detail. Switching to strict mode gives you more expressive power. You can now distinguish between logical relations between statements (entailment, contrariness, contradiction) and dialectical support and attack relations between an argument and a statement (or another argument).

In **strict interpretation mode** a + relation between two statements is therefore interpreted as meaning that one statement **logically entails** the other. A - relation between two statements is interpreted as meaning that one statement is **logically contrary** to the other. Additionally you can also use >< to state that two statements are **contradictory** to each other.

```argdown-cheatsheet
===
explanation: >
    Strict interpretation: statement a logically entails statement b and is contrary to statement c. Statement d entails statement a. Statement e is contrary to statement a. Statement f and statement a are contradictory to each other.
sourceHighlighter:
    removeFrontMatter: true
model:
    mode: strict
===
[a]
    +> [b]
    -> [c]
    <+ [d]
    <- [e]
    >< [f]
```

If you want to use Argdown parser in strict interpretation mode, you have to use the [`mode: strict`](/guide/configuration-cheatsheet) configuration option of the model plugin (see example above).

##### Why use strict mode?

To give you an example of a use case in which strict mode brings advantages:

- A says: "This suit is too expensive."
- B says: "This suit is really cheap."
- C says: "Are you serious? This suit costs more than I paid for my car! That is way too much money for a suit!"

Let us say our interpretation of this little debate is as follows: A's and B's statements simply contradict each other. Neither A nor B bring forward any reasons that back up their claims. C implicitely agrees with A's claim that the suit is too expensive. But C additionally backs this claim with a reason. Because A's claim contradicts B's claim, C's argument attacks B's claim.

Given that this is our best interpretation and we want to use Argdown to express it, we should use strict mode instead of loose mode. In loose mode we can not express the difference between contradicting someone's claim versus arguing against it. If we switch to strict mode it becomes easy:

```argdown
===
title: Reconstructing in strict mode
model:
    mode: strict
===

[A]: The suit is too expensive

[B]: The suit is cheap.

<C>: The suit costs more than C's car. A suit that costs more than a car is too expensive.

[A]
    - [B] // means: statement A is contrary to statement B

[A]
    + <C> // means: argument C supports statement A
```

##### What difference does it make?

You will see the difference between the modes most clearly if you export your data to JSON, because here the relation objects will have different relationType properties. The difference is less obvious in the argument map:

In the case of + relations, you will not see any difference in your map. Entailment and support are both **asymmetric** relations and are visualized with directed green arrows (with an arrow head at its end and no arrow head at its start).

However, in the case of - relations the difference between modes becomes obvious in the map: While the attack relation is _asymmetric_, the contrary relation is _symmetric_. Thus, in loose mode red arrows between statements will only point in one direction. In strict mode red arrows between statements will point in both directions.

Apart from the JSON data and the visualization of relations, the different interpretations will also have consequences for the automatic derivation of relations from and to reconstructed arguments, as we will see in the next subsection.

:::warning Stay consistent!

Currently the Argdown parser will not check if the different relations you have defined are logically consistent. It is possible to create "nonsense" relations:

```argdown-cheatsheet
===
explanation: >
    In strict mode these relations are logically inconsistent: t1 is contrary to t2, but also entails t2. Which means that if t1 is true, t2 has to be true and false.
sourceHighlighter:
    removeFrontMatter: true
===

[t1]: s1.
    - [t2]: s2.
        + [t1]: s1.
```

:::

### Relations of reconstructed arguments

:::warning

For simplicity's sake it is assumed in this section that the Argdown parser is used in **strict mode** so that relations between statements are interpreted as entailment, contrariness and contradiction.

:::

An argument is "reconstructed" if it has been assigned a [premise-conclusion-structure](#premise-conclusion-structures). In this case you can define the relations of the argument in two ways: Either by adding them below the argument's definitions or references (like you would do for non-reconstructed arguments). Or by specifying directly in the argument's pcs in which relations its premises and its main conclusion stand to other arguments or statements.

```argdown-cheatsheet
===
explanation: Three ways of expressing that a supports b. The third method also specifies exactly which premise is entailed by argument a's main conclusion.
sourceHighlighter:
    removeFrontMatter: true
===
<a>
    +> <b>

<a>

(1) s1
(2) s2
-----
(3) [s3]
    +> <b>
    +> [t1]

<b>

(1) [t1]: s4
(2) s5
-----
(3) s6
```

#### How the Argdown parser derives argument relations from statement relations

If you have defined relations in an argument's pcs, the Argdown parser will automatically derive the argument's relations from the _incoming_ relations of its premises and the _outgoing_ relations of its main conclusion. So, in practical terms, you can simply reconstruct the premise-conclusion-structures of arguments and define the logical relations between their conclusions and premises. Argdown will then automatically add the relations of attack and support between arguments and visualize the entire complex argumentation as an argument map.

:::warning Do not be surprised!

If you first have defined relations for a central claim in your debate and reuse its equivalence class as premise or conclusion in an argument's pcs, you might thereby also have defined relations of this argument that may appear as unexpected arrows in your argument map.

:::

:::definition Derivation of an argument's support relations from its pcs

It is derived that Argument a is **supported** by argument b if either

- b's main conclusion is defined as **entailing** a premise of a or
- b's main conclusion and a premise of a belong to the same **equivalence class** or
- b's main conclusion is defined as **supporting** a.

:::

```argdown-cheatsheet
===
explanation: Statement s2 and statement s3 have the same title t1, which means that they belong to the same equivalence class. Accordingly, argument a supports argument b.
sourceHighlighter:
    removeFrontMatter: true
===

<a>

(1) s1
-----
(2) [t1]: s2

<b>

(1) [t1]: s3
-----
(2) s4
```

:::definition Derivation of an argument's attack relations from its pcs

It is derived that Argument a is **attacked** by argument b if either

- b's main conclusion is defined as **contrary** or **contradictory** to a premise of a or
- b's main conclusion is defined as attacking a.

:::

```argdown-cheatsheet
===
explanation: Equivalence class t1 (of which statement s6 is a member) is contrary to statement s1. Because s1 is used as premise in argument a and s6 is used as conclusion in argument b, argument b is attacking argument a.
sourceHighlighter:
    removeFrontMatter: true
===
<a>

(1) s1
    <- [t1]
(2) s2
-----
(3) s3

<b>

(1) s4
(2) s5
-----
(3) [t1]: s6
```

:::definition Derivation of an argument's undercut relations from its pcs
It is derived that Argument a is **undercut** by argument b if either

- b's main conclusion is defined as **undercutting** an inference of a or
- b's main conclusion is defined as **undercutting** a.
  :::

```argdown-cheatsheet
===
explanation: Equivalence class t1 (of which statement s6 is a member) is undercutting argument a's inference from s1 and s2 to s3. Because t1 is b's conclusion, b is undercutting argument a.
sourceHighlighter:
    removeFrontMatter: true
===
<a>

(1) s1
(2) s2
-----
    <_ [t1]
(3) s3

<b>

(1) s4
(2) s5
-----
(3) [t1]: s6
```

#### How the Argdown parser derives statement relations from argument relations

If you have already defined an argument's relations below its definition or reference and then assign a pcs to this argument, the Argdown parser will automatically derive outgoing relations of the main conclusion from the outgoing relations of the argument.

:::warning Do not be surprised!
If you reuse the equivalence class of an argument's main conclusion elsewhere and have defined outgoing relations for this argument, you thereby have defined outgoing relations of this equivalence class that may appear as unexpected (but technically correct) arrows in your argument map.
:::

:::definition Derivation of outgoing relations of an argument's main conclusion from an argument's outgoing relations
It is derived that the main conclusion of argument a

- is **contrary** to another statement s if a is **attacking** s.

- is **attacking** argument b if a is **attacking** b.

- is **entailing** another statement s if a is **supporting** s.

- is **supporting** argument b if a is **supporting** b.

- is **undercutting** another argument's inference i if a is **undercutting** i.
  :::

```argdown-cheatsheet
===
explanation: Statement s4 is attacked by argument a. Because argument a is reconstructed, that also means that a's conclusion s3 is contrary to statement s4.
sourceHighlighter:
    removeFrontMatter: true
===
<a>

(1) s1
(2) s2
-----
(3) s3

s4
    <- <a>
```

```argdown-cheatsheet
===
explanation: Expresses the same as the previous example by defining an outgoing contrary-relation of conclusion s3 (incoming for s4).
sourceHighlighter:
    removeFrontMatter: true
===
<a>

(1) s1
(2) s2
-----
(3) s3
    -> s4
```

```argdown-cheatsheet
===
explanation: Statement s4 is supported by argument a. Because argument a is reconstructed, that also means that a's conclusion s3 entails statement s4.
sourceHighlighter:
    removeFrontMatter: true
===
<a>

(1) s1
(2) s2
-----
(3) s3

s4
    <+ <a>
```

```argdown-cheatsheet
===
explanation: Statement s1 is attacked by argument b. Because s1 is used as premise in argument a, argument b attacks argument a. Because argument b is also reconstructed, s6 is contrary to s1.
sourceHighlighter:
    removeFrontMatter: true
===
<a>

(1) s1
    <- <b>
(2) s2
-----
(3) s3

<b>

(1) s4
(2) s5
-----
(3) s6
```

```argdown-cheatsheet
===
explanation: Argument a is a complex argument with two inferential steps. Argument b is attacking argument a with an undercut against its first inferential step. Accordingly, Argdown infers that statement s8 undercuts a’s first inferential step.
sourceHighlighter:
    removeFrontMatter: true
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

<b>

(1) s6
(2) s7
----
(3) s8
```

```argdown-cheatsheet
===
explanation: If you prefer it, you can also define undercuts by adding them below the conclusion instead of below the inference. This might look better if you want to define other relations for this conclusion as well.
sourceHighlighter:
    removeFrontMatter: true
===
<a>

(1) s1
(2) s2
-----
(3) s3
    <_ <b>
    +> <c>
    <- <d>
```

:::warning Stay consistent!

Currently the Argdown parser will not check if the derived relations are consistent with the explicitly defined relations. It is possible to create "nonsense" relations:

```argdown-cheatsheet
===
explanation: >
    In strict mode these relations produce a logical inconsistency. t1 is contrary to t2. But because a1 supports t2, it is also derived that its main conclusion t1 entails t2. Taken together this means that if t1 is true, t2 has to be true and false.
sourceHighlighter:
    removeFrontMatter: true
===

[t1]: s1.
    - [t2]: s2.

<a1>

(1) p1
----
(2) [t1]

<a2>

(1) [t2]
  <+ <a1>
----
(2) c

```

:::

## Frontmatter

An Argdown document may start with a YAML frontmatter section containing general information about the document. A frontmatter section starts with three equals signs in the first line of the document and ends with another line of three equal signs. In between these lines you can add any YAML data you like. Like any top-level block element frontmatter has to be separated from other top-level block elements by an empty line.

For more details about YAML data elements see the section on [statement YAML data](#statement-yaml-data).

```argdown
===
title: Argdown vs argument map editors
author: Christian Voigt
date: 29/06/2018
===

[Argdown is the best]: Argdown is the best tool for
analyzing complex argumentation and creating argument maps.

// ...
```

Frontmatter data may contain any settings you can use in a `argdown.config.json` or `argdown.config.js` file. These settings will overwrite any settings in your configuration file. If you want to avoid this you can use the `ignoreFrontmatterSettings` in your config file. If it is set to `true` all settings in the frontmatter will be ignored.

In the following example we change the map settings so that statement labels only show the statement text and argument labels only show the argument title. We also define a title that is used as the title of the generated argument map. Finally, we configure the web component that is displaying this example on this page to initially show the Argdown source code (instead of showing the map):

```argdown
===
title: Using Frontmatter settings to configure the Argdown parser
map:
    statementLabelMode: text
    argumentLabelMode: title
===

[S1]: some text
    - <A1>: a description
```

Click on the map button in the top right corner to see the result.

By the way: In this documentation the frontmatter is used extensively to add data and settings to the code snippets. In some examples you can not see the frontmatter, even though it is used: To avoid distraction, we have sometimes hidden it in the Argdown web component by using the following setting:

```
===
sourceHighlighter:
  removeFrontMatter: true
===
```

## Headings

Markdown-like headings are used in Argdown to structure the text and define a hierarchy of sections. A heading is a top-level block element that can not appear within other block level elements. It begins with one or more hash-characters (`#`) indicating the heading level. To make it possible to derive a hierarchy of sections from headings, a heading of level `x+1` should always be a sub-heading of a level-x heading.

These sections are then used to derive groups of statement and argument nodes in the argument map. For more information on the relations between headings, sections and groups, see the guide on [creating groups in argument maps](/guide/creating-group-nodes.html).

```argdown-cheatsheet
===
explanation: An Argdown document with four headings. H1 is of level 1, H2 and H3 are of level 2 and H4 is of level 3. H2 and H3 define subsections of H1. H4 defines a subsection of H3 and thus a sub-subsection of H1.
sourceHighlighter:
    removeFrontMatter: true
===

# H1

<A1>

## H2

[S1]

## H3

[S1]
    - [A1]

### H4

[S1]
    + [A2]
```

```argdown-cheatsheet
===
explanation: You can add tags and a YAML data element to a heading. Both will be assigned to the section defined by this heading.
sourceHighlighter:
    removeFrontMatter: true
===

# H1 #tag {isGroup: true}
```

In the last example the YAML data is used with the `isGroup` flag. For more information on this flag, see the guide on [creating groups in argument maps](/guide/creating-group-nodes.html).

## Lists

You can use ordered or unordered lists of statements. Lists are block elements that can only occur at the top-level of the document or as nested child lists within another list.

```argdown-cheatsheet
===
explanation: An unordered list
sourceHighlighter:
    removeFrontMatter: true
===

# The central statements of the debate

* [Nietzsche's Slogan]: God is dead.
* [Intelligent Design]: The world is
  intelligently designed
* [Idea Perfect Being]: We have the
  idea of a perfect being.
```

```argdown-cheatsheet
===
explanation: An ordered list. Be careful not to confuse this with a premise-conclusion structure. PCS-Statements are preceded by a statement number in round brackets. Items of an ordered list are preceded by a number followed by a period character.
sourceHighlighter:
    removeFrontMatter: true
===

# The central statements of the debate

1. [Nietzsche's Slogan]: God is dead.
2. [Intelligent Design]: The world is
   intelligently designed
3. [Idea Perfect Being]: We have the
   idea of a perfect being.
```

:::warning nested lists not supported
At the moment Argdown does not support nested lists. This simplifies the parsing process as it does not require the parser to distinguish between list items and relations with the same indentation.

If you want to have more flexibility in your text formatting, we recommend embedding the Argdown sections of your text within a Markdown or Latex document. In the future we will publish software that will help you exporting the embedded Argdown from such documents.
:::

## Comments

You can choose between C-style comments and HTML-style comments.
In contrast to all other elements comments are simply ignored by the Argdown parser and its plugins.
You can use them to hide text from the parser.

```argdown-cheatsheet
===
explanation: C-style comments
sourceHighlighter:
    removeFrontMatter: true
===

<A1> // A C-style line comment

/*
A C-style
multiline
comment
*/

// You can "comment out" elements
// that you want to hide from the parser:
// <A1>: Some text
```

```argdown-cheatsheet
===
explanation: HTML-style comments
sourceHighlighter:
    removeFrontMatter: true
===

<!--
HTML-style comments are
multiline comments
-->

<a>: <!-- comments may appear anwhere
inside block elements
and are simply ignored
by the Argdown parser -->
Now comes the argument description.
```
