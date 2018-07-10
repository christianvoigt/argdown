---
sidebar: auto
---

# The Syntax

An Argdown document consists of a sequence of blocks of text separated by empty lines. Each block defines a top-level element. 

:::definition Top-level block elements
A top-level block element is an element that is defined in one or more consecutive lines of text and is

- at the document start or preceded by an empty line
- at the document end or followed by an empty line.
:::

Top-level block elements may contain many other elements as child elements. Some of these elements are of types that may never appear as top-level elements themselves. These are called __inline elements__. Other possible child elements are of a type that may also appear as top-level block elements themselves. These are simply called __block elements__.

All but one of the main sections of this documentation describe the block elements of Argdown. The subsections of each of these main sections describe the different subtypes of each block element and the elements that they may contain as child elements.

The one main section that does not describe a block element, is the section about Argdown relations. Argdown relations may _not_ be preceded by an empty line. Instead they are always part of a block of text defining a different type of top-level element (a statement or an argument). But it makes sense to give them their own section to avoid repetition and because of their fundamental importance.

## Statements

```argdown-cheatsheet
===
explanation: >
    A paragraph with text is called a "statement" and forms the most basic block element in Argdown.
hide: true
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

Statements are used on their own, as members of relations or as premises and conclusions of arguments. They contain the propositional content of an Argdown document. You can also use them to introduce, structure, comment or analyze the argumentation (meta-statements). On the other hand you may prefer to use Argdown comments for that purpose to keep the meta-commentary cleary separated. Which option you choose is up to you.

```argdown-cheatsheet
===
explanation: >
    A statement in Argdown is not a repeatable sequence of character tokens. Instead it is a non-repeatable occurrence of characters at a specific location within the Argdown document. It is a sequence of token instances. If you type the same characters twice, separated by an empty line, you will have defined two different Argdown statements.
hide: true
===
The following two paragraphs
contain two different true
statements.

I am a statement occurring
only once in this document.

I am a statement occurring
only once in this document.
```

### Equivalence classes

As we have seen at the end of the previous section, __statements__ in Argdown are defined as  __non-repeatable string occurrences__. This may seem counter-intuitive at first but it helps keeping Argdown really simple. Interpreting the same string sequence as referring to the same "propositional content" would create many problems. 

Consider for example statements that refer to different things in the same way ("He is the best football player in the world." referring once to Ronaldo and once to Messi). Both statements may contain the same characters but mean different things. 

Consider on the other hand statements that have the same meaning but express it differently ("Messi is the best football player in the world.   ", "The best football player in the world is Messi."). We need to be able to express that these two statements are logically and semantically equivalent. String identity will not help us here.

Still, one might think it absurd that it is impossible in the Argdown syntax to use the same "statement" twice. For example, how do you express that two arguments share a premise or a conclusion?

The solution to all these problems is simple: Instead of automatically treating identical strings as logically and semantically equivalent, we explicitly state which string occurrences (which "statements") really are equivalent and which are not. By doing so we sort statements into different sets. In Argdown these sets are called __equivalence classes__.

If you want to express that two arguments share the same premise or conclusion or that two differently formulated statements basically mean the same thing, you put them into the same equivalence class. If you want to express that two identical string occurrences mean two different things, you put them in two different equivalence classes.

Actually, to do the latter, you do not have to do anything. By default, every statement is already put into its own equivalence class. You only have to explicitely create a new equivalence class, if you want to populate it with more than one member. 

So how do you put two statements into the same equivalence class? You do that by giving them the same title.

### Statement titles

Statement titles are used to explicitely assign the statement to an equivalence class. Each statement is member of one and only one equivalence class and accordingly can have one and only one title. 

"Statement titles" look like identifiers for statements, but are actually identifiers of whole equivalence classes with potentially many statements as members. Each statement that does not have a title is automatically member of an untitled equivalence class that can only ever have this one lonely member (because it is impossible to refer to an untitled equivalence class twice).

#### Statement definitions

A statement title followed by a statement text is called a "statement definition":

```argdown-cheatsheet
===
explanation: >
    Statements are given titles by putting the title in square brackets in front of the statement, followed by a colon. If the title is used the first time for a statement, a new equivalence class is created with this title as identifier. If another statement already has the same title, the new statement is put as a new member into the same equivalence class. Argdown can not and will not check if the members of an equivalence class really are logically and semantically equivalent. It is your responsibility to ensure it. In this example we create an equivalence class with six members.
