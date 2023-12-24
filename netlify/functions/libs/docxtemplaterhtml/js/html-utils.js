"use strict";

var _require = require("./whitespace.js"),
    isWhiteSpace = _require.isWhiteSpace;

function getTextContent(element) {
  return element.children.reduce(function (text, c) {
    if (c.type === "tag") {
      return text + getTextContent(c);
    }

    return text + c.data;
  }, "");
}

function getHtmlContent(element) {
  if (element.type === "tag") {
    var contentAttribs = Object.keys(element.attribs).map(function (attrib) {
      return "".concat(attrib, "=\"").concat(element.attribs[attrib], "\"");
    }).join(" ");
    var contentChild = element.children.map(function (child) {
      return getHtmlContent(child);
    }).join("");
    return "<".concat(element.name, " ").concat(contentAttribs, ">").concat(contentChild, "</").concat(element.name, ">");
  }

  if (element.type === "text") {
    return element.data;
  }
}

function getClassNames(element) {
  return element.attribs && element.attribs["class"] ? element.attribs["class"].split(" ") : [];
}

function tapRecursive(element, fn) {
  if (element.length) {
    for (var i = 0, len = element.length; i < len; i++) {
      tapRecursive(element[i], fn);
    }

    return;
  }

  fn(element);

  if (element.children) {
    for (var _i = 0, _len = element.children.length; _i < _len; _i++) {
      tapRecursive(element.children[_i], fn);
    }
  }
}

function isContent(el) {
  return el.name === "br" || el.type === "text" && !isWhiteSpace(el.data);
}

function isEndingText(cc, parentElement) {
  // See https://stackoverflow.com/questions/61907540/when-are-br-elements-ignored-when-within-a-paragraph
  if (cc.children) {
    for (var i = 0, len = cc.children.length; i < len; i++) {
      var d = cc.children[i];

      if (isContent(d)) {
        return false;
      }
    }
  }

  if (cc.next) {
    if (isContent(cc.next)) {
      return false;
    }

    return isEndingText(cc.next, parentElement);
  }

  if (cc.parent && cc.parent !== parentElement && cc.parent.next) {
    if (isContent(cc.parent.next)) {
      return false;
    }

    return isEndingText(cc.parent.next, parentElement);
  }

  return true;
}

module.exports = {
  getTextContent: getTextContent,
  getHtmlContent: getHtmlContent,
  getClassNames: getClassNames,
  tapRecursive: tapRecursive,
  isEndingText: isEndingText
};