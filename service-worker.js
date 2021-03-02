/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "2bae131af31e118dd82af5f54bba658c"
  },
  {
    "url": "agree-icon.svg",
    "revision": "a8e3436592aff8067dd9bd4a34908184"
  },
  {
    "url": "android-chrome-192x192.png",
    "revision": "0b234c1cf1ae1958f111579509cf52ee"
  },
  {
    "url": "android-chrome-256x256.png",
    "revision": "d257d914052dc3409eeeab27caa4267c"
  },
  {
    "url": "api/index.html",
    "revision": "9236d86b26d5ef42507df60e4fa14209"
  },
  {
    "url": "apple-touch-icon.png",
    "revision": "b731ba118d89e5652404d9e9d82a219e"
  },
  {
    "url": "argdown-arrow-white.svg",
    "revision": "188460ee31d1efa9eda2e89c485777ca"
  },
  {
    "url": "argdown-arrow.png",
    "revision": "16eb1c797a9fabfb08ad373009309b26"
  },
  {
    "url": "argdown-map.css",
    "revision": "e14d7c464380b548f8a15fc9cf491075"
  },
  {
    "url": "argdown-map.js",
    "revision": "4a1c867d0364b7a1d3d7fbf4771cb558"
  },
  {
    "url": "argdown-mark.svg",
    "revision": "d3c4d784d8cc12c1cf9ccc4cdc149b13"
  },
  {
    "url": "argdown-viewer.js",
    "revision": "22c390fc8c2b3b18f4a837fd8e616656"
  },
  {
    "url": "assets/css/0.styles.0c1859b7.css",
    "revision": "fed06a0cd2303fa5d8b83da4fa119070"
  },
  {
    "url": "assets/img/argdown-vscode-greenspan-1.b6e85ee0.png",
    "revision": "b6e85ee01e7079435dfd9877642b01b0"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.edbfaf32.js",
    "revision": "7f6bf1f1e3026ffb7e87f3179d5b940d"
  },
  {
    "url": "assets/js/11.a1e039d6.js",
    "revision": "e0f158ed6e157e3a4d742dd409a18b89"
  },
  {
    "url": "assets/js/12.f780faa7.js",
    "revision": "17efdeabc3be7806b2e4c0ac4eb4c049"
  },
  {
    "url": "assets/js/13.1995abbe.js",
    "revision": "e07c6a875eb173f3c815d52e20a6418f"
  },
  {
    "url": "assets/js/14.be418b97.js",
    "revision": "1871b27483274a802f26248c4245e7d0"
  },
  {
    "url": "assets/js/15.29ac6fc1.js",
    "revision": "6bc39643d4431301b403b8ec64229949"
  },
  {
    "url": "assets/js/16.a26beca3.js",
    "revision": "be32cdcd8657af7b7a86eeba59def52c"
  },
  {
    "url": "assets/js/17.2c53740f.js",
    "revision": "ad786a7c8fdb226abcdae59f0b17eb4e"
  },
  {
    "url": "assets/js/18.c7c1733e.js",
    "revision": "bcada9a8dcc251b19229d860798436ad"
  },
  {
    "url": "assets/js/19.20359efd.js",
    "revision": "00f177021891e37cca2b214f3dfa1236"
  },
  {
    "url": "assets/js/20.50dd7f84.js",
    "revision": "f4e0aba855fbc4a864fa5b807393bf99"
  },
  {
    "url": "assets/js/21.15013e1e.js",
    "revision": "712ef4e3e491ec3ba98fe33d20f1eb74"
  },
  {
    "url": "assets/js/22.44f9137a.js",
    "revision": "608fc65d8e177f4f5b9df6a53a11741c"
  },
  {
    "url": "assets/js/23.b98dedac.js",
    "revision": "e9c0a30102de2e15d855fa7f65e468cb"
  },
  {
    "url": "assets/js/24.ee775fa9.js",
    "revision": "9e4ef94ff160bc3b2765d8ef30417fc6"
  },
  {
    "url": "assets/js/25.d5795289.js",
    "revision": "952c56efd23494753844a75a8e815e8c"
  },
  {
    "url": "assets/js/26.e8ec43d5.js",
    "revision": "609d485303de9b1740d79ea9e74977a5"
  },
  {
    "url": "assets/js/27.2994ba23.js",
    "revision": "2537badff7b2af263680fe8fb9df7758"
  },
  {
    "url": "assets/js/28.c69f6915.js",
    "revision": "7d217d0ad6ebf0c94f714bd0ea299d4a"
  },
  {
    "url": "assets/js/29.7380d3c1.js",
    "revision": "aad47a55626b43fd0b4c36bac793b106"
  },
  {
    "url": "assets/js/3.55afa5e4.js",
    "revision": "3a39b68d67abc922468805dbef27ce02"
  },
  {
    "url": "assets/js/30.e99e7a6c.js",
    "revision": "f912511657868bb33e35d12c6e19f4b5"
  },
  {
    "url": "assets/js/31.cc8a529e.js",
    "revision": "f2ca57a28587b6a1792541d612b82199"
  },
  {
    "url": "assets/js/32.d481de96.js",
    "revision": "65a3531adb4864a3786787dc86c4c147"
  },
  {
    "url": "assets/js/33.db723a88.js",
    "revision": "43db0d4ec4a6cf11b74c48724ddbe639"
  },
  {
    "url": "assets/js/34.148c00d0.js",
    "revision": "4791248100cdd2845ff5d167b07abf01"
  },
  {
    "url": "assets/js/35.0692049e.js",
    "revision": "513379a77c0ce81397deec1147ca390f"
  },
  {
    "url": "assets/js/36.d4842ba3.js",
    "revision": "e887bf94c0fc9f0f7baf135f7f83d2b7"
  },
  {
    "url": "assets/js/37.d7b77bf5.js",
    "revision": "e1ac9c804d8bda280beae7673622af44"
  },
  {
    "url": "assets/js/38.4d830dae.js",
    "revision": "a97407f667a1c70591a51435bdcea02a"
  },
  {
    "url": "assets/js/39.21f5a73e.js",
    "revision": "c66028e2551931c8897c81fdba7aaa3d"
  },
  {
    "url": "assets/js/4.1016d98a.js",
    "revision": "e201e8ec33cefd2837b692ec2b42e4fa"
  },
  {
    "url": "assets/js/40.c25457a3.js",
    "revision": "244b3c87999e3c8a2c53c26d0115e3bd"
  },
  {
    "url": "assets/js/41.e9c3f277.js",
    "revision": "cea90c7b1ff4a8ec164da69ce2be3b41"
  },
  {
    "url": "assets/js/42.8a146b22.js",
    "revision": "c9e88737d0eed5ed99ecebe597539490"
  },
  {
    "url": "assets/js/43.c6c3db33.js",
    "revision": "a935b41746349366a3efc8138ad5f281"
  },
  {
    "url": "assets/js/44.1de4665d.js",
    "revision": "89328ab48517d412e9ebe4b41d52716a"
  },
  {
    "url": "assets/js/45.135110dd.js",
    "revision": "7e85b43168d7724019a29aa6f0f07f10"
  },
  {
    "url": "assets/js/46.9dd1065c.js",
    "revision": "fbd94c0b6370eb56be65354c7a725efc"
  },
  {
    "url": "assets/js/47.820878cf.js",
    "revision": "71ae29b2ad7e36b6f32f6ae7f0530a02"
  },
  {
    "url": "assets/js/5.d8d4962f.js",
    "revision": "7ffa98724da0def8a7246aa06891877c"
  },
  {
    "url": "assets/js/6.7ff2b8ce.js",
    "revision": "ed6d0856ecb3f5958b72f47df9d04543"
  },
  {
    "url": "assets/js/7.9ee57fa1.js",
    "revision": "ff10c25a504458222f3314219c6ab4c8"
  },
  {
    "url": "assets/js/8.f6c46f5c.js",
    "revision": "0ffd6fb6c5acdac4763f9fa61dc0130c"
  },
  {
    "url": "assets/js/9.5453b053.js",
    "revision": "9dc21ae453960e85a80cd0727fe9dd98"
  },
  {
    "url": "assets/js/app.9dc7a6cd.js",
    "revision": "e061037d0668f8b4db1676148a22f83f"
  },
  {
    "url": "assets/js/vendors~docsearch.b4d343ba.js",
    "revision": "f54217f9cfb4e385b761e78a1ac24bdb"
  },
  {
    "url": "cat1.jpg",
    "revision": "f5d126a3797a2f4516afd01fdd4fe7eb"
  },
  {
    "url": "cat2.jpg",
    "revision": "fdc90fdd737d461f64e37c64631cdcc2"
  },
  {
    "url": "changes/2018.html",
    "revision": "a865d2b5350b842f166aeba2a44fb8da"
  },
  {
    "url": "changes/2019.html",
    "revision": "3c1e06b9e3a454af5dcf7a0a99cca6bf"
  },
  {
    "url": "changes/2020.html",
    "revision": "e718f798b147600d3c54c54e4da50ffc"
  },
  {
    "url": "changes/index.html",
    "revision": "07f00065931705159a239c46703baeaf"
  },
  {
    "url": "compress.svg",
    "revision": "c5fefc2d5586fb61f5a709a6280b94c7"
  },
  {
    "url": "disagree-icon.svg",
    "revision": "03de316ed2329ee60c1911460e1c0414"
  },
  {
    "url": "dog1.jpg",
    "revision": "e4c2277580ebd7252672e1af09c9d213"
  },
  {
    "url": "dog2.jpg",
    "revision": "2dd0ebf990d44fbbc7c07b536be06658"
  },
  {
    "url": "expand.svg",
    "revision": "651a07980327d5bcbb8851c06761dc74"
  },
  {
    "url": "favicon-16x16.png",
    "revision": "0838bbbe758ce024287a339ce2f20026"
  },
  {
    "url": "favicon-32x32.png",
    "revision": "9a454f3ef2a188c19ccae92bc59f975c"
  },
  {
    "url": "favicon.svg",
    "revision": "0f1956d1eb23e082af85d779ee3d56ba"
  },
  {
    "url": "googleb41049b30bb73985.html",
    "revision": "e3ed96111974b98cc5f9dbd3a9f4f5d9"
  },
  {
    "url": "guide/a-first-example.html",
    "revision": "fe324f7c08032354a854ea8ab0ee9b4a"
  },
  {
    "url": "guide/adding-images.html",
    "revision": "492b5087b094a02b0e1e2a2793e6abfe"
  },
  {
    "url": "guide/changing-the-graph-layout.html",
    "revision": "658d932ba3a23c2dafadda120263c6f9"
  },
  {
    "url": "guide/changing-the-node-size.html",
    "revision": "2cab4b1e2a4f9dc4c615cccef83180e8"
  },
  {
    "url": "guide/changing-the-node-style.html",
    "revision": "a0fc1ca2f7b8cdbf412bd32a4be8d7f2"
  },
  {
    "url": "guide/colorizing-maps.html",
    "revision": "a737bcf12dee3f2b369fbd673c36ef5e"
  },
  {
    "url": "guide/configuration-cheatsheet.html",
    "revision": "a84b3d3a2dd6aadc0e5aff78097c3da0"
  },
  {
    "url": "guide/configuration-in-the-frontmatter-section.html",
    "revision": "2e2ba0fef85356cb866940c9888b77af"
  },
  {
    "url": "guide/configuration-with-config-files.html",
    "revision": "7b28c815647e7a82468b329255c09a1e"
  },
  {
    "url": "guide/configuration.html",
    "revision": "0fd475ab5dc2b7e4bebada5e48516187"
  },
  {
    "url": "guide/creating-argument-maps.html",
    "revision": "bfdcebc9bcf51f1b10ac24a933c51846"
  },
  {
    "url": "guide/creating-edges.html",
    "revision": "d63a6d718fb37efc1f2dd599964c79ba"
  },
  {
    "url": "guide/creating-group-nodes.html",
    "revision": "9bca9e9e12e6a910f53e5836155b947e"
  },
  {
    "url": "guide/creating-oldschool-argument-maps-and-inference-trees.html",
    "revision": "79f03e2da8cb1659bbe4566e0e0648eb"
  },
  {
    "url": "guide/creating-statement-and-argument-nodes.html",
    "revision": "a3e17a767f8913d33beac2a65c4eceef"
  },
  {
    "url": "guide/elements-of-an-argument-map.html",
    "revision": "bcd0dbb702d2d9aed06f8c6246ef3e30"
  },
  {
    "url": "guide/embedding-your-maps-in-a-webpage.html",
    "revision": "27d3414062995f915821db177a1f37c8"
  },
  {
    "url": "guide/extending-argdown.html",
    "revision": "8c29a008ac22439d4718f9c937e05fc8"
  },
  {
    "url": "guide/index.html",
    "revision": "43d133d5af81eeef074a081a09f3da5f"
  },
  {
    "url": "guide/installing-the-commandline-tool.html",
    "revision": "bcb33ce3adec9968fcb4222eda0ce91a"
  },
  {
    "url": "guide/installing-the-vscode-extension.html",
    "revision": "68b5f85556a2d8acc1ec2cd22ccbb2b1"
  },
  {
    "url": "guide/integrating-argdown-markdown-into-applications.html",
    "revision": "70d915041a32bd632cd0ab51e8d08f13"
  },
  {
    "url": "guide/loading-custom-plugins-in-a-config-file.html",
    "revision": "aef12a48b94f991924745d57367df82b"
  },
  {
    "url": "guide/publishing-argdown-markdown-with-pandoc.html",
    "revision": "3042099c02860a5c80498ebab368a316"
  },
  {
    "url": "guide/publishing-argument-maps.html",
    "revision": "cf29c02414276d8e6f5ef536d1d110a9"
  },
  {
    "url": "guide/running-custom-processes.html",
    "revision": "96820532db38a593fa1fb83969f289ca"
  },
  {
    "url": "guide/using-argdown-in-markdown.html",
    "revision": "0c71159264ba7e33a59d8156803aa8fd"
  },
  {
    "url": "guide/using-argdown-in-your-application.html",
    "revision": "6b7cbc5845addacc6744abbd735b7d89"
  },
  {
    "url": "guide/using-logical-symbols-and-emojis.html",
    "revision": "00a306b1f64e596c7a309ad48f2bf143"
  },
  {
    "url": "guide/writing-custom-plugins.html",
    "revision": "8ffdfe15658fa6c857eac000821baf42"
  },
  {
    "url": "index.html",
    "revision": "bff3f3b1a87fe74002caafcc4a45036e"
  },
  {
    "url": "mstile-150x150.png",
    "revision": "f1e527365592a25dd0039f28b0e2ae3c"
  },
  {
    "url": "river-deep.argdown-theme.css",
    "revision": "1dde29f17b6306f7f4da8df080e7c32d"
  },
  {
    "url": "safari-pinned-tab.svg",
    "revision": "2c742637dbf81b39dfe0870701ba5a6d"
  },
  {
    "url": "snow-in-spring.argdown-theme.css",
    "revision": "10500bb1a5555592f94b762a44e85ca9"
  },
  {
    "url": "syntax/index.html",
    "revision": "8fb273fa58b8a8c893a380c53c35119e"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