hide: true
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

A statement text without a statement title is a statement definition of an "anonymous statement" (belonging to an anonymous equivalence class).

#### Statement references

While you can not repeat a statement in Argdown (because statements are not strings, but string occurrences), you do not have to assign a new member to an equivalence class each time you want to use it.

If you are too lazy to retype a whole statement, you can simply refer to its equivalence class:

```argdown-cheatsheet
===
explanation: >
    Statement titles can also be used without defining a new statement. In this case there is no new member assigned to the equivalence class of this title. Instead we only refer to the members of this class without changing it.
hide: true
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
    We do not have to assign members to an equivalence class before we can refer to it. We even can refer to an empty equivalence class to which we will never assign a statement (though you probably should not do it).
hide: true
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
explanation: By using an @ sign before the statement title you can mention an equivalence class within another statement.
hide: true
===
[Nietzsche's Slogan]: God is dead.

I do not think that @[Nietsche's Slogan]
makes much sense if you think about it.
```

A statement _mention_ could only be replaced by a member of the mentioned equivalence class _if it was put in quotes_.

In contrast, a statement _reference_ could be replaced by a member of the referred to equivalence class _without_ putting it into quotes.

You can also mention arguments in statements. Take a look at the section on [argument mentions](#argument-mentions) for the details.

### Bold and italic statement text

```argdown-cheatsheet
===
explanation: >
    Statements may contain bold and italic text. The syntax is the same as in Markdown. You can either use asterisks (*) or underscores (_). If you surround text with one asterisk or underscore, it will be turned into italic text. If you surround it with two asterisks or underscores it will be turned into bold text.
hide: true
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
hide: true
===
This is a statement containing
a link to
[wikipedia](https://wikipedia.org).
```

### Hashtags

```argdown-cheatsheet
===
explanation: >
    Statements may contain hashtags to categorize them according to your own category scheme. Tags will be used in argument maps to colorize statement maps. There are two kinds of tags: hyphenized tags and bracketed tags that may contain empty spaces and punctuation. You can apply as many tags as you want to a statement.
hide: true
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

hide: true
===
[Nietzsche's slogan] #atheism #nietzsche
```

### Statement YAML data

You can add metadata in the [YAML data format](http://yaml.org) to any statement definition or reference. For a quick introduction to YAML see [here](https://www.codeproject.com/Articles/1214409/Learn-YAML-in-five-minutes) or [here](https://learnxinyminutes.com/docs/yaml/).

:::tip Always add empty spaces after colons
The most common pitfall with YAML is that you always have to insert an empty space after the colon that divides a key from its value. 

**Wrong:** `key:value`

**Right:** `key: value`

If your YAML code creates errors, you should check this first.
:::

```argdown-cheatsheet
===
explanation: >
    You can put any metadata into curly brackets behind a statement definition or reference. In this case we save different sources for the statement (the ealiest of which is not even from Nietzsche). In what format you save sources (or other metadata) is up to you or the plugins that work with this data. For example you could also save sources with additional data like page, year and city of publication.
hide: true
===
[Nietzsche's Slogan]: God is dead.
{sources: [
    "Nietzsche, Thus Spoke Zarathustra",
    "Nietzsche, The Gay Science",
    "Mainländer, Die Philosophie der Erlösung"
]}
```

Note that by default, YAML can be used only in "inline format" which looks just like JSON (YAML is a superset of JSON). If you want to use the block format of YAML as well, you have to insert a linebreak directly after the opening bracket. Doing so you _have_ to use block format and can _not_ use the inline format (this is because of limitations within Argdown, not within YAML).

```argdown-cheatsheet
===
explanation: YAML block format is activated if the opening bracket is followed by a line break. In this case the YAML parser will ignore the opening and closing brackets and just parse the content between the brackets.
hide: true
===
[Nietzsche's Slogan] {
sources:
    - Nietzsche, Thus Spoke Zarathustra
    - Nietzsche, The Gay Science
    - Mainländer, Die Philosophie der Erlösung
}
```

:::warning
Do not use comments instead of YAML data elements to save your data.

```argdown-cheatsheet
===
explanation: If you use comments instead of a YAML data element, the result looks very similar.
hide: true
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

Somebody who makes a statement claims that something is true. If you do not know anything about it, this claim alone will not help you much in deciding if you should accept it or not. Somebody who makes an argument for a claim, tries to show (by logical inference) that if you already accept some other statements (the premises) you should also accept (and believe) the statement in question (the conclusion). 

So while a statement is structurally simple, an argument always has to consist of at least three elements: 

* one (or more) premises, 
* a conclusion and 
* an inference from the premises to the conclusion.

This internal structure is called a __premise-conclusion-structure__ (pcs) and we will see in this section how you can define it in Argdown. The act of defining an argument's pcs is called __logical reconstruction__. An argument for which we have defined its pcs is "reconstructed". If we have not done so yet, the argument is still "unreconstructed".

Argdown also supports reconstructing more __complex arguments__: A complex argument consists of a sequence of "inferential steps" from premises to conclusions in which each conclusion is used together with new premises to derive the next conclusion. The last conclusion of such a complex argument is called the __main conclusion__, the others are called __preliminary conclusions__. In contrast, a simple argument only contains one inferential step.

:::tip
A complex argument is logically equivalent to a series of simple arguments that are connected by support relations. In some cases it may be better to hide the complexity within a complex argument to simplify the argument map. In others it may be better to show the internal workings between the inferential steps in the argument map. This is a question of complexity managment and which style you choose is up to you.
:::

The process of logical reconstruction is often quite tedious and difficult. If we just want to quickly sketch the different arguments in a debate or the main inferential steps in a complex argumentation, defining the pcs of every argument would be reconstructive overkill. Instead you can start out by giving all arguments a short title and describing their main drift in a sentence or two.

This documentation first describes how to __sketch arguments__ in Argdown. Then it will turn onto the logical reconstruction in Argdown and describe premise-conclusion-structures in detail.

### Argument titles

As we have learned in the [previous main section](#statement-titles), statement titles come in square brackets and assign a statement to an [equivalence class](#equivalence-classes).

Argument titles come in _angle brackets_ and assign a description to an _argument_.

#### Argument definitions

```argdown-cheatsheet
===
explanation: >
    Two sketched arguments, each defining an argument by giving it a title in angle brackets, followed by the informal description of the argument. In both cases the description already hints at how the complex premise-conclusion-structure of the argument will look like, even though they both do not mention the main conclusion "God", but preliminary conclusions from which another inferential step is needed to get to "God".
hide: true
===
[God]: There is a god.
    + <Teleological Proof>:
      Because the world is
      intelligently designed
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
      therefore since we have the idea
      of an absolutely perfect Being
      such a Being must really exist.
```

Argument descriptions can be thought of as a statement that follows an argument title. But in the strict sense they are no statements at all, because they do _not_ belong to any equivalence class. You can not give them a statement title. Instead you assign them to an argument in an argument definition.

An argument can have multiple descriptions as members. An argument can thus be thought of as being something similar to an "equivalence class for argument descriptions". Each argument description belongs to one and only one argument. And just like equivalence classes, arguments can stand in relation to each other or to equivalence classes. While you can _not_ repeat an argument description (because just like a statement it is a string occurrence, not a string), you can repeat argument titles, thus assigning different argument descriptions to the same argument.

But this analogy has its limits: Argument descriptions do _not_ have to be logically and semantically equivalent. They can summarize an argument very differently:

```argdown-cheatsheet
===
explanation: different descriptions for the same argument that are not logically and semantically equivalent.
hide: true
===
<Teleological Proof>:
    Because the world is
    intelligently designed
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

Like [statement titles](#statement-references) you can also use argument titles to refer to an argument without assigning a new description to it:

```argdown-cheatsheet
===
explanation: After defining "Teleological Proof" it is referred to again and attacked by "Evolution explains better".
hide: true
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
explanation: An argument does not have to be defined first before one can refer to it. It does not even have to be defined at all. In this example, "Ontological Proof" is never defined with an argument description. It is only referred to, while "Teleological Proof" is referred to before it is defined.
hide: true
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
hide: true
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
hide: true
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

hide: true
===
<Teleological proof> {
    links:
        - https://en.wikipedia.org/wiki/Teleological_argument
        - https://plato.stanford.edu/archives/win2016/entries/teleological-arguments/
}
```

### Premise-conclusion-structures

Sketched arguments are __logically reconstructed__ by assigning a premise-conclusion-structure (pcs) to them. Premise-conclusion-structures are list-like block elements with pcs-statements as numbered list items. Pcs-statements are normal statements preceded by a pcs index number in round brackets. A pcs may not contain an empty line.

There are currently two types of pcs-statements: premises and conclusions. Conclusions look like premises, except that they are preceded by an inference element. An inference element is separating its conclusion from its premises by a series of hyphens.

:::definition Composition of a premise-conclusion-structure 
A well-formed pcs complies to the following rules:

- it starts with at least one premise
- it ends with a main conclusion, preceded by an inference
- it may contain additional "inferential steps", each at least containing a preliminary conclusion preceded by an inference
- each inferential step may contain additional premises and may make of use of preceding conclusions or premises
:::

A pcs is a block element that can only occur at the top-level of the document, never inside other block elements. You assign a pcs to an argument, by inserting it as next top-level element directly behind an argument definition or reference.

```argdown-cheatsheet
===
explanation: >
    A premise-conclusion-structure is assigned to the "Teleological proof" argument. Its pcs-statements consist of one preliminary conclusion (3), one main conclusion (5) and three premises (1, 2, 4). The argument consists of two inferential steps: The first from 1 and 2 to 3. And the second from 3 and 4 to 5.
hide: true
===
<Teleological proof>

(1) The world is intelligently designed.
(2) The best explanation,
    why the world is intelligently designed,
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

If you are inserting a pcs at the start of the document or after a top-level block element that is not an argument definition or reference, you are creating an _anonymous argument_ without a title. This is similar to using a statement without a title. You can still attack or support this anonymous argument, but you can not refer to it or add an argument description to it.

### Inferences

Inferences in premise-conclusion-structures can be marked simply by a line of at least four hyphens.
This is called a "collapsed inference".

```argdown-cheatsheet
===
explanation: Using a collapsed inference in a pcs.
hide: true
===

(1) s1
(2) s2
----
(3) s3
```

You can also specify which inference rules where used or add YAML data to the inference. In this case you have to use the "expanded" inference mode. An expanded inference starts and ends with a line of at least two hyphens. In between these lines you can add a list of inference rules and/or a YAML data element. For more details about YAML data elements see the section on [statement YAML data](#statement-yaml-data).

```argdown-cheatsheet
===
explanation: >
    Using an expanded inference in a pcs. Two inference rules are specified and YAML metadata is added, containing the statements used in the inference and the kind of logic the inference rules are a part of.
hide: true
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

Relations can be defined between statements, arguments and inferences. You can express the same relation in different places and in different ways in the Argdown document. The Argdown parser will recognize that you mean the same relation and not draw redundant arrows in the map.

:::definition Composition of a relation tree
You define a relation for any statement, argument or inference **x** by:

- adding a _new line_ below **x** or below any other relation defined below x as long as you leave no empty line in between
- _indenting_ the new line more than **x** is indented and less than any other relation directly under x that is not itself a relation of x
- adding a _relation symbol_ (+, -, \_, \>\<) and in most cases a _direction symbol_ (< or >)
- adding the other relation member **y** (statement, argument or inference) directly behind the symbol after an empty space.

For any such relation member **y** you can also add relations beneath it by following the same rules, thus creating a multi-level tree structure of relations.
:::

Using this syntax you can define an arbitrarily complex non-hierarchical graph of relations within a single tree of Argdown relations.

```argdown-cheatsheet
===
explanation: A simple pro/contra list of arguments for and against statement s1.
hide: true
===
s1
    + <a>
    + <b>
    - <c>
    - <d>
```

```argdown-cheatsheet
===
explanation: A hierarchic tree of relations. Argument a is supporting statement s1. Argument b is attacking argument a. Argument c is supporting argument b. Argument d is supporting argument a. Argument e is attacking statement s1.
hide: true
===
s1
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

### Relation direction

Relations can have two directions: forward-pointing (>) or backward-pointing (<). Relative to the second relation member (the one that is in the same line as the direction symbol) backward-pointing relations are _outgoing_ and forward-pointing relations are _incoming_ relations. The only exception is the contradiction (><) which is a symmetric relation between two statements and thus always goes in both ways.

For outgoing relations the direction can be left implicit:

```argdown-cheatsheet
===
explanation: two outgoing supports of a and b for s1 and one incoming support c from s1.
hide: true
===

s1
    + <a> // implicit direction
    <+ <b> // explicit direction
    +> <c> // explicit direction
```

### Statement relations

Possible relations between statements are the three logical relations _entailment_, _contrariness_ and _contradiction_.
One logical relation is missing from this list: **equivalence** between statements. This relation is modeled in Argdown with
equivalence classes and thus does not need its own relation symbol.

```argdown-cheatsheet
===
explanation: Statement s2 entails statement s1
hide: true
===
s1
    + s2
```

```argdown-cheatsheet
===
explanation: Statement s2 entails statement s1
hide: true
===
s1
    <+ s2
```

```argdown-cheatsheet
===
explanation: Statement s1 entails statement s2
hide: true
===
s1
    +> s2
```

```argdown-cheatsheet
===
explanation: Statement s2 is contrary to statement s1
hide: true
===
s1
    - s2
```

```argdown-cheatsheet
===
explanation: Statement s2 is contrary to statement s1
hide: true
===
s1
    <- s2
```

```argdown-cheatsheet
===
explanation: Statement s1 is contrary to statement s2
hide: true
===
s1
    -> s2
```

```argdown-cheatsheet
===
explanation: Statement s1 and statement s2 are contradictory
hide: true

===
s1
    >< s2
```

### Argument relations

Possible relations between arguments are the three dialectical relations _support_, _attack_ and _undercut_.

_Support_ and _attack_ relations can also be defined with an argument as a source and a statement as a target.

::: tip
It is also possible to define these relations with a _statement_ as the source and an argument as a target. If the statement is _not_ a conclusion of an argument (see below) such relations are not pure dialectic relations in the narrow sense.

Argdown is intentionally not too strict about which relations are permissible. Whenever possible you should avoid such relations in favor of "pure" dialectical or logical relations. If you want to express which statements are used as premises in an argument, you should explicitely reconstruct the premise-conclusion-structure of the argument.
:::

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
explanation: Argument a supports argument b
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
explanation: Argument a attacks argument b
hide: true
===
<a>
    -> <b>
```

```argdown-cheatsheet
===
explanation: Argument a is undercut by argument b
hide: true
===
<a>
    _ <b>
```

```argdown-cheatsheet
===
explanation: Argument a is undercut by argument b
hide: true
===
<a>
    <_ <b>
```

```argdown-cheatsheet
===
explanation: Argument a undercuts argument b
hide: true
===
<a>
    _> <b>
```

### Relations of reconstructed arguments

Arguments are considered as "reconstructed" if they have an internal premise-conclusion-structure.

In this case the dialectical attack and support relations can be defined in terms of logical relations between statements:

:::definition The logical definition of dialectical relations
Argument a is **supported** by argument b iff a's main conclusion **entails** a premise of b.

Argument a is **attacked** by argument b iff a's main conclusion is **contrary** to a premise of b.
:::

Because statement p entails statement q if p is _equivalent_ with q, argument a is also supported by argument b if a's main conclusion is equivalent with a premise of b (which means in Argdown that the two statements share the same title).

Even though it is not as easy to define undercuts in terms of logical relations between statements, an undercut can at least also be defined in terms of an argument's internal premise-conclusion-structure:

:::definition Logical definition of an undercut
Argument a is an **undercut** of argument b iff a's main conclusion __undermines__ an inferential step of a.
:::

If an argument's premise-conclusion-structure contains several inferential steps, you can define which inferential step is undermined by an undercut.

Because of these definitions, if you reconstruct the premise-conclusion-structures of arguments you can much more precisely express dialectical relations between them by defining logical relations between their conclusions and premises. And you can also express logical relations between an argument's main conclusion and other statements by defining dialectical relations between the argument and these other statements:

```argdown-cheatsheet
===
explanation: Statement s4 is attacked by argument a. Because argument a is reconstructed, that also means that a's conclusion s3 is contrary to statement s4.
hide: true
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
hide: true
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
hide: true
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
explanation: Statement s3 and statement s4 have the same title t1, which means that both are logically equivalent. Because equivalency implies entailment, argument a supports s4.
hide: true
===
<a>

(1) s1
(2) s2
-----
(3) [t1]: s3

[t1]: s4
```

```argdown-cheatsheet
===
explanation: Statement s1 is attacked by argument b. Because s1 is used as premise in argument a, argument b attacks argument a. Because argument b is also reconstructed, s6 is contrary to s1.
hide: true
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
explanation: Equivalence class t1 (of which statement s6 is a member) is contrary to statement s1. Because s1 is used as premise in argument a and s6 is used as conclusion in argument b, argument b is attacking argument a.
hide: true
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

```argdown-cheatsheet
===
explanation: If you prefer it, you can also define undercuts by adding them below the conclusion instead of below the inference. This might look better if you want to define other relations for this conclusion as well.
hide: true
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

In the following example we change the map settings so that statement labels only show the statement text and argument labels only show the argument title. We also define a title that is used as the title of the generated argument map:

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

By the way: In this documentation the frontmatter is used extensively to add data and settings to the code snippets. You can not see this, because the frontmatter section is omitted in html snippets by using the flag `hide: true` in the frontmatter.

## Headings

Markdown-like headings are used in Argdown to structure the text and define a hierarchy of sections. A heading is a top-level block element that can not appear within other block level elements. It begins with one or more hash-characters (`#`) indicating the heading level. To make it possible to derive a hierarchy of sections from headings, a heading of level `x+1` should always be a sub-heading of a level-x heading.

These sections are then used to derive groups of statement and argument nodes in the argument map. For more information on the relations between headings, sections and groups, see the guide on [creating groups in argument maps](/guide/creating-group-nodes.html).

```argdown-cheatsheet
===
explanation: An Argdown document with four headings. H1 is of level 1, H2 and H3 are of level 2 and H4 is of level 3. H2 and H3 define subsections of H1. H4 defines a subsection of H3 and thus a sub-subsection of H1.
hide: true
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
hide: true
===

# H1 #tag {isGroup: true}
```

In the last example the YAML data is used with the `isGroup` flag. For more information on this flag, see the guide on [creating groups in argument maps](/guide/creating-group-nodes.html).

## Lists

You can use ordered or unordered lists of statements. Lists are block elements that can only occur at the top-level of the document or as nested child lists within another list.

```argdown-cheatsheet
===
explanation: An unordered list
hide: true
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
hide: true
===

# The central statements of the debate

1. [Nietzsche's Slogan]: God is dead.
2. [Intelligent Design]: The world is
   intelligently designed
3. [Idea Perfect Being]: We have the
   idea of a perfect being.
```

```argdown-cheatsheet
===
explanation: Lists can be nested.
hide: true
===

# The central statements of the debate

* Atheist statements
    1. [Nietzsche's Slogan]: God is dead.
* Deist statements
    2. [Intelligent Design]: The world is
       intelligently designed
    3. [Idea Perfect Being]: We have the
       idea of a perfect being.
```

## Comments

You can choose between C-style comments and HTML-style comments.
In contrast to all other elements comments are simply ignored by the Argdown parser and its plugins.
You can use them to hide text from the parser.

```argdown-cheatsheet
===
explanation: C-style comments
hide: true
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
hide: true
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
