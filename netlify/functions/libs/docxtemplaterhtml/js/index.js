"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var verifyApiVersion = require("./api-verify.js");

var _require$DocUtils = require("docxtemplater").DocUtils,
    concatArrays = _require$DocUtils.concatArrays,
    traits = _require$DocUtils.traits,
    str2xml = _require$DocUtils.str2xml;

var HtmlTransformer = require("./html-transformer.js");

var _require = require("./converter.js"),
    dxaToPixel = _require.dxaToPixel;

var textStripper = require("./text-stripper.js");

var _require2 = require("./tag.js"),
    isStartingTag = _require2.isStartingTag;

var _require3 = require("./html-utils.js"),
    tapRecursive = _require3.tapRecursive,
    getTextContent = _require3.getTextContent;

var _require4 = require("lodash"),
    merge = _require4.merge,
    pick = _require4.pick,
    get = _require4.get;

var StyleManager = require("./style-manager.js");

var moduleNameBlock = "pro-xml-templating/html-module-block";
var moduleNameInline = "pro-xml-templating/html-module-inline";

var ListHandler = require("./list-handler.js");

var docStyles = require("./doc-styles.js");

var _require5 = require("./tags.js"),
    TagRepository = _require5.TagRepository;

var Docxtemplater = require("docxtemplater");

var _require6 = require("./attributes.js"),
    getSingleAttribute = _require6.getSingleAttribute;

var _require7 = require("./style.js"),
    forEachStyleDeclaration = _require7.forEachStyleDeclaration;

var _require8 = require("./regex.js"),
    percentRegex = _require8.percentRegex;

var cssParser = require("css/lib/parse/index.js");

var ctXML = "[Content_Types].xml";

var _require9 = require("./content-types.js"),
    mainContentType = _require9.mainContentType;

var widthCollector = require("./get-widths.js");

function getResolvedId(part, options) {
  return options.filePath + "@" + part.lIndex.toString() + "-" + options.scopeManager.scopePathItem.join("-");
}

function hasColumnBreak(chunk) {
  return chunk.some(function (part) {
    if (part.tag === "w:br" && part.value.indexOf('w:type="column"') !== -1) {
      return true;
    }
  });
}

function getInner(_ref) {
  var leftParts = _ref.leftParts,
      part = _ref.part;
  part.hasColumnBreak = hasColumnBreak(leftParts);
  return part;
}

function getInnerInline(_ref2) {
  var part = _ref2.part,
      leftParts = _ref2.leftParts,
      rightParts = _ref2.rightParts,
      postparse = _ref2.postparse;
  var strippedLeft = textStripper(leftParts);
  var strippedRight = textStripper(rightParts);
  strippedLeft.forEach(function (part) {
    if (part.tag === "w:t" && part.position === "start") {
      part.value = '<w:t xml:space="preserve">';
    }
  });
  var p1 = postparse(concatArrays([leftParts, strippedRight]));
  var p2 = postparse(concatArrays([strippedLeft, rightParts]));
  part.expanded = [strippedLeft, strippedRight];
  return concatArrays([p1, [part], p2]);
}

function getTextualPartBefore(expanded) {
  var textualPart = "";
  var hasText = false;
  expanded[0].forEach(function (part) {
    if (part.tag === "w:t" && part.position === "start") {
      textualPart += '<w:t xml:space="preserve">';
    } else {
      textualPart += part.value;
    }

    if (part.type === "content" && part.position === "insidetag") {
      hasText = true;
    }
  });

  if (!hasText) {
    return "";
  }

  expanded[1].forEach(function (part) {
    textualPart += part.value;
  });
  return textualPart;
}

function getProperties(parts, tagName) {
  var levelFilter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var inTag = false;
  var level = 0;
  var properties = [];

  for (var i = 0, len = parts.length; i < len; i++) {
    var part = parts[i];
    var type = part.type,
        tag = part.tag,
        position = part.position;

    if (inTag) {
      if (type === "tag" && tag === tagName && position === "end") {
        inTag = false;
        continue;
      }

      properties.push(part);
    }

    if (type === "tag") {
      if (position === "start") {
        if (tag === tagName && (levelFilter === null || levelFilter === level)) {
          inTag = true;
        }

        level++;
      }

      if (position === "end") {
        level--;
      }
    }
  }

  return properties;
}

var defaultSizeConverters = {
  paddingLeft: 15
};

function defaultGetDxaWidth() {
  return 9026;
}

var defaultDeviceWidth = 470.10416666666663;

