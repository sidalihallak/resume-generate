"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var _require = require("lodash"),
    max = _require.max,
    get = _require.get,
    last = _require.last;

var str2xml = require("docxtemplater").DocUtils.str2xml;

var _addListSupport = require("./add-list-support.js");

var _require2 = require("./style.js"),
    forEachStyleDeclaration = _require2.forEachStyleDeclaration,
    listStyleToNumFmt = _require2.listStyleToNumFmt;

var _require3 = require("./size-converter.js"),
    toDXA = _require3.toDXA;

var defaultBullets = ["", "o", "", "", "o", "", "", "o", ""];
var abbreviationToTypes = {
  1: "decimal",
  A: "upperLetter",
  a: "lowerLetter",
  I: "upperRoman",
  i: "lowerRoman"
};

var ListHandler = /*#__PURE__*/function () {
  function ListHandler(_ref) {
    var xmlDocuments = _ref.xmlDocuments,
        tagRepository = _ref.tagRepository;

    _classCallCheck(this, ListHandler);

    this.xmlDocuments = xmlDocuments;
    this.tagRepository = tagRepository;
    this.listSupport = false;
  }

  _createClass(ListHandler, [{
    key: "addAbstractNum",
    value: function addAbstractNum(element, transformer, abstractNum, numberingParent) {
      var start = element.attribs.start ? parseInt(element.attribs.start, 10) : 1;
      var name = element.name;
      var marginLeft = 0;
      var numFmt;
      forEachStyleDeclaration(element, transformer, function (_ref2) {
        var property = _ref2.property,
            value = _ref2.value;

        if (property === "margin-left") {
          marginLeft = toDXA(value, transformer);
        }

        if (property === "list-style-type") {
          if (listStyleToNumFmt[value]) {
            numFmt = listStyleToNumFmt[value];
          }
        }
      });
      numFmt = abbreviationToTypes[element.attribs.type] || numFmt;
      numFmt || (numFmt = "decimal");
      var useCustomBullets = !!get(element, "customProperties.bullets");
      var bullets = get(element, "customProperties.bullets", defaultBullets);
      var lastBullet = last(bullets);

      function getBullet(i) {
        var bullet = bullets[i] || lastBullet;

        if (typeof bullet === "string") {
          return bullet;
        }

        return bullet.text;
      }

      function getColor(i) {
        if (_typeof(bullets[i]) === "object" && bullets[i].color) {
          return "<w:color w:val=\"".concat(bullets[i].color, "\"/>");
        }

        return "";
      }

      function getSize(i) {
        if (_typeof(bullets[i]) === "object" && bullets[i].size) {
          return "<w:sz w:val=\"".concat(bullets[i].size * 2, "\"/>");
        }

        return "";
      }

      function getRPr(i) {
        return getFont(i) + getColor(i) + getSize(i);
      }

      function getFont(i) {
        var font;

        if (_typeof(bullets[i]) === "object" && bullets[i].font) {
          font = bullets[i].font;
        }

        if (!useCustomBullets) {
          switch (i % 3) {
            case 0:
              font = "Symbol";
              break;

            case 1:
              font = "Courier New";
              break;

            case 2:
              font = "Wingdings";
              break;
          }
        }

        if (!font) {
          return "";
        }

        if (font === "Wingdings" || font === "Symbol") {
          return "<w:rFonts w:ascii=\"".concat(font, "\" w:hAnsi=\"").concat(font, "\" w:hint=\"default\"/>");
        }

        return "<w:rFonts w:ascii=\"".concat(font, "\" w:hAnsi=\"").concat(font, "\" w:cs=\"").concat(font, "\" w:hint=\"default\"/>");
      }

      function getLeft(level) {
        return 720 + 360 * level + marginLeft;
      }

      var ordered = this.tagRepository.getOrdered(name);
      var str;

      if (!ordered) {
        str = "<w:abstractNum xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" xmlns:w15=\"http://schemas.microsoft.com/office/word/2012/wordml\" w:abstractNumId=\"".concat(abstractNum, "\">\n\t\t\t<w:nsid w:val=\"5F6B5EB").concat(abstractNum, "\"/>\n\t\t\t<w:multiLevelType w:val=\"hybridMultilevel\"/>\n\t\t\t<w:tmpl w:val=\"21E2").concat(abstractNum, "4FE\"/>\n\t\t\t<w:lvl w:ilvl=\"0\" w:tplc=\"08090001\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(0), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(0), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(0), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"1\" w:tplc=\"08090003\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(1), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(1), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(1), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"2\" w:tplc=\"08090005\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(2), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(2), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(2), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"3\" w:tplc=\"08090001\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(3), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(3), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(3), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"4\" w:tplc=\"08090003\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(4), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(4), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(4), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"5\" w:tplc=\"08090005\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(5), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(5), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(5), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"6\" w:tplc=\"08090001\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(6), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(6), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(6), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"7\" w:tplc=\"08090003\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(7), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(7), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(7), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"8\" w:tplc=\"08090005\" w:tentative=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"bullet\"/>\n\t\t\t<w:lvlText w:val=\"").concat(getBullet(8), "\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:ind w:left=\"").concat(getLeft(8), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t<w:rPr>\n\t\t\t").concat(getRPr(8), "\n\t\t\t</w:rPr>\n\t\t\t</w:lvl>\n\t\t\t</w:abstractNum>\n\t\t\t");
      } else {
        str = "<w:abstractNum xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" xmlns:w15=\"http://schemas.microsoft.com/office/word/2012/wordml\" w:abstractNumId=\"".concat(abstractNum, "\" w15:restartNumberingAfterBreak=\"0\">\n\t\t\t<w:lvl w:ilvl=\"0\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%1.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(0), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(0), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"1\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%2.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(1), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(1), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"2\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%3.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(2), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(2), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"3\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%4.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(3), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(3), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"4\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%5.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(4), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(4), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"5\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%6.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(5), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(5), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"6\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%7.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(6), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(6), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"7\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%8.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(7), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(7), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t<w:lvl w:ilvl=\"8\">\n\t\t\t<w:start w:val=\"").concat(start, "\"/>\n\t\t\t<w:numFmt w:val=\"").concat(numFmt, "\"/>\n\t\t\t<w:lvlText w:val=\"%9.\"/>\n\t\t\t<w:lvlJc w:val=\"left\"/>\n\t\t\t<w:pPr>\n\t\t\t<w:tabs>\n\t\t\t<w:tab w:val=\"num\" w:pos=\"").concat(getLeft(8), "\"/>\n\t\t\t</w:tabs>\n\t\t\t<w:ind w:left=\"").concat(getLeft(8), "\" w:hanging=\"360\"/>\n\t\t\t</w:pPr>\n\t\t\t</w:lvl>\n\t\t\t</w:abstractNum>");
      }

      numberingParent.insertBefore(str2xml(str).childNodes[0], numberingParent.firstChild);
      return abstractNum;
    }
  }, {
    key: "addListSupport",
    value: function addListSupport(transformer) {
      if (this.listSupport) {
        return;
      }

      _addListSupport(this.xmlDocuments, transformer.mainRelsFile);
    }
  }, {
    key: "addList",
    value: function addList(element, transformer) {
      // We create a new list for each "ul", "ol", ... because else, the numbering would go like this :
      //
      // 1. Go to the mall
      // 2. Buy some tea
      //
      // Other unrelated content
      //
      // 3. Take a nap
      //
      // Obviously we want the numbering to restart for each list, this is why there is no "caching"
      var numberingDoc = this.xmlDocuments["word/numbering.xml"];
      var numberingParent = numberingDoc.getElementsByTagName("w:numbering")[0];
      var nums = numberingParent.getElementsByTagName("w:num");
      nums = Array.prototype.map.call(nums, function (n) {
        return parseInt(n.getAttribute("w:numId"), 10);
      });
      nums.push(0);
      var num = max(nums) + 1;
      var abstractNum = this.addAbstractNum(element, transformer, num, numberingParent);
      var numToAbstractNum = "<w:num xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" w:numId=\"".concat(num, "\">\n\t\t\t<w:abstractNumId w:val=\"").concat(abstractNum, "\"/>\n\t\t</w:num>\n\t\t");
      numberingParent.appendChild(str2xml(numToAbstractNum).childNodes[0]);
      return num;
    }
  }]);

  return ListHandler;
}();

module.exports = ListHandler;