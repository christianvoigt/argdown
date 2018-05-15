var mdurl        = require('mdurl');
var punycode     = require('punycode');

// taken from: https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js

var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

// taken from https://github.com/markdown-it/markdown-it/blob/master/lib/index.js

////////////////////////////////////////////////////////////////////////////////
//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//

var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

function validateLink(url) {
  // url should be normalized at this point, and existing entities are decoded
  var str = url.trim().toLowerCase();

  return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
}

////////////////////////////////////////////////////////////////////////////////

var RECODE_HOSTNAME_FOR = [ 'http:', 'https:', 'mailto:' ];

function normalizeLink(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname);
      } catch (er) { /**/ }
    }
  }

  return mdurl.encode(mdurl.format(parsed));
}

function normalizeLinkText(url) {
    var parsed = mdurl.parse(url, true);
  
    if (parsed.hostname) {
      // Encode hostnames in urls like:
      // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
      //
      // We don't encode unknown schemas, because it's likely that we encode
      // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
      //
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
        try {
          parsed.hostname = punycode.toUnicode(parsed.hostname);
        } catch (er) { /**/ }
      }
    }
  
    return mdurl.decode(mdurl.format(parsed));
  }

////////////////////////////////////////////////////////////////////////////////////
// ARGDOWN Utils

function stringToHtmlId(str) {
    let id = str;
    id = id.toLowerCase();
    id = id.replace(/ä/g, "ae");
    id = id.replace(/ö/g, "oe");
    id = id.replace(/ü/g, "ue");
    id = id.replace(/ß/g, "ss");
    id = id.replace(/\s/g, "-");
    id = id.replace(/[^a-z0-9\-]/g, "");
    return id;
}
const stringToClassName = stringToHtmlId;

/// Returns a html id of the form "type-title". 
/// If htmlIdsSet is not null, creates an id that is not already a member of the set.
/// Example: If "statement-s1" is already a member of the set, it will return "statement-s1-occurrence-2".
/// Note that you still have to add the new id to the set yourself if you want to avoid duplicates.
function getHtmlId(type, title, htmlIdsSet) {
    let id = type + "-" + title;
    id = stringToHtmlId(id);
    if (htmlIdsSet) {
        let originalId = id;
        let i = 1;
        while (htmlIdsSet[id]) {
            i++;
            id = originalId + "-occurrence-" + i;
        }
    }
    return id;
}

exports.escapeHtml = escapeHtml;
exports.validateLink = validateLink;
exports.normalizeLink = normalizeLink;
exports.normalizeLinkText = normalizeLinkText;
exports.getHtmlId = getHtmlId;
exports.stringToHtmlId = stringToHtmlId;
exports.stringToClassName = stringToClassName;