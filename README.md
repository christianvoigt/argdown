# Argdown

![Argdown logo](./argdown-arrow.png?raw=true "Argdown logo")

**v1.7.0 released! Check out [the new features](https://argdown.org/changes/)**

[Argdown](https://christianvoigt.github.io/argdown) is a simple syntax for analyzing complex argumentation.

- Listing pros & cons in Argdown is as simple as writing a twitter message. You don't have to learn anything new, except a few simple rules that will feel very natural.
- With these simple rules you will be able to define more complex relations between arguments or dive into the details of their logical premise-conclusion structures.
- Argdown can even be used within Markdown! Your code is transformed into an <a href="https://en.wikipedia.org/wiki/Argument_map">argument map</a> while you are typing. When your are ready, you can publish your analysis as pdf, embed it as a web-component in a webpage or simply export your map as an image.

Start with [the docs](https://christianvoigt.github.io/argdown) or try it out in the [Browser Sandbox](http://christianvoigt.github.io/argdown).

If you want to start working right away, you should install the [Argdown VS Code extension](https://christianvoigt.github.io/argdown/guide/installing-the-vscode-extension).

<img src="./screenshots/argdown-vscode-greenspan-1.png?raw=true" width="30%"></img> <img src="./screenshots/argdown-vscode-greenspan-2.png?raw=true" width="30%"></img> <img src="./screenshots/argdown-vscode-semmelweis-1.png?raw=true" width="30%"></img> <img src="./screenshots/argdown-sandbox-soft-drugs-1.png?raw=true" width="30%"></img> <img src="./screenshots/argdown-sandbox-greenspan-1.png?raw=true" width="30%"></img> <img src="./screenshots/argdown-sandbox-censorship-1.png?raw=true" width="30%"></img>

## Credits and license

The development of Argdown and Argdown-related tools is funded by the [DebateLab](http://debatelab.philosophie.kit.edu/) at KIT, Karlsruhe.

All code is published under the MIT license. The optional Argvu font is published under a [Free License](https://github.com/christianvoigt/argdown/tree/master/packages/argvu/LICENSE.md).

## About this repository

This repository is a [Monorepo](https://en.wikipedia.org/wiki/Monorepo) containing all packages of the Argdown project. We use [lerna](https://github.com/lerna/lerna) to manage their internal dependencies. You can find all packages in the `packages/` folder.

For further information about the code, consult the [API section](https://christianvoigt.github.io/argdown/api/) of the documentation.

To install this Monorepo

- fork/pull or download this repository
- run `npm install` in the main folder.
- run `npm run bootstrap` to install the dependencies of all packages. This will call `lerna bootstrap`.
- run `npm run docs:dev` if you want to work on the documentation. Run `npm run` to see the other scripts available.

### Installing npm packages

Example:

```bash
lerna add xmlbuilder --scope=@argdown/core
```
