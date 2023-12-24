"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var stylePath = "word/styles.xml";

var _require$DocUtils = require("docxtemplater").DocUtils,
    str2xml = _require$DocUtils.str2xml,
    xml2str = _require$DocUtils.xml2str;
/* eslint-disable import/no-unresolved */


var baseStylesText = require("../static/styles.xml.js");

var _require = require("./synonyms.js"),
    reversedSynonyms = _require.reversedSynonyms;
/* eslint-enable import/no-unresolved */


module.exports = /*#__PURE__*/function () {
  function StyleManager(xmlDocuments) {
    _classCallCheck(this, StyleManager);

    this.xmlDocuments = xmlDocuments;
    this.stylesXml = this.xmlDocuments[stylePath];
    this.styles = this.stylesXml.getElementsByTagName("w:styles")[0];
    this.usedSynonyms = {};
    this.styleIds = [];
  }

  _createClass(StyleManager, [{
    key: "getDefaultStyles",
    value: function getDefaultStyles() {
      var s = this.stylesXml.getElementsByTagName("w:style");
      var list = Array.prototype.slice.call(s);
      return list.map(function (element) {
        return {
          type: element.getAttribute("w:type"),
          "default": element.getAttribute("w:default"),
          styleId: element.getAttribute("w:styleId")
        };
      }).filter(function (o) {
        return o["default"];
      }).reduce(function (defaults, _ref) {
        var type = _ref.type,
            styleId = _ref.styleId;
        defaults[type] = styleId;
        return defaults;
      }, {});
    }
  }, {
    key: "addStyles",
    value: function addStyles() {
      var baseStylesXml = str2xml(baseStylesText);
      var s = this.stylesXml.getElementsByTagName("w:style");
      var list = Array.prototype.slice.call(s);
      var styleIds = list.map(function (element) {
        return element.getAttribute("w:styleId");
      });
      this.styleIds = list.map(function (element) {
        return element.getAttribute("w:styleId");
      });
      var styleNames = list.map(function (element) {
        var names = element.getElementsByTagName("w:name");

        if (names.length !== 0) {
          return names[0].getAttribute("w:val");
        }
      });
      var styleArr = [];
      list.forEach(function (baseStyle) {
        var _baseStyle$getElement;

        var key = baseStyle.getAttribute("w:styleId");
        var name = (_baseStyle$getElement = baseStyle.getElementsByTagName("w:name")[0]) === null || _baseStyle$getElement === void 0 ? void 0 : _baseStyle$getElement.getAttribute("w:val");
        styleArr.push({
          key: key,
          name: name
        });
      });
      var baseStyles = Array.prototype.slice.call(baseStylesXml.getElementsByTagName("w:style"));
      baseStyles.forEach(function (baseStyle) {
        var _this = this;

        var key = baseStyle.getAttribute("w:styleId");
        var name = baseStyle.getElementsByTagName("w:name")[0].getAttribute("w:val");
        var rSynonyms = reversedSynonyms[key];

        if (["HeadingCar", "Heading1Car", "Heading2Car", "Heading3Car", "Heading4Car", "Heading5Car", "CitationCar"].indexOf(key) !== -1) {
          var mainKey = key.replace("Car", "");

          if (styleIds.indexOf(mainKey) !== -1) {
            return;
          }
        }

        if (rSynonyms) {
          for (var i = 0, len = rSynonyms.length; i < len; i++) {
            if (styleIds.indexOf(rSynonyms[i]) !== -1) {
              this.usedSynonyms[key] = rSynonyms[i];
              return;
            }
          }
        }

        if (styleIds.indexOf(key) !== -1) {
          return;
        }

        if (styleNames.indexOf(name) !== -1) {
          styleArr.forEach(function (styleObj) {
            if (styleObj.name === name) {
              _this.usedSynonyms[key] = styleObj.key;
            }
          });
          return;
        }

        function translator(tagName, usedSynonyms) {
          var _baseStyle$getElement2;

          var attributeValue = (_baseStyle$getElement2 = baseStyle.getElementsByTagName(tagName)[0]) === null || _baseStyle$getElement2 === void 0 ? void 0 : _baseStyle$getElement2.getAttribute("w:val");

          if (attributeValue) {
            var newBasedOn = usedSynonyms[attributeValue];

            if (newBasedOn) {
              baseStyle.getElementsByTagName(tagName)[0].setAttribute("w:val", newBasedOn);
            }
          }
        }

        translator("w:basedOn", this.usedSynonyms);
        translator("w:link", this.usedSynonyms);
        translator("w:next", this.usedSynonyms);
        this.styleIds.push(key);
        this.styles.appendChild(str2xml(xml2str(baseStyle)).childNodes[0]);
      }, this);
    }
  }]);

  return StyleManager;
}();