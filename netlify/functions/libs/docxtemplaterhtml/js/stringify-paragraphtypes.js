"use strict";

var str2xml = require("docxtemplater").DocUtils.str2xml;

var columnReplacer = "CCOOLLUUMMNN";

var _require = require("lodash"),
    merge = _require.merge,
    map = _require.map;

function stringifyParagraphTypes(paragraphTypes) {
  var parsedParagraphTypes = paragraphTypes.map(function (paragraphType) {
    var xml = str2xml(paragraphType.replace(/:/g, columnReplacer));
    var node = xml.childNodes[0];
    var parsed = {
      name: node.tagName.replace(columnReplacer, ":"),
      attributes: {}
    };

    for (var i = 0, len = node.attributes.length; i < len; i++) {
      var attr = node.attributes[i];
      parsed.attributes[attr.name.replace(columnReplacer, ":")] = attr.value.replace(columnReplacer, ":");
    }

    return parsed;
  });
  var result = parsedParagraphTypes.reduce(function (result, _ref) {
    var name = _ref.name,
        attributes = _ref.attributes;

    if (!result[name]) {
      result[name] = attributes;
    } else {
      result[name] = merge({}, result[name], attributes);
    }

    return result;
  }, {});
  var s = map(result, function (attributes, key) {
    var stringifiedAttributes = map(attributes, function (attributeVal, attributeKey) {
      return "".concat(attributeKey, "=\"").concat(attributeVal, "\"");
    }).join(" ");
    return "<".concat(key, " ").concat(stringifiedAttributes, "/>");
  }).sort().join("");
  return s;
}

module.exports = stringifyParagraphTypes;