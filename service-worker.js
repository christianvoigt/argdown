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
    "revision": "3710f71f391a36493b90c85a186dc234"
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
    "revision": "ba86b84f8c7baa90b6c5eb6e1d5dac8f"
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
    "revision": "9780c99f378c91beae8da16d5631b2a0"
  },
  {
    "url": "argdown-map.js",
    "revision": "2ca1ff1688e272e77dd0cafdbf7036d2"
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
    "url": "assets/css/0.styles.d44408e3.css",
    "revision": "023f7da37d7e4d71c7a14572b24b5801"
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
    "url": "assets/js/10.bce1ef07.js",
    "revision": "eb53703d0ffbf0bef5c79155832876ad"
  },
  {
    "url": "assets/js/11.cf80334a.js",
    "revision": "a187d2a2e2319062bd7b87bee79cf1de"
  },
  {
    "url": "assets/js/12.e422cfc7.js",
    "revision": "2a2f89fcfa9572bbafe06f26bb7b6d0e"
  },
  {
    "url": "assets/js/13.839cb0f3.js",
    "revision": "4e177e18a15b484a66694c74196d193a"
  },
  {
    "url": "assets/js/14.880b3b33.js",
    "revision": "cabeefa2ea4dc792a6886d89d8061100"
  },
  {
    "url": "assets/js/15.abbcfdfa.js",
    "revision": "47cd7a7a81be60d653b797280d6a1289"
  },
  {
    "url": "assets/js/16.7fa548ca.js",
    "revision": "0f124030bce8c6d1fdc285caa34f0c0b"
  },
  {
    "url": "assets/js/17.9aa1c9f9.js",
    "revision": "b3a183c326cfec79523973c2b7c466c1"
  },
  {
    "url": "assets/js/18.f829b0c0.js",
    "revision": "d7473f143dfdb1ec2fa70a11d0e6eb38"
  },
  {
    "url": "assets/js/19.6227120e.js",
    "revision": "bea20ec1118a59a73428f22558e17e8c"
  },
  {
    "url": "assets/js/20.72f11159.js",
    "revision": "c388da0842b47a8c4c358a384a8acfde"
  },
  {
    "url": "assets/js/21.6fee7a99.js",
    "revision": "c382fa4e7bd92cfd4c6e6056a5f3da7b"
  },
  {
    "url": "assets/js/22.f250e760.js",
    "revision": "9d19a395d94cd7842da265b234791376"
  },
  {
    "url": "assets/js/23.613c08a0.js",
    "revision": "7b4ed1f72dfd52ca32a7271de78f1317"
  },
  {
    "url": "assets/js/24.7ebecc02.js",
    "revision": "1c1d5d05ae5c282f1264446b1a9825b6"
  },
  {
    "url": "assets/js/25.fd2bcd8f.js",
    "revision": "916eff0e26df47eab3edac400e1a49de"
  },
  {
    "url": "assets/js/26.7577404e.js",
    "revision": "6acdc4b483ee9a7b617eda178d29ad22"
  },
  {
    "url": "assets/js/27.f21ea530.js",
    "revision": "23180b0ef2803a8e881ab1d450f63619"
  },
  {
    "url": "assets/js/28.819ba326.js",
    "revision": "13a19c0bf2bb18241a4111fa7f18609d"
  },
  {
    "url": "assets/js/29.1d933e8d.js",
    "revision": "f30211496753d33b9e9bfdab9d14f2c6"
  },
  {
    "url": "assets/js/3.275776de.js",
    "revision": "bb9089d512a41a72b5d9f8872e90ec8a"
  },
  {
    "url": "assets/js/30.9046c3b0.js",
    "revision": "d39ad1c17d4efa03f360943d41f6e149"
  },
  {
    "url": "assets/js/31.d3d3b041.js",
    "revision": "024ead0c17cb31dd80906d4061dfb0c9"
  },
  {
    "url": "assets/js/32.5b832a1e.js",
    "revision": "7177b7ee954f8e828be0e26c0156fd72"
  },
  {
    "url": "assets/js/33.205b099a.js",
    "revision": "bd3c49444e23ed66595f33ec613b8639"
  },
  {
    "url": "assets/js/34.a30bd6fb.js",
    "revision": "a74e7d992f1571756560a77d508855c2"
  },
  {
    "url": "assets/js/35.4f2a042f.js",
    "revision": "ec17f15ca9e0b7ad4e0a9a35754c0009"
  },
  {
    "url": "assets/js/36.a154eafd.js",
    "revision": "7b4edd7a089dd38b8908bc7a36c39e1b"
  },
  {
    "url": "assets/js/37.1d8a6ac5.js",
    "revision": "d610ac48213584bae572a3ccb01db97a"
  },
  {
    "url": "assets/js/38.dd96ebb1.js",
    "revision": "4c883833c147ebe98f9c2f6fa5c7f2ec"
  },
  {
    "url": "assets/js/39.b297e62b.js",
    "revision": "dee32ad81298eff1adb1ac06ab14745a"
  },
  {
    "url": "assets/js/4.661920fa.js",
    "revision": "cda2e6f4a152564816247349d89b3714"
  },
  {
    "url": "assets/js/40.43f1a9c5.js",
    "revision": "5c801b5ff17334d3b943f3231fc701f6"
  },
  {
    "url": "assets/js/41.85dbeb82.js",
    "revision": "7bac976b664568cbdb7606a043663a00"
  },
  {
    "url": "assets/js/42.a71c61be.js",
    "revision": "8b3a74004f606037a88116e9fecc042e"
  },
  {
    "url": "assets/js/43.0def2f3c.js",
    "revision": "ad2fe553aef02aff775d690759817f37"
  },
  {
    "url": "assets/js/44.93eb6d80.js",
    "revision": "40776f4333d4babd11da827d833e06ab"
  },
  {
    "url": "assets/js/45.663a3d08.js",
    "revision": "be37e87de0587a018a71dac05c70b6f8"
  },
  {
    "url": "assets/js/46.d7f7b0d2.js",
    "revision": "1a6ade01fd7d25532a309925b42b8d58"
  },
  {
    "url": "assets/js/47.8df263fa.js",
    "revision": "fb883a5c119b7658afece619bb531f57"
  },
  {
    "url": "assets/js/48.581f37b3.js",
    "revision": "fb0bcabc8e8a4db32868f0617c123a2c"
  },
  {
    "url": "assets/js/5.6e73b733.js",
    "revision": "36a05b1ec0f23afb6f90e5f7b4259048"
  },
  {
    "url": "assets/js/6.fc75f6f1.js",
    "revision": "d683bc2a6e4dc43402db73ef90bddd2c"
  },
  {
    "url": "assets/js/7.9a487c21.js",
    "revision": "dbaecafe695be8830bba85f4a1684af4"
  },
  {
    "url": "assets/js/8.418c95c5.js",
    "revision": "3e02da6f67b6e838c940c9eada6b6313"
  },
  {
    "url": "assets/js/9.cc838dd5.js",
    "revision": "fc32f9350a7d0ba52b13395c2681a55c"
  },
  {
    "url": "assets/js/app.e91d5bc4.js",
    "revision": "15e8f1778e897f169a6fc4ee6b35af0c"
  },
  {
    "url": "assets/js/vendors~docsearch.b03e88c6.js",
    "revision": "b45c6ce3c107c550ec393e54f8270437"
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
    "revision": "bdc624c9944aa85b91b8f7b1abdd46e8"
  },
  {
    "url": "changes/2019.html",
    "revision": "83e5dcd7ab54de197fa21e32ebb61360"
  },
  {
    "url": "changes/2020.html",
    "revision": "a0dcd6f20bf1e510dec0ea0873d4b510"
  },
  {
    "url": "changes/2021.html",
    "revision": "72db5aabb8c1b2ef8ddddb5b4f92cd7a"
  },
  {
    "url": "changes/index.html",
    "revision": "e7acb9c6d2aefd385081a7cf09a86bc7"
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
    "revision": "0ab390fa6fa015e6ccf3bc680d95326c"
  },
  {
    "url": "guide/adding-images.html",
    "revision": "1305dcd2cbb164baf94d703c6f5e50ea"
  },
  {
    "url": "guide/changing-the-graph-layout.html",
    "revision": "cad5591a4028c491e592cbccb6e4e504"
  },
  {
    "url": "guide/changing-the-node-size.html",
    "revision": "9901e0d2fabfe0f8830854b836ea2ecf"
  },
  {
    "url": "guide/changing-the-node-style.html",
    "revision": "cc0b577ce131726bee081469f92cfaad"
  },
  {
    "url": "guide/colorizing-maps.html",
    "revision": "f5c98d727c590ea4ffe3d5a19a01f367"
  },
  {
    "url": "guide/configuration-cheatsheet.html",
    "revision": "f31d3cd964789259a812be83579f687b"
  },
  {
    "url": "guide/configuration-in-the-frontmatter-section.html",
    "revision": "27568901d0a311ffb450340481f7380b"
  },
  {
    "url": "guide/configuration-with-config-files.html",
    "revision": "9272d3c323d218b83ecc38b5089919f9"
  },
  {
    "url": "guide/configuration.html",
    "revision": "310b09bff738c5873fed62fd55c97c14"
  },
  {
    "url": "guide/creating-argument-maps.html",
    "revision": "374e0afc64adc37b32a341d54276b7de"
  },
  {
    "url": "guide/creating-edges.html",
    "revision": "5b4c282b6cb6a9de5f5009f9c802e768"
  },
  {
    "url": "guide/creating-group-nodes.html",
    "revision": "832ffb1dd1cb9b0aa8b0525b2bc99ab2"
  },
  {
    "url": "guide/creating-oldschool-argument-maps-and-inference-trees.html",
    "revision": "6b38c23b13ad1be40aec787d0f6dcb1e"
  },
  {
    "url": "guide/creating-statement-and-argument-nodes.html",
    "revision": "e6473b2e4291d534ea4e15afdaf58e38"
  },
  {
    "url": "guide/elements-of-an-argument-map.html",
    "revision": "76b5eaacf233cb3f08ea12fb2f02a55f"
  },
  {
    "url": "guide/embedding-your-maps-in-a-webpage.html",
    "revision": "ca7d6d3b242e0ac62d2b05e49ac282ec"
  },
  {
    "url": "guide/extending-argdown.html",
    "revision": "a6594f7e4d08cde026c4f02f46d06fe9"
  },
  {
    "url": "guide/index.html",
    "revision": "bdbb54b66e69544c2b7368049bcbd7aa"
  },
  {
    "url": "guide/installing-the-commandline-tool.html",
    "revision": "2ae08c5b97ef9091ee867342a5e07c57"
  },
  {
    "url": "guide/installing-the-vscode-extension.html",
    "revision": "b0a82c7a51d457d127e4a5b65f855ef4"
  },
  {
    "url": "guide/integrating-argdown-markdown-into-applications.html",
    "revision": "975bda3997035ef234e7a84a907c936a"
  },
  {
    "url": "guide/loading-custom-plugins-in-a-config-file.html",
    "revision": "a4b72daf62de3efba02c031174c9137d"
  },
  {
    "url": "guide/publishing-argdown-markdown-with-pandoc.html",
    "revision": "429151145bbb4b7798461ee341808bc7"
  },
  {
    "url": "guide/publishing-argument-maps.html",
    "revision": "67291f6ba69d08b1f34827d3909a6b32"
  },
  {
    "url": "guide/running-custom-processes.html",
    "revision": "586561b7ea6126ec646bd8ee629657e7"
  },
  {
    "url": "guide/using-argdown-in-markdown.html",
    "revision": "3fbc5ef81a128bef9124b2042610c079"
  },
  {
    "url": "guide/using-argdown-in-your-application.html",
    "revision": "645c9c155353dc69827743e7077bbb7a"
  },
  {
    "url": "guide/using-logical-symbols-and-emojis.html",
    "revision": "94e6107d8be0efaa239ffff492669d83"
  },
  {
    "url": "guide/writing-custom-plugins.html",
    "revision": "00b6369ce81b5a27b9494f7d325ce72c"
  },
  {
    "url": "index.html",
    "revision": "b8ad82f8baa240d33a719aac8738c919"
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
    "revision": "d74613a1467d8ecd190b743f05fe3857"
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
