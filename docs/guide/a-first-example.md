# A first example

This tutorial will guide you through the reconstruction and visualization of a simple debate. It should give you an overview over the main elements of the Argdown syntax and what you can achieve with it. This is not an in-depth explanation of all features of Argdown. Instead, this primer tries to give you an impression of how it feels to work with Argdown and introduces you to the basics along the way.

:::tip
Learning by following along an example is an easy and intuitive way of learning. But if you prefer a more systematic approach, we recommend that you immediately start with the [syntax documentation](/syntax/) itself and continue by taking a look at the [creating argument maps](/guide/creating-argument-maps.html) guide.
:::

## The debate

We analyse the following pros and cons on "Censorship by the State" from the _Debater's Handbook_ (Sather et al., 18th edition).

| Pros                                                                                                                                                                                                                                                                                                                                                                  | Cons                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [P1] Freedom of speech is never an absolute right but an aspiration. It ceases to be a right when it causes harm to others -- we all recognise the value of, for example, legislating against incitement to racial hatred. Therefore it is not the case that censorship is wrong in principle.                                                                        | [C1] Censorship is wrong in principle. However violently we may disagree with a person's point of view or mode of expression, they must be free to express themselves in a free and civilized society. Censorship such as legislation against incitement to racial hatred drives racists and others underground and thus entrenches and ghettoises that section of the community rather than drawing its members into open and rational debate. |
| [P2] Certain types of literature or visual image have been conclusively linked to crime. Excessive sex and violence in film and television has been shown (especially in studies in the US) to contribute to a tendency towards similar behaviour in spectators. There is no excuse for this and such images must be sacrificed, no matter what their artistic merit. | [C2] In fact, the link between sex and violence on screen and in real life is far from conclusive. To look at it from another angle, those individuals who _already have tendencies_ to violence are likely to watch violent `video nasties', just as those with a predilection for rape are likely to use pornography. The two are therefore connected but the individual's personality is formed first.                                       |

## Sketching the argumentation

It's straight-forward to copy & paste the pros and cons into an Argdown document. We mark up the central thesis as a [statement](/syntax/#statements) and the pros and cons as [arguments](/syntax/#arguments) putting their titles in angle and square brackets respectively.

```argdown-map
===
webComponent:
  initialView: source
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

[Thesis]: Censorship by the state
  + <P1>: Freedom of speech is never an absolute right but an aspiration.
  It ceases to be a right when it causes harm to others -- we all
  recognise the value of, for example, legislating against
  incitement to racial hatred. Therefore it is not the case that
  censorship is wrong in principle. #pro
  + <P2>: Certain types of literature or visual image have been
  conclusively linked to crime. Excessive sex and violence in film
  and television has been shown (especially in studies in the US)
  to contribute to a tendency towards similar behaviour in spectators.
  There is no excuse for this and such images must be sacrificed,
  no matter what their artistic merit. #pro
  - <C1>: Censorship is wrong in principle. However violently we may
  disagree with a person's point of view or mode of expression, they
  must be free to express themselves in a free and civilized society.
  Censorship such as legislation against incitement to racial hatred
  drives racists and others underground and thus entrenches and
  ghettoises that section of the community rather than drawing
  its members into open and rational debate. #con
  - <C2>: In fact, the link between sex and violence on screen and
  in real life is far from conclusive. To look at it from another
  angle, those individuals who _already have tendencies_ to
  violence are likely to watch violent `video nasties', just as
  those with a predilection for rape are likely to use pornography.
  The two are therefore connected but the individual's personality
  is formed first. #con
```

Some of the above argument descriptions actually seem to contain different lines of thought, and it's recommendable to split those descriptions up so that each argument is represented in Argdown by its own element. Moreover, we spell out the main thesis explicitly as "Censorship is not wrong in principle".

