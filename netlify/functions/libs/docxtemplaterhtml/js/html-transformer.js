"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var _require = require("lodash"),
    flatten = _require.flatten;

var paragraph = require("./paragraph.js");

var _require2 = require("./whitespace.js"),
    stripRunsWhiteSpace = _require2.stripRunsWhiteSpace;

var paragraphsToText = require("./renderer.js");

var _require3 = require("htmlparser2"),
    Parser = _require3.Parser;

var _require4 = require("domhandler"),
    DomHandler = _require4.DomHandler;

var getRelsFilePath = require("./rels-file-path.js");

var str2xml = require("docxtemplater").DocUtils.str2xml;

var HtmlTransformer = /*#__PURE__*/function () {
  function HtmlTransformer(_ref, filePath, part, _ref2) {
    var xmlDocuments = _ref.xmlDocuments,
        resolvedImages = _ref.resolvedImages,
        listHandler = _ref.listHandler,
        synonyms = _ref.synonyms,
        containerWidth = _ref.containerWidth,
        styleIds = _ref.styleIds,
        tagRepository = _ref.tagRepository,
        img = _ref.img,
        sizeConverters = _ref.sizeConverters,
        mainRelsFile = _ref.mainRelsFile,
        dpi = _ref.dpi,
        sections = _ref.sections,
        styleDefaults = _ref.styleDefaults,
        elementCustomizer = _ref.elementCustomizer,
        minBookmarkId = _ref.minBookmarkId,
        styleSheet = _ref.styleSheet,
        _ref$options = _ref.options,
        ignoreCssErrors = _ref$options.ignoreCssErrors,
        ignoreUnknownTags = _ref$options.ignoreUnknownTags;
    var scopeManager = _ref2.scopeManager;

    _classCallCheck(this, HtmlTransformer);

    this.mainRelsFile = mainRelsFile;
    this.scopeManager = scopeManager;
    this.sections = sections;
    this.part = part;
    this.synonyms = synonyms;
    this.styleIds = styleIds;
    this.sizeConverters = sizeConverters;
    this.resolvedImages = resolvedImages;
    this.dpi = dpi;
    this.ignoreUnknownTags = ignoreUnknownTags;
    this.ignoreCssErrors = ignoreCssErrors;
    this.tagRepository = tagRepository;
    this.containerWidth = containerWidth;
    this.listHandler = listHandler;
    this.xmlDocuments = xmlDocuments;
    this.handler = new DomHandler();
    this.parser = new Parser(this.handler);
    this.img = img;
    this.minBookmarkId = minBookmarkId;
    this.filePath = filePath;
    this.relsFilePath = getRelsFilePath(filePath);
    this.xmlDocuments[this.relsFilePath] = this.xmlDocuments[this.relsFilePath] || str2xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');
    this.styleDefaults = styleDefaults;
    this.elementCustomizer = elementCustomizer;
    this.styleSheet = styleSheet;
    this.textinputcount = 1;
  }

  _createClass(HtmlTransformer, [{
    key: "parse",
    value: function parse(html) {
      this.parser.parseComplete(html);
    }
  }, {
    key: "transformInline",
    value: function transformInline(runProperties) {
      var _this = this;

      var runs = flatten(this.handler.dom.map(function (element) {
        return paragraph.getRelationElement(element, [], runProperties, _this);
      }));
      return stripRunsWhiteSpace(runs);
    }
  }, {
    key: "getBlockContent",
    value: function getBlockContent(elements, runProperties, customProperties, paragraphRunProperties) {
      var _this2 = this;

      var chunk;
      var elementsWithImplicit = elements.reduce(function (result, element) {
        var name = element.name;

        if (name && _this2.tagRepository.isBlock(name)) {
          if (chunk) {
            chunk[chunk.length - 1].next = null;
            var _element = {
              children: chunk,
              name: "p",
              type: "tag",
              customProperties: customProperties,
              implicit: true
            };
            chunk.forEach(function (part) {
              part.parent = _element;
            });
            result.push(_element);
            chunk = null;
          }

          result.push(element);
          return result;
        }

        chunk || (chunk = []);
        chunk.push(element);
        return result;
      }, []);

      if (chunk) {
        var element = {
          children: chunk,
          name: "p",
          type: "tag",
          customProperties: customProperties,
          implicit: true
        };
        elementsWithImplicit.push(element);
        chunk = null;
      }

      return elementsWithImplicit.map(function (element) {
        var type = element.type;

        if (type === "tag") {
          var pars = paragraph.getParagraphs({
            element: element,
            level: 0,
            props: [],
            runProperties: runProperties,
            transformer: _this2,
            customProperties: customProperties,
            paragraphRunProperties: paragraphRunProperties
          });
          return paragraphsToText({
            paragraphs: pars,
            transformer: _this2,
            customProperties: customProperties,
            paragraphRunProperties: paragraphRunProperties
          });
        }

        return "";
      }).join("").replace(/&amp;nbsp;/g, " ").replace(/\t|\n/g, "");
    }
  }, {
    key: "transformBlock",
    value: function transformBlock(runProperties, customProperties, paragraphRunProperties) {
      return this.getBlockContent(this.handler.dom, runProperties, customProperties, paragraphRunProperties);
    }
  }]);

  return HtmlTransformer;
}();

module.exports = HtmlTransformer;