// import { INSPECT_MAX_BYTES } from "buffer";

function getSvgString(
  el: SVGSVGElement,
  width: number,
  height: number,
  scale: number,
  css: string = ""
) {
  var source = new XMLSerializer().serializeToString(el);
  source = source.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace
  source = source.replace(/NS\d+:href/g, "xlink:href"); // Safari NS namespace fix

  // add name spaces.
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  // add preserverAspectRatio="xMinYMin meet"
  // add viewBox="0 0 500 500"
  // set explicit size
  source = source.replace(/width="100%"/, 'width="' + width * scale + 'px"');
  source = source.replace(
    /height="100%"/,
    'height="' +
      height * scale +
      'px" viewBox="0 0 ' +
      width +
      " " +
      height +
      '" preserverAspectRatio="xMinYMin meet"'
  );

  if (css) {
    var cssHtml = '<style type="text/css">' + css + "</style>";
    // insert css
    var match = /^<svg.*?>/.exec(source);
    if (match) {
      var insertAt = match.index + match[0].length;
      source = source.slice(0, insertAt) + cssHtml + source.slice(insertAt);
    }
    // use marker refs without url
    source = source.replace(/marker-end="url\(.*?#/g, 'marker-end="url(#');
  }

  // add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
  return source;
}
function svgString2Image(
  svgString: string,
  width: number,
  height: number,
  callback: (pngString: string) => void
) {
  //   var imgsrc =
  //     "data:image/svg+xml;base64," +
  //     btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL
  var imgsrc = "data:image/svg+xml;utf8," + encodeURIComponent(svgString);

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  var image = new Image();
  image.src = "";
  image.addEventListener(
    "load",
    () => {
      context!.clearRect(0, 0, width, height);
      context!.drawImage(image, 0, 0, width, height);
      var dataUrl = canvas.toDataURL("image/png");

      callback(dataUrl);
    },
    false
  );
  image.src = imgsrc;
}
export function getSvgForExport(el: SVGSVGElement, css: string = "") {
  var width = el.clientWidth;
  var height = el.clientHeight;
  if (width === 0 || height === 0) {
    var box = el.getBoundingClientRect();
    width = box.right - box.left;
    height = box.bottom - box.top;
  }
  return getSvgString(el, width, height, 1, css);
}
export function getPngAsString(
  el: SVGSVGElement,
  scale: number,
  css: string,
  callback: (pngString: string) => void
) {
  var width = el.clientWidth;
  var height = el.clientHeight;
  if (width === 0 || height === 0) {
    var box = el.getBoundingClientRect();
    width = box.right - box.left;
    height = box.bottom - box.top;
  }
  var source = getSvgString(el, width, height, scale, css);
  width *= scale;
  height *= scale;
  svgString2Image(source, width, height, callback);
}
