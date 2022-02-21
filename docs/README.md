---
home: true
tagline: A simple syntax for complex argumentation
heroText: Argdown
heroImage: /argdown-arrow.png
actionText: Get Started →
actionLink: /guide/

footer: MIT Licensed | Copyright © 2018-present Christian Voigt | Funded by Debatelab, KIT Karlsuhe
---

<p class="latest-news">February 2022: v1.8.2 has been released (<a href="/changes">changelog</a>)</p>
<div class="features">
  <div class="feature">
    <h2>Simple</h2>
    <p>Writing pros & cons in Argdown is as simple as writing a Twitter message. You don't have to learn anything new, except a <a href="#learn-argdown-in-3-minutes">few simple rules</a> that will feel very natural.</p>
  </div>
  <div class="feature">
    <h2>Expressive</h2>
    <p>With these simple rules you will be able to define more complex relations between arguments or <a href="/guide/a-first-example">dive into the details</a> of their logical premise-conclusion structures.</p>
  </div>
  <div class="feature">
    <h2>Powerful</h2>
    <p>Argdown can even be used within Markdown! Your code is transformed into an <a href="https://en.wikipedia.org/wiki/Argument_map">argument map</a> while you are typing. When your are ready, you can publish your analysis as pdf, embed it as a web-component in a webpage or simply export your map as an image.</p>
  </div>
</div>

```argdown-map

===
title: >
  A first example (with arguments from 'The Debaters Handbook')
subTitle: Some Pros and Cons Reconstructed in Detail
author: Gregor Betz
date: 24/10/2018
color:
    colorScheme: colorbrewer-category9
    tagColors:
        pro: 0
        con: 1
model:
    removeTagsFromText: true
===


/***
 * This debate serves as "first example"
 * in the online Argdown Guide
***/



/*
Two central claims
*/

[Censorship]: Censorship is not wrong in principle.

[Absolute Freedom of Speech]: Freedom of speech is an
absolute right.


/*
Arguments of the debate
*/

<Argument from Freedom of Speech>: Censorship is wrong in
principle. In a free and civilized society, everyone must
be free to express herself. #con {source: "C1a"}

(1) [Absolute Freedom of Speech]
(2) Censorship violates freedom of speech.
(3) Whatever violates an absolute right, is itself wrong in
principle.
--
Specification, Modus ponens {uses: [1,2,3]}
--
(4) Censorship is wrong in principle.
    -> [Censorship]


<No-Harm trumps Freedom-of-Speech>: Freedom of speech
ceases to be a right when it causes harm to others.
Therefore freedom of speech is never an absolute right but
an aspiration. #pro {source: "P1a"}

(1) Sometimes, free speech causes serious harms to others.
(2) Whatever causes serious harms to others is not
permissible.
(3) If freedom of speech is sometimes not permissible, then
freedom of speech is not an absolute right.
----
(4) Freedom of speech is not an absolute right.
    -> [Absolute Freedom of Speech]


<Argument from racial hatred>: Legislation against
incitement to racial hatred is permissible. Thus,
censorship is not wrong in principle. #pro {source: "P1b"}

(1) [IRC-legislation]: Legislation against incitement to
racial hatred is permissible. {isInMap: false}
(2) Legislation against incitement to racial hatred is a
form of censorship.
----
(3) [Censorship]


<Importance of inclusive public debate>: Legislation
against incitement to racial hatred drives racists and
others underground rather than drawing them into open and
rational debate. #con {source: "C1b"}

(1) We will only have an open, maximally-inclusive and
rational societal debate, if racists are not driven
underground.
(2) If legislation against incitement to racial hatred is
enacted, racists and others are driven underground.
-----
(3) We will only have an open, maximally-inclusive and
rational societal debate, if legislation against incitement
to racial hatred is not enacted.
(4) We ought to have an open, maximally-inclusive and
rational societal debate.
-----
(5) Legislation against incitement to racial hatred ought
not be enacted.
  -> [IRC-legislation]


<Excessive sex and violence>: Excessive sex and violence in
film and television contribute to a tendency towards
similar behaviour in spectators. In these cases, censorship
is obligatory. #pro {source: "P2"}

(1) [Causal link]: Excessive sex and violence in film and
television contributes to a tendency towards similar
behaviour in spectators.  {isInMap: false}
(2) Whatever contributes to an tendency towards criminal
behaviour may be legally banned, except more weighty
reasons speak against doing so.
(3) There are no substantial reasons against legally
banning excessive sex and violence in film and television.
-----
(4) Excessive sex and violence in film and television may
be legally banned.
(5) If excessive sex and violence in film and television
may be legally banned, censorship is not wrong in principle.
-----
(6) [Censorship]


<Argument from expertise>: Scientific studies have
established a causal link between violence in film and a
similar behaviour in spectators. #pro

(1) Scientific studies have established that excessive sex
and violence in film and television contributes to a
tendency towards similar behaviour in spectators (@[Causal
link]).
(2) If scientific studies have established that X and if
there is no evidence against X being the case, then X.
----
(3) [Causal link]


<Causal link questionable>: The link between sex and
violence on screen and in real life is far from conclusive.
The individual's personality make her watch violent videos,
not vice versa. #con {source: "C2"}

(1) The consumption of violent video is correlated with
violent and criminal behaviour.
(2) The best explanation for this correlation is that those
individuals who _already have tendencies_ to violence are
likely to watch violent `video nasties', just as those with
a predilection for rape are likely to use pornography.
--
Inference to the best explanation {uses: [1,2]}
--
(3) A disposition for criminal behaviour causes the
consumption of violent video.
(4) Causal relations are asymmetric.
-----
(5) The consumption of violent video does not bring about a
disposition for criminal behaviour.
  -> [Causal link]
