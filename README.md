#Argdown

Argdown is a simple markup syntax for argumentation, inspired by Markdown. The syntax is so simple that using it for single arguments is as easy as writing a Twitter message. And it's so flexible that it can cope with as complex debate structures as you like.

##examples

###simple reasons

```
thesis +because reason

reason thus+ thesis

thesis -because reason

reason thus- thesis
```

###pro & contra list or tree

```
[title] thesis
+ reason
- reason
- reason
+ reason

another thesis
+ reason
    + [another title] reason
    - reason
- reason
    - reason
    + reason
        + reason
```

###complex argument map (graph)

```
title] thesis
+ reason
    >- [another title] reason
    + reason
        >- [title]
    - reason
        + [another title]
        - reason
```

##grammar and parser

You can parse Argdown code with the ArgdownParser, a Javascript parser generated with Jison from a jison grammar file. To use it on the Web you have to embed ArgdownParser.js into your html file and use it like this:

```HTML
<script src="dist/ArgdownParser.js"></script>
<script>
    var str = "Argdown is great! +because It's so easy!";
    var ast = ArgdownParser.parse(str); //ArgdownParser is a global object
    var thesis = ast[1].children[0].children[0].text;
    var reason = ast[1].children[1];
    var relationText = reason.children[1].text;
    var reasonText = reason.children[2].children[0].text;
    alert("the thesis: "+thesis+" the relation: "+relationText+" the reason: "+reasonText);
</script>
```

Please examine the ast object in your debugger to learn how to get the data you want out of it. It shouldn't be too hard.

##License

The MIT License (MIT)

Copyright (c) 2014 Christian Voigt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.