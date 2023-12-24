"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("lodash"),
    get = _require.get;

var _require2 = require("./html-utils.js"),
    getHtmlContent = _require2.getHtmlContent;

function base64DataURLToArrayBuffer(dataURL) {
  var stringBase64 = dataURL.replace(/^data:image\/([a-z]+);base64,/, "");
  var binaryString;

  if (typeof window !== "undefined") {
    binaryString = window.atob(stringBase64);
  } else {
    binaryString = Buffer.from(stringBase64, "base64").toString("binary");
  }

  var len = binaryString.length;
  var bytes = new Uint8Array(len);

  for (var i = 0; i < len; i++) {
    var ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }

  return bytes.buffer;
}

module.exports = function handleImage(type, element, runProperties, transformer) {
  if (!transformer.img) {
    if (transformer.ignoreUnknownTags) {
      return "";
    }

    var error = new Error("Tag ".concat(type, " is not supported if imagemodule not included (See https://docxtemplater.com/modules/html/#supportforimageswithimg)"));
    throw error;
  }

  var src;

  if (type === "svg") {
    src = getHtmlContent(element);
  } else {
    if (!element.attribs.src) {
      if (element.centered) {
        return "";
      }

      return "<w:r><w:t></w:t></w:r>";
    }

    var resolvedSrc = get(transformer, ["resolvedImages", element.attribs.src]);

    if (resolvedSrc) {
      src = resolvedSrc;
    } else if (type === "img") {
      src = base64DataURLToArrayBuffer(element.attribs.src);
    }
  }

  transformer.img.dpi = transformer.dpi;
  var _transformer$part = transformer.part,
      lIndex = _transformer$part.lIndex,
      containerWidth = _transformer$part.containerWidth,
      containerHeight = _transformer$part.containerHeight;
  var value = transformer.img.render({
    type: "placeholder",
    module: element.centered ? "open-xml-templating/docxtemplater-image-module-centered" : "open-xml-templating/docxtemplater-image-module",
    value: {
      element: element,
      src: src,
      part: transformer.part,
      transformer: transformer
    },
    lIndex: lIndex,
    containerWidth: containerWidth,
    containerHeight: containerHeight
  }, {
    filePath: transformer.filePath,
    scopeManager: _objectSpread(_objectSpread({}, transformer.scopeManager), {}, {
      getValue: function getValue(src) {
        return src;
      }
    })
  }).value;

  if (element.centered) {
    return value;
  }

  return "<w:r>\n\t\t<w:rPr/>\n\t\t".concat(value, "\n\t\t</w:r>\n\t\t");
};