```argdown-map
===
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

[Thesis]: Censorship is not wrong in principle.
  + <P1a>: Freedom of speech is never an absolute right but an aspiration.
  It ceases to be a right when it causes harm to others. Therefore it is
  not the case that censorship is wrong in principle. #pro
  + <P1b>: We all recognise the value of, for example, legislating against
  incitement to racial hatred. #pro
  + <P2>: Certain types of literature or visual image have been conclusively
  linked to crime. Excessive sex and violence in film and television has been
  shown (especially in studies in the US) to contribute to a tendency towards
  similar behaviour in spectators. There is no excuse for this and such images
  must be sacrificed, no matter what their artistic merit. #pro
  - <C1a>: Censorship is wrong in principle. However violently we may disagree
  with a person's point of view or mode of expression, they must be free to
  express themselves in a free and civilized society. #con
  - <C1b>: Censorship such as legislation against incitement to racial hatred
  drives racists and others underground and thus entrenches and ghettoises that
  section of the community rather than drawing its members into open and rational
  debate. #con
  - <C2>: In fact, the link between sex and violence on screen and in real life
  is far from conclusive. To look at it from another angle, those individuals
  who _already have tendencies_ to violence are likely to watch violent
  `video nasties', just as those with a predilection for rape are likely to use
  pornography. The two are therefore connected but the individual's personality
  is formed first. #con
```

Now, it's questionable whether all pros and cons are directly supporting or attacking the central claim. Granted, `<P1a>`, for example, is doing so. But `<C2>` seems to be attacking the argument `<P2>`rather than attacking central thesis directly. Likewise, `<C1b>`is best interpreted as an attack on `<P1b>`. To effect these changes in Argdown, we simply have to shift and indent the corresponding list items.

```argdown-map
===
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

[Thesis]: Censorship is not wrong in principle.
  + <P1a>: Freedom of speech is never an absolute right but an aspiration.
  It ceases to be a right when it causes harm to others. Therefore it is
  not the case that censorship is wrong in principle. #pro
  + <P1b>: We all recognise the value of, for example, legislating against
  incitement to racial hatred. #pro
    - <C1b>: Censorship such as legislation against incitement to racial
    hatred drives racists and others underground and thus entrenches and
    ghettoises that section of the community rather than drawing its members
    into open and rational debate. #con
  + <P2>: Certain types of literature or visual image have been conclusively
  linked to crime. Excessive sex and violence in film and television has been
  shown (especially in studies in the US) to contribute to a tendency towards
  similar behaviour in spectators. There is no excuse for this and such images
  must be sacrificed, no matter what their artistic merit. #pro
    - <C2>: In fact, the link between sex and violence on screen and in real
    life is far from conclusive. To look at it from another angle, those individuals
    who _already have tendencies_ to violence are likely to watch violent
    `video nasties', just as those with a predilection for rape are likely
    to use pornography. The two are therefore connected but the individual's
    personality is formed first. #con
  - <C1a>: Censorship is wrong in principle. However violently we may disagree
  with a person's point of view or mode of expression, they must be free to
  express themselves in a free and civilized society. #con

```

Next, the debate involves a further central claim, which relates to different arguments advanced. This is the claim that freedom of speech is an absolute right. It enters the argument `<C1a>`; and `<P1a>` is probably -- and contrary to its explicitly stated conclusion -- an argument against freedom of speech.

Moreover, we assign informative titles to the arguments and claims, streamline their descriptions, and add the source-reference as meta-data.

```argdown-map
===
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

[Censorship]: Censorship is not wrong in principle.
  + <Argument from racial hatred>: Legislation against incitement to racial hatred is permissible.
  Thus, censorship is not wrong in principle. #pro {source: "P1b"}
    - <Importance of inclusive public debate>: Censorship such as legislation against
    incitement to racial hatred drives racists and others underground and thus entrenches
    and ghettoises that section of the community rather than drawing its members into
    open and rational debate. #con {source: "C1b"}
  + <Excessive sex and violence>: Excessive sex and violence in film and television has
  been shown to contribute to a tendency towards similar behaviour in spectators. In these
  cases, censorship is obligatory and hence not wrong in principle. #pro {source: "P2"}
    - <Causal link questionable>: In fact, the link between sex and violence on screen and
    in real life is far from conclusive. The two are correlated, but the individual's
    personality is causally responsible for video consumption, not vice versa. #con {source: "C2"}
  - <Argument from Freedom of Speech>: Censorship is wrong in principle. In a free and
  civilized society, everyone must be free to express herself. #con {source: "C1a"}
    + [Absolute Freedom of Speech]: Freedom of speech is an absolute right.
        - <No-Harm trumps Freedom-of-Speech>: Freedom of speech ceases to be a right when
        it causes harm to others. Therefore freedom of speech is never an absolute right
        but an aspiration. #pro {source: "P1a"}

```

## Detailed reconstruction of the argumentation