```

If you are new to argument mapping, read our [tutorial](/guide/a-first-example.md) about how this debate was reconstructed.

:::tip Choose your own argument map style
This map hides a lot of the logical details for simplicty's sake (to dive into the details, click on "Source"). If you prefer argument maps where _every_ premise and inferential step is visualized, it takes [only a few configuration changes](/guide/creating-oldschool-argument-maps-and-inference-trees.html) to produce them with Argdown.
:::

## Learn Argdown in 3 Minutes

Argdown's formula consists of three ingredients:

### _1_ Nested lists of pros & cons

Statement titles come in square brackets, argument titles in angle brackets.

```argdown-map
===
webComponent:
  initialView: source
sourceHighlighter:
  removeFrontMatter: true
===

[Argdown is the best]: Argdown is the best
tool for analyzing complex argumentation
and creating argument maps.
  - <Editors easier>: Argument map editors
    are way easier to use. #pro-editor
    + <WYSIWYG>: In argument map editors what
      you see during editing is what you get
      at the end: an argument map. #pro-editor
  + <Pure Data>: With Argdown no user interface
    gets in your way. You can focus on writing
    without getting distracted.
```

::: tip How to get the argument map

Click on the **Map** button in the upper right corner to see the resulting argument map.

This will work for _all_ Argdown examples in this documentation.

:::

### _2_ Premise-conclusion-structures

Let's logically reconstruct an additional argument in detail:

```argdown-map
===
webComponent:
  initialView: source
sourceHighlighter:
  removeFrontMatter: true
===

<Word Analogy>

(1) [Word @#*%!]: It is much easier to write
    and format a text with Markdown than it is with Word.
(2) Markdown and Word are comparable in their ease of use
    to Argdown and argument map editors respectively.
----
(3) It is much easier to analyze complex argumentation and
    create argument maps with Argdown than it is with
    argument map editors.
    -> <Editors easier>


[Argdown is the best]
  - <Editors easier> #pro-editor
    + <WYSIWYG> #pro-editor
  + <Pure Data>
```

Click on the **Map** button in the upper right corner to see the resulting argument map.

### _3_ Markdown-like text-formatting

```argdown-map
===
webComponent:
  initialView: source
sourceHighlighter:
  removeFrontMatter: true
===

# Headings are used to group statement and arguments in the map

You can use __many__  (though not all) *features* of [Markdown](http://commonmark.org/) to format Argdown text.
And you can use #hashtags to color statements and arguments in the map.
```

For this example, no map will be generated, as the Argdown source code contains no statements or arguments connected by support or attack relations.

## Getting started

Now that you have learned the basics of Argdown you can:

::: buttonlist

- [Browser Sandbox](https://christianvoigt.github.io/argdown/sandbox/) Try out Argdown in your browser. Includes a live preview of the generated map.
- [VS Code Extension](/guide/installing-the-vscode-extension.html) Install the Argdown VS Code extension for full Argdown language support in one of the best code editors around. Includes a live preview, syntax highlighting, content assist, code linting and export options.
- [Commandline Tool](/guide/installing-the-commandline-tool.html) If you prefer to work with the commandline install the Argdown commandline tool. You can define custom processes in your config file and use them in a task runner to export several argument maps for the same document at once.

Also, check out our free [ArgVu](https://github.com/christianvoigt/argdown/tree/master/packages/ArgVu) font. It comes with Argdown-specific font-ligatures and glyphs.

::::tip

If you are getting unexpected results in your map, take a look at the [syntax rules](/syntax) of Argdown and do not forget to separate top-level elements by empty lines.

For any questions not answered by this documentation, don't hesitate to [open a new issue](https://github.com/christianvoigt/argdown/issues) on github.
:::
