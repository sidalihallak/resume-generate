"use strict";

var _require = require("./whitespace.js"),
    stripRunsWhiteSpace = _require.stripRunsWhiteSpace;

var _require2 = require("lodash"),
    get = _require2.get,
    cloneDeep = _require2.cloneDeep;

var _require3 = require("./style.js"),
    addParagraphStyle = _require3.addParagraphStyle;

var stringifyParagraphTypes = require("./stringify-paragraphtypes.js");

function surroundParagraph(_ref) {
  var content = _ref.content,
      element = _ref.element,
      transformer = _ref.transformer,
      customProperties = _ref.customProperties,
      paragraphRunProperties = _ref.paragraphRunProperties;
  var name = element.name;
  var tr = transformer.tagRepository;

  function addPStyle(paragraphTypes) {
    var pStyle = get(element, "customProperties.pStyle");

    if (!pStyle) {
      if (name === "p") {
        for (var i = customProperties.length - 1; i >= 0; i--) {
          var _customProperties$i = customProperties[i],
              tag = _customProperties$i.tag,
              value = _customProperties$i.value;

          if (tag === "w:pStyle") {
            paragraphTypes.push(value);
            return paragraphTypes;
          }
        }
      }

      pStyle = tr.getPStyle(name);
    }

    if (pStyle) {
      paragraphTypes.push("<w:pStyle w:val=\"".concat(pStyle, "\"/>"));
    }

    return paragraphTypes;
  }

  var isBlock = tr.isBlock,
      getXmlProperties = tr.getXmlProperties;
  var xmlProperties = getXmlProperties(name);

  if (xmlProperties != null) {
    throw new Error("Tag '".concat(name, "' is of type inline, it is not supported as the root of a block-scoped tag"));
  }

  if (!isBlock(name)) {
    throw new Error("Tag '".concat(name, "' not supported as a block element"));
  }

  element.paragraphTypes = element.paragraphTypes.concat(addPStyle(cloneDeep(tr.getProps(name))));
  addParagraphStyle({
    element: element,
    transformer: transformer,
    customProperties: customProperties
  });
  (customProperties || []).forEach(function (_ref2) {
    var tag = _ref2.tag,
        value = _ref2.value;

    if (["w:bidi"].indexOf(tag) !== -1) {
      element.paragraphTypes.unshift(value);
    }
  });

  if (name === "p") {
    (customProperties || []).forEach(function (_ref3) {
      var tag = _ref3.tag,
          value = _ref3.value;

      if (["w:spacing", "w:jc", "w:ind"].indexOf(tag) !== -1) {
        element.paragraphTypes.unshift(value);
      }
    });
  }

  var parProps = stringifyParagraphTypes(element.paragraphTypes);
  var bookmark = "";

  if (element.bookmark) {
    var bmId = transformer.minBookmarkId++;
    bookmark = "<w:bookmarkStart w:id=\"".concat(bmId, "\" w:name=\"").concat(element.bookmark, "\"/><w:bookmarkEnd w:id=\"").concat(bmId, "\"/>");
  }

  var columnBreak = "";

  if (transformer.part.renderColumnBreak) {
    columnBreak = '<w:r><w:br w:type="column"/></w:r>';
    transformer.part.renderColumnBreak = false;
  }

  return "<w:p>\n\t".concat(bookmark, "\n\t<w:pPr>\n\t\t").concat(parProps, "\n\t\t").concat(paragraphRunProperties.length === 0 ? "<w:rPr/>" : "<w:rPr>".concat(paragraphRunProperties.map(function (_ref4) {
    var value = _ref4.value;
    return value;
  }).join(""), "</w:rPr>"), "\n\t</w:pPr>\n\t").concat(columnBreak, "\n\t").concat(content, "\n\t</w:p>");
}

var corruptCharacters = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g; // 00    NUL '\0' (null character)
// 01    SOH (start of heading)
// 02    STX (start of text)
// 03    ETX (end of text)
// 04    EOT (end of transmission)
// 05    ENQ (enquiry)
// 06    ACK (acknowledge)
// 07    BEL '\a' (bell)
// 08    BS  '\b' (backspace)
// 0B    VT  '\v' (vertical tab)
// 0C    FF  '\f' (form feed)
// 0E    SO  (shift out)
// 0F    SI  (shift in)
// 10    DLE (data link escape)
// 11    DC1 (device control 1)
// 12    DC2 (device control 2)
// 13    DC3 (device control 3)
// 14    DC4 (device control 4)
// 15    NAK (negative ack.)
// 16    SYN (synchronous idle)
// 17    ETB (end of trans. blk)
// 18    CAN (cancel)
// 19    EM  (end of medium)
// 1A    SUB (substitute)
// 1B    ESC (escape)
// 1C    FS  (file separator)
// 1D    GS  (group separator)
// 1E    RS  (record separator)
// 1F    US  (unit separator)

function stripEscapeChars(str) {
  return str.replace(corruptCharacters, "");
}

module.exports = function paragraphsToText(_ref5) {
  var paragraphs = _ref5.paragraphs,
      transformer = _ref5.transformer,
      customProperties = _ref5.customProperties,
      paragraphRunProperties = _ref5.paragraphRunProperties;
  return paragraphs.map(function (paragraph) {
    if (typeof paragraph.data === "string") {
      return paragraph.data;
    }

    var runs = paragraph.data;
    var runsText = stripEscapeChars(stripRunsWhiteSpace(runs));
    return surroundParagraph({
      content: runsText,
      element: paragraph.element,
      paragraphRunProperties: paragraphRunProperties,
      transformer: transformer,
      customProperties: customProperties
    });
  }).join("");
};