How exactly do the different arguments work? We answer this question by reconstructing the individual arguments as [premise-conclusion-structures](/syntax/#premise-conclusion-structures). In doing so, one will typically revise the sketched dialectical relations between arguments and statements.

As a rule of thumb, it's advisable to start to reconstruct the most central arguments first and to move, gradually, to less central arguments.

If we stick with the previous sketch and use the argument map to inform our detailed analysis, the main conclusion and a premise of the argument from freedom of speech are already given:

```argdown-map
===
webComponent:
  initialView: source
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

<Argument from Freedom of Speech>: Censorship is wrong in principle.
In a free and civilized society, everyone must be free to express herself. #con {source: "C1a"}

(1) [Absolute Freedom of Speech]: Freedom of speech is an absolute right.
(2) More premises ...
-----
(3) Censorship is wrong in principle.
    >< [Censorship]
```

In the last line we declare that the main conclusion and the central thesis are in [contradiction](/syntax/#relations-between-statements) to each other.

Here's a way to fill the gap between (1) and (3):

```argdown
===
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

<Argument from Freedom of Speech>: Censorship is wrong in principle.
In a free and civilized society, everyone must be free to express herself. #con {source: "C1a"}

(1) [Absolute Freedom of Speech]: Freedom of speech is an absolute right.
(2) Censorship violates freedom of speech.
(3) Whatever violates an absolute right, is itself wrong in principle.
--
Modus Ponens, Specification {uses: [1,2,3]}
--
(4) Censorship is wrong in principle.
    -> [Censorship]
```

We have not only added two premises, but also expanded the [inference](/syntax/#inferences) and added the inference rules used and metadata about the premises used in this inference.

Let us now add this premise-conclusion-structure to our Argdown document.

```argdown
===
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

[Censorship]: Censorship is not wrong in principle.
  + <Argument from racial hatred>: Legislation against incitement to racial hatred is permissible.
  Thus, censorship is not wrong in principle. #pro {source: "P1b"}
    - <Importance of inclusive public debate>: Censorship such as legislation against incitement
    to racial hatred drives racists and others underground and thus entrenches and ghettoises
    that section of the community rather than drawing its members into open and rational debate. #con {source: "C1b"}
  + <Excessive sex and violence>: Excessive sex and violence in film and television has been
  shown to contribute to a tendency towards similar behaviour in spectators.
  In these cases, censorship is obligatory and hence not wrong in principle. #pro {source: "P2"}
    - <Causal link questionable>: In fact, the link between sex and violence on screen and in real
    life is far from conclusive. The two are correlated, but the individual's personality is causally
    responsible for video consumption, not vice versa. #con {source: "C2"}


[Absolute Freedom of Speech]: Freedom of speech is an absolute right.
  - <No-Harm trumps Freedom-of-Speech>: Freedom of speech ceases to be a right when it causes harm
  to others. Therefore freedom of speech is never an absolute right but an aspiration. #pro {source: "P1a"}


<Argument from Freedom of Speech>: Censorship is wrong in principle. In a free and civilized society,
everyone must be free to express herself. #con {source: "C1a"}

(1) [Absolute Freedom of Speech]
(2) Censorship violates freedom of speech.
(3) Whatever violates an absolute right, is itself wrong in principle.
--
{uses: [1,2,3], rule: ["specification", "modus ponens"]}
--
(4) Censorship is wrong in principle.
    -> [Censorship]

```

Click on the "map" button in the upper right corner of the Argdown widget to see the argument generated from this Argdown document.

Note that, in the above document, we don't define explicitly arrows from and to the argument from freedom of speech, Argdown adds these arrows automatically given our reconstructed premise-conclusion-structure. To learn more about what arrows are added automatically, read [this section of the syntax documentation](/syntax/#relations-of-reconstructed-arguments).

If all arguments are fully reconstructed, the Argdown document may simply consist in a list of statements, and arguments with attached premise-conclusion-structures.

```argdown
===
sourceHighlighter:
  removeFrontMatter: true
model:
    removeTagsFromText: true
===

/*
Two central claims
*/

[Censorship]: Censorship is not wrong in principle.

[Absolute Freedom of Speech]: Freedom of speech is an absolute right.

/*
Arguments of the debate
*/

<Argument from Freedom of Speech>: Censorship is wrong in principle.
In a free and civilized society, everyone must be free to express herself. #con {source: "C1a"}

(1) [Absolute Freedom of Speech]
(2) Censorship violates freedom of speech.
(3) Whatever violates an absolute right, is itself wrong in principle.
--
{uses: [1,2,3], rule: ["specification", "modus ponens"]}
--
(4) Censorship is wrong in principle.
    -> [Censorship]


<No-Harm trumps Freedom-of-Speech>: Freedom of speech ceases to be a right when it
causes harm to others. Therefore freedom of speech is never an absolute right but
an aspiration. #pro {source: "P1a"}

(1) Sometimes, free speech causes serious harms to others.
(2) Whatever causes serious harms to others is not permissible.
(3) If freedom of speech is sometimes not permissible, then freedom of speech
is not an absolute right.
----
(4) Freedom of speech is not an absolute right.
    -> [Absolute Freedom of Speech]


<Argument from racial hatred>: Legislation against incitement to racial hatred is
permissible. Thus, censorship is not wrong in principle. #pro {source: "P1b"}

(1) [IRC-legislation]: Legislation against incitement to racial hatred is permissible. {isInMap: false}
(2) Legislation against incitement to racial hatred is a form of censorship.
----
(3) [Censorship]

<Importance of inclusive public debate>: Legislation against incitement to racial
hatred drives racists and others underground rather than drawing them into open
and rational debate. #con {source: "C1b"}

(1) We will only have an open, maximally-inclusive and rational societal debate,
if racists are not driven underground.
(2) If legislation against incitement to racial hatred is enacted, racists and
others are driven underground.
-----
(3) We will only have an open, maximally-inclusive and rational societal debate,
if legislation against incitement to racial hatred is not enacted.
(4) We ought to have an open, maximally-inclusive and rational societal debate.
-----
(5) Legislation against incitement to racial hatred ought not be enacted.
  -> [IRC-legislation]


<Excessive sex and violence>: Excessive sex and violence in film and television
contribute to a tendency towards similar behaviour in spectators. In these cases,
censorship is obligatory. #pro {source: "P2"}

(1) [Causal link]: Excessive sex and violence in film and television contributes
to a tendency towards similar behaviour in spectators.  {isInMap: false}
(2) Whatever contributes to an tendency towards criminal behaviour may be legally
banned, except more weighty reasons speak against doing so.
(3) There are no substantial reasons against legally banning excessive sex and
violence in film and television.
-----
(4) Excessive sex and violence in film and television may be legally banned.
(5) If excessive sex and violence in film and television may be legally banned,
censorship is not wrong in principle.
-----
(6) [Censorship]

<Argument from expertise>: Scientific studies have established a causal link
between violence in film and a similar behaviour in spectators. #pro

(1) Scientific studies have established that excessive sex and violence in
film and television contributes to a tendency towards similar behaviour in spectators (@[Causal link]).
(2) If scientific studies have established that X and if there is no evidence
against X being the case, then X.
----
(3) [Causal link]


<Causal link questionable>: The link between sex and violence on screen and in
real life is far from conclusive. The individual's personality make her watch
violent videos, not vice versa. #con {source: "C2"}

(1) The consumption of violent video is correlated with violent and criminal
behaviour.
(2) The best explanation for this correlation is that those individuals who
_already have tendencies_ to violence are likely to watch violent `video nasties',
just as those with a predilection for rape are likely to use pornography.
--
{uses: [1,2], rule: ["inference to the best explanation"]}
--
(3) A disposition for criminal behaviour causes the consumption of violent video.
(4) Causal relations are asymmetric.
-----
(5) The consumption of violent video does not bring about a disposition for
criminal behaviour.
  -> [Causal link]
```

Click on the "map" button in the upper right corner of the Argdown widget to see the map generated from this Argdown document.

## Where to go from here

This example presented a basic workflow of how to reconstruct a debate with Argdown. By now you have probably learned enough to start working on your own material. If you have questions about the exact syntax of Argdown elements, you can always consult the complete [syntax documentation](/syntax/). If you want to learn more about the many ways of customizing your argument map, you will find a detailed description in the [guide on how to create argument maps with Argdown](/guide/creating-argument-maps).

We also recommend to browse through our curated collection of debates in the [Argdown Sandbox](https://argdown.org/sandbox/). They exemplify different styles of what we consider to be "good Argdown code". To open the list of example debates, move with your mouse over the "Examples" button in the top left corner over the Argdown code editor.
