import FileSaver from 'file-saver'
import dagreCss from '!!raw-loader!./scss/dagre.css'
var dagreCssHtml = '<style type="text/css">' + dagreCss + '</style>'

// Edge Blob polyfill https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      var canvas = this
      setTimeout(function () {
        var binStr = atob(canvas.toDataURL(type, quality).split(',')[1])
        var len = binStr.length
        var arr = new Uint8Array(len)

        for (var i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i)
        }

        callback(new Blob([arr], { type: type || 'image/png' }))
      })
    }
  })
}

function getSvgString (el, width, height, scale, isDagre) {
  var source = new XMLSerializer().serializeToString(el)

  source = source.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=') // Fix root xlink without namespace
  source = source.replace(/NS\d+:href/g, 'xlink:href') // Safari NS namespace fix

  // add name spaces.
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  }

  // add preserverAspectRatio="xMinYMin meet"
  // add viewBox="0 0 500 500"
  // set explicit size
  source = source.replace(/width="100%"/, 'width="' + width * scale + 'px"')
  source = source.replace(
    /height="100%"/,
    'height="' + height * scale + 'px" viewBox="0 0 ' + width + ' ' + height + '" preserverAspectRatio="xMinYMin meet"'
  )

  if (isDagre) {
    // insert css
    var match = /^<svg.*?>/.exec(source)
    if (match) {
      var insertAt = match.index + match[0].length
      source = source.slice(0, insertAt) + dagreCssHtml + source.slice(insertAt)
    }
    // use marker refs without url
    source = source.replace(/marker-end="url\(.*?#/g, 'marker-end="url(#')
  }

  // add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source
  return source
}
function svgString2Image (svgString, width, height, callback) {
  var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))) // Convert SVG string to data URL

  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height

  var image = new Image()
  image.onload = function () {
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    canvas.toBlob(function (blob) {
      var filesize = Math.round(blob.length / 1024) + ' KB'
      if (callback) callback(blob, filesize)
    })
  }
  image.src = imgsrc
}
// function convertSvgToPng (svgEl, svgString, scale, callback) {
//   var canvas = document.createElement('canvas') // Not shown on page
//   var ctx = canvas.getContext('2d')
//   var img = new Image() // Not shown on page
//   // img.crossOrigin = 'anonymous'

//   var svgWidth = svgEl.clientWidth
//   var svgHeight = svgEl.clientHeight
//   if (svgWidth === 0 || svgHeight === 0) {
//     var box = svgEl.getBoundingClientRect()
//     svgWidth = box.right - box.left
//     svgHeight = box.bottom - box.top
//   }
//   console.log(svgWidth)
//   console.log(svgHeight)
//   img.width = svgWidth * scale
//   img.height = svgHeight * scale
//   img.onload = function () {
//     ctx.drawImage(img, 0, 0, img.width, img.height)
//     canvas.width = img.width
//     canvas.height = img.height
//     // var dataUrl = can.toDataURL()
//     // domURL.revokeObjectURL(dataUrl)
//     canvas.toBlob(function (blob) {
//       callback(blob)
//       // canvas.remove()
//     })
//   }
//   // var domURL = self.URL || self.webkitURL || self
//   // var svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
//   // var dataUrl = domURL.createObjectURL(svgBlob)
//   console.log(svgString)
//   var dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)
//   img.src = dataUrl
// }
export function saveAsSvg (el, isDagreSvg) {
  var width = el.clientWidth
  var height = el.clientHeight
  if (width === 0 || height === 0) {
    var box = el.getBoundingClientRect()
    width = box.right - box.left
    height = box.bottom - box.top
  }
  var source = getSvgString(el, width, height, 1, isDagreSvg)
  var blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  FileSaver.saveAs(blob, 'map.svg')
}
export function saveAsPng (el, scale, isDagreSvg) {
  var width = el.clientWidth
  var height = el.clientHeight
  if (width === 0 || height === 0) {
    var box = el.getBoundingClientRect()
    width = box.right - box.left
    height = box.bottom - box.top
  }
  var source = getSvgString(el, width, height, scale, isDagreSvg)
  width *= scale
  height *= scale
  svgString2Image(source, width, height, function (blob) {
    if (!blob) {
      console.log('blob is null!')
      return
    }
    console.log(blob)
    FileSaver.saveAs(blob, 'map.png')
    // FileSaver.saveAs(blob, 'map.png')
  })
}