var HtmlModule = /*#__PURE__*/function () {
  function HtmlModule() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, HtmlModule);

    this.columnNum = 0;
    this.supportedFileTypes = ["docx"];
    this.requiredAPIVersion = "3.30.0";
    this.resolved = {};
    this.sections = [];
    this.W = {};
    options.deviceWidth || (options.deviceWidth = defaultDeviceWidth);
    this.prefix = "~";
    this.name = "HtmlModule";
    this.minBookmarkId = 1;
    this.blockPrefix = "~~";
    this.htmlSections = [];

    this.elementCustomizer = options.elementCustomizer || function () {
      return undefined;
    };

    this.tagRepository = new TagRepository({
      getTag: function getTag(tags, name) {
        if (!tags[name]) {
          if (options.ignoreUnknownTags) {
            return tags.span;
          }

          var err = new Docxtemplater.Errors.RenderingError("Tag ".concat(name, " not supported"));
          err.properties = {
            explanation: "The tag ".concat(name, " is not supported"),
            name: name,
            id: "html_tag_name_unsupported"
          };
          throw err;
        }

        return tags[name];
      }
    });
    options.getDxaWidth || (options.getDxaWidth = defaultGetDxaWidth);
    this.sizeConverters = merge({}, defaultSizeConverters, options.sizeConverters);

    if (options.img) {
      var img = options.img;
      var imModule = this.img = new options.img.Module({
        getImage: function getImage(image) {
          return image.src;
        },
        getProps: function getProps(_, value) {
          if (img.getProps) {
            return img.getProps(value);
          }
        },
        getSize: function getSize(_, value, __) {
          var vals = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
          var transformer = value.transformer;
          imModule.dpi = transformer.dpi;
          var srcSize = null;

          if (img.getSrcSize) {
            srcSize = img.getSrcSize(value);
          }

          if (img.getSize) {
            return img.getSize(value);
          }

          var percentWidth = null;
          forEachStyleDeclaration(value.element, value.transformer, function (_ref3) {
            var property = _ref3.property,
                value = _ref3.value;

            if (property === "width" && percentWidth == null && percentRegex.test(value)) {
              percentWidth = parseInt(value, 10);
            }
          });

          if (percentWidth && srcSize && value.element.parent) {
            if (value.element.parent.name === "td" && value.element.parent.calculatedWidth) {
              var imgWidth = dxaToPixel(value.element.parent.calculatedWidth, transformer.dpi) * percentWidth / 100;
              var imgHeight = Math.round(srcSize[1] / srcSize[0] * imgWidth);
              imgWidth = Math.round(imgWidth);
              return [imgWidth, imgHeight];
            }
          }

          if (vals.svgSize === null) {
            return [500, 500];
          }

          if (vals.svgSize) {
            return vals.svgSize;
          }

          if (value.element.attribs.width && value.element.attribs.height) {
            return [parseInt(value.element.attribs.width, 10), parseInt(value.element.attribs.height, 10)];
          }

          return [200, 200];
        }
      });
      imModule.W = this.W;
    }

    if (options.styleSheet) {
      var type = _typeof(options.styleSheet);

      if (type !== "string") {
        var err = new Docxtemplater.Errors.XTError("stylesheet must be a string, but received ".concat(type));
        err.properties = {
          explanation: "The HTML module styleSheet option must be a string",
          id: "html_module_stylesheet_not_string"
        };
        throw err;
      }

      this.styleSheet = cssParser(options.styleSheet, {
        silent: options.ignoreCssErrors
      });
      this.rawStyleSheet = options.styleSheet;
    }

    this.options = options;
  }

  _createClass(HtmlModule, [{
    key: "clone",
    value: function clone() {
      return new HtmlModule(this.options);
    }
  }, {
    key: "set",
    value: function set(options) {
      if (this.img) {
        this.img.set(options);
      }

      if (options.xmlDocuments) {
        this.xmlDocuments = options.xmlDocuments;
        this.listHandler = new ListHandler(this);
      }

      if (options.inspect && options.inspect.filePath) {
        this.filePath = options.inspect.filePath;
      }
    }
  }, {
    key: "addStyles",
    value: function addStyles() {
      this.styleManager = new StyleManager(this.xmlDocuments);
      this.styleManager.addStyles();
      this.synonyms = this.styleManager.usedSynonyms;
      this.styleIds = this.styleManager.styleIds;
      this.styleDefaults = this.styleManager.getDefaultStyles();

      if (this.options.styleTransformer) {
        this.tagRepository.tags = this.options.styleTransformer(this.tagRepository.tags, docStyles(), this);
      }

      this.tagRepository.styleDefaults = this.styleDefaults;
    }
  }, {
    key: "getNextWSect",
    value: function getNextWSect(lIndex) {
      if (this.htmlSections.length === 0) {
        // default section
        return {
          width: 11906,
          leftMargin: 1701,
          rightMargin: 850
        };
      }

      for (var i = 0, len = this.htmlSections.length; i < len; i++) {
        var section = this.htmlSections[i];

        if (section.lIndex > lIndex) {
          return section;
        }
      }

      throw new Error("Section not found for ".concat(lIndex));
    }
  }, {
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      verifyApiVersion(docxtemplater, this.requiredAPIVersion);
      this.docxtemplater = docxtemplater;
      var relsFiles = docxtemplater.zip.file(/numbering.xml/).concat(docxtemplater.zip.file(/\[Content_Types\].xml/)).concat(docxtemplater.zip.file(/word\/styles\.xml/)).concat(docxtemplater.zip.file(/document\d*\.xml\.rels/)).map(function (file) {
        return file.name;
      });

      if (docxtemplater.fileType === "pptx") {
        var err = new Docxtemplater.Errors.XTTemplateError("The HTML module only handles docx, not pptx");
        err.properties = {
          explanation: "The HTML module only handles docx",
          id: "html_module_does_not_support_pptx"
        };
        throw err;
      }

      options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
      docxtemplater.fileTypeConfig.tagsXmlLexedArray.push("w:bCs", "w:bidi", "w:bookmarkStart", "w:cols", "w:col", "w:ind", "w:jc", "w:pPr", "w:pStyle", "w:pgMar", "w:pgSz", "w:rFonts", "w:rPr", "w:rtl", "w:rStyle", "w:sdtContent", "w:sectPr", "w:spacing", "w:sz", "w:highlight", "w:i", "w:b", "w:color", "w:rStyle", "w:strike", "w:vertAlign", "w:u", "w:lang", "w:szCs");
      var contentTypes = docxtemplater.zip.files[ctXML];
      this.targets = [];
      var contentTypeXml = contentTypes ? str2xml(contentTypes.asText()) : null;
      var overrides = contentTypeXml ? contentTypeXml.getElementsByTagName("Override") : null;

      for (var i = 0, len = overrides.length; i < len; i++) {
        var override = overrides[i];
        var contentType = override.getAttribute("ContentType");
        var partName = override.getAttribute("PartName").substr(1);

        if (contentType === mainContentType) {
          this.mainFile = partName;
          this.mainRelsFile = partName.replace(/^(.+?)\/([a-zA-Z0-9]+)\.xml$/, "$1/_rels/$2") + ".xml.rels";
        }
      }

      if (this.img) {
        return this.img.optionsTransformer(options, docxtemplater);
      }

      return options;
    }
  }, {
    key: "preparse",
    value: function preparse(parsed, options) {
      var _this$W, _options$filePath;

      (_this$W = this.W)[_options$filePath = options.filePath] || (_this$W[_options$filePath] = widthCollector(this));
      var W = this.W[options.filePath];
      W.collect(parsed, options);
    }
  }, {
    key: "matchers",
    value: function matchers() {
      var _this = this;

      var onMatch = function onMatch() {
        if (!_this.styleManager) {
          _this.addStyles();
        }
      };

      return [[this.blockPrefix, moduleNameBlock, {
        onMatch: onMatch
      }], [this.prefix, moduleNameInline, {
        onMatch: onMatch
      }]];
    }
  }, {
    key: "postparse",
    value: function postparse(parsed, options) {
      var _this2 = this;

      parsed.forEach(function (part) {
        if (isStartingTag(part, "w:bookmarkStart")) {
          var id = getSingleAttribute(part.value, "w:id");
          _this2.minBookmarkId = Math.max(_this2.minBookmarkId, parseInt(id, 10));
        }
      });
      parsed = traits.expandToOne(parsed, {
        moduleName: moduleNameBlock,
        getInner: getInner,
        expandTo: "w:p"
      });
      parsed = traits.expandToOne(parsed, {
        moduleName: moduleNameInline,
        getInner: getInnerInline,
        expandTo: "w:r",
        postparse: options.postparse
      });
      return parsed;
    }
  }, {
    key: "resolve",
    value: function resolve(part, options) {
      var _this3 = this;

      this.filePath = options.filePath;

      if (part.type !== "placeholder" || [moduleNameBlock, moduleNameInline].indexOf(part.module) === -1) {
        return null;
      }

      var tagValue = options.scopeManager.getValue(part.value, {
        part: part
      });
      this.dpi = this.W[options.filePath].getDpi(part.lIndex);

      var _this$W$options$fileP = this.W[options.filePath].getDimensions(part, options),
          _this$W$options$fileP2 = _slicedToArray(_this$W$options$fileP, 2),
          containerWidth = _this$W$options$fileP2[0],
          containerHeight = _this$W$options$fileP2[1];

      part.containerWidth = containerWidth;
      part.containerHeight = containerHeight;
      this.containerWidth = containerWidth;
      var resolvedId = getResolvedId(part, options);
      return Promise.resolve(tagValue).then(function (tagValue) {
        if (!tagValue) {
          _this3.resolved[resolvedId] = {
            tagValue: tagValue,
            images: {}
          };
          return {
            value: ""
          };
        }

        var htmlT = new HtmlTransformer(_this3, options.filePath, part, options);
        htmlT.parse(tagValue);
        var imagePromises = [];
        var srcs = [];

        if (_this3.options.img) {
          tapRecursive(htmlT.handler.dom, function (el) {
            if (el.type === "tag" && el.name === "img") {
              var src = el.attribs.src;
              srcs.push(src);
              imagePromises.push(_this3.options.img.getValue ? _this3.options.img.getValue(el) : el.attribs.rc);
            }
          });
        }

        return Promise.all(imagePromises).then(function (images) {
          _this3.resolved[resolvedId] = {
            tagValue: tagValue,
            images: images.reduce(function (images, image, i) {
              images[srcs[i]] = image;
              return images;
            }, {})
          };
        });
      });
    }
  }, {
    key: "render",
    value: function render(part, options) {
      var _this4 = this;

      this.filePath = options.filePath;
      var expanded = part.expanded;

      if (part.tag === "w:sectPr") {
        this.columnNum = 0;
      }

      if (hasColumnBreak([part])) {
        this.columnNum++;
      }

      if (part.type !== "placeholder" || [moduleNameBlock, moduleNameInline].indexOf(part.module) === -1) {
        return null;
      }

      if (part.hasColumnBreak) {
        this.columnNum++;
      }

      part.renderColumnBreak = part.hasColumnBreak;
      var resolvedId = getResolvedId(part, options);
      var W = this.W[options.filePath];

      var _W$getDimensions = W.getDimensions(part, options),
          _W$getDimensions2 = _slicedToArray(_W$getDimensions, 2),
          containerWidth = _W$getDimensions2[0],
          containerHeight = _W$getDimensions2[1];

      part.containerWidth = containerWidth;
      part.containerHeight = containerHeight;
      this.containerWidth = containerWidth;
      var htmlData;

      if (this.resolved[resolvedId]) {
        var resolvedImages = get(this, ["resolved", resolvedId, "images"]);
        this.resolvedImages = resolvedImages;
        htmlData = this.resolved[resolvedId].tagValue;
      } else {
        this.resolvedImages = [];
        htmlData = options.scopeManager.getValue(part.value, {
          part: part
        });
      }

      if (!htmlData) {
        return {
          value: ""
        };
      }

      this.currentPageSize = pick(this.getNextWSect(expanded[0][0].lIndex), ["width", "leftMargin", "rightMargin", "cols"]);
      var isInline = part.module === moduleNameInline;
      this.dpi = W.getDpi(part.lIndex);
      var htmlT = new HtmlTransformer(this, options.filePath, part, options);
      htmlT.parse(htmlData);
      var tagStyleSheet = null;
      tapRecursive(htmlT.handler.dom, function (el) {
        if (el.type === "style" && el.name === "style") {
          var styleSheet = cssParser(getTextContent(el), {
            silent: _this4.options.ignoreCssErrors
          });

          if (!tagStyleSheet) {
            tagStyleSheet = styleSheet;
          } else {
            tagStyleSheet.stylesheet.rules = tagStyleSheet.stylesheet.rules.concat(styleSheet.stylesheet.rules);
          }
        }
      });
      htmlT.tagStyleSheet = tagStyleSheet;
      var run = getProperties(part.expanded[0], "w:r", isInline ? 0 : 1);
      var runProperties = getProperties(run, "w:rPr");
      var insideRPR = false;
      var paragraphRunProperties = [];
      var customProperties = getProperties(part.expanded[0], "w:pPr", 1).filter(function (p) {
        if (p.tag === "w:rPr" && p.position === "end") {
          insideRPR = false;
          return false;
        }

        if (insideRPR) {
          if (p.type !== "content") {
            paragraphRunProperties.push(p);
          }
        }

        if (p.tag === "w:rPr" && p.position === "start") {
          insideRPR = true;
        }

        return p.type !== "content" && !insideRPR;
      });
      var textualPartBefore = "";

      if (isInline) {
        textualPartBefore = getTextualPartBefore(part.expanded);
      }

      var transformer = isInline ? htmlT.transformInline.bind(htmlT) : htmlT.transformBlock.bind(htmlT);
      var value = transformer(runProperties, customProperties, paragraphRunProperties, part);
      return {
        value: textualPartBefore + value
      };
    }
  }]);

  return HtmlModule;
}();

module.exports = HtmlModule;