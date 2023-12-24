"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _require = require("lodash"),
    flattenDeep = _require.flattenDeep,
    get = _require.get,
    cloneDeep = _require.cloneDeep,
    isArray = _require.isArray,
    every = _require.every,
    reduceRight = _require.reduceRight;

var _require2 = require("./attributes.js"),
    getSingleAttribute = _require2.getSingleAttribute;

var utf8ToWord = require("docxtemplater").DocUtils.utf8ToWord;

var stringifyParagraphTypes = require("./stringify-paragraphtypes.js");

var _require3 = require("lodash"),
    merge = _require3.merge;

var _require4 = require("./whitespace.js"),
    isWhiteSpace = _require4.isWhiteSpace,
    startsWhiteSpace = _require4.startsWhiteSpace,
    endsWhiteSpace = _require4.endsWhiteSpace,
    clearWhitespace = _require4.clearWhitespace;

var _require5 = require("./structures.js"),
    runify = _require5.runify,
    paragraphify = _require5.paragraphify;

var _require6 = require("./style.js"),
    forEachStyleDeclaration = _require6.forEachStyleDeclaration;

var _require7 = require("./size-converter.js"),
    toDXA = _require7.toDXA;

var _require8 = require("./style.js"),
    addRunStyle = _require8.addRunStyle,
    addParagraphStyle = _require8.addParagraphStyle;

var _require9 = require("./html-utils.js"),
    getTextContent = _require9.getTextContent,
    isEndingText = _require9.isEndingText;

var handleImage = require("./image-handler.js");

var _require10 = require("./relation-utils.js"),
    addRelationship = _require10.addRelationship;

var _require11 = require("./tags.js"),
    attrs = _require11.attrs;

var getTable = require("./table.js");

var he = require("he");

var _require12 = require("./synonyms.js"),
    getSynonym = _require12.getSynonym;

var addCustomProperties = require("./add-custom-properties.js");

function htmlEscape(text) {
  return utf8ToWord(he.decode(text, {
    isAttributeValue: false
  })).replace(/‑/g, "</w:t><w:noBreakHyphen/><w:t>");
}

function runHandler(_ref) {
  var element = _ref.element,
      transformer = _ref.transformer;
  var name = element.name;

  switch (name) {
    case "br":
      return "<w:r><w:br/></w:r>";

    case "input":
      var type = get(element, "attribs.type");
      var value = get(element, "attribs.value");
      var checked = get(element, "attribs.checked") != null;

      if (type === "checkbox") {
        return "<w:sdt>\n\t\t\t\t\t<w:sdtPr>\n\t\t\t\t\t<w:id w:val=\"-1884711366\"/>\n\t\t\t\t\t<w14:checkbox>\n\t\t\t\t\t<w14:checked w14:val=\"0\"/>\n\t\t\t\t\t<w14:checkedState w14:val=\"2612\" w14:font=\"MS Gothic\"/>\n\t\t\t\t\t<w14:uncheckedState w14:val=\"2610\" w14:font=\"MS Gothic\"/>\n\t\t\t\t\t</w14:checkbox>\n\t\t\t\t\t</w:sdtPr>\n\t\t\t\t\t<w:sdtContent>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:rPr>\n\t\t\t\t\t<w:rFonts w:ascii=\"MS Gothic\" w:eastAsia=\"MS Gothic\" w:hAnsi=\"MS Gothic\" w:hint=\"eastAsia\"/>\n\t\t\t\t\t</w:rPr>\n\t\t\t\t\t<w:t>".concat(checked ? "☒" : "☐", "</w:t>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t</w:sdtContent>\n\t\t\t\t\t</w:sdt>");
      }

      if (type === "text") {
        var valuePart = "";

        if (value) {
          valuePart = "<w:r>\n\t\t\t\t\t<w:rPr>\n\t\t\t\t\t<w:rFonts w:hint=\"default\"/>\n\t\t\t\t\t<w:lang w:val=\"en\"/>\n\t\t\t\t\t</w:rPr>\n\t\t\t\t\t<w:t>".concat(htmlEscape(value), "</w:t>\n\t\t\t\t\t</w:r>");
        }

        return "<w:r>\n\t\t\t\t\t<w:fldChar w:fldCharType=\"begin\">\n\t\t\t\t\t<w:ffData>\n\t\t\t\t\t<w:name w:val=\"".concat(transformer.textinputcount++, "\"/>\n\t\t\t\t\t<w:enabled/>\n\t\t\t\t\t<w:calcOnExit w:val=\"0\"/>\n\t\t\t\t\t<w:textInput/>\n\t\t\t\t\t</w:ffData>\n\t\t\t\t\t</w:fldChar>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:instrText xml:space=\"preserve\">FORMTEXT</w:instrText>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:fldChar w:fldCharType=\"separate\"/>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:rPr>\n\t\t\t\t\t<w:rFonts w:hint=\"default\"/>\n\t\t\t\t\t<w:lang w:val=\"en-US\"/>\n\t\t\t\t\t</w:rPr>\n\t\t\t\t\t<w:t>     </w:t>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t").concat(valuePart, "\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:fldChar w:fldCharType=\"end\"/>\n\t\t\t\t\t</w:r>\n\t\t\t\t");
      }

      return "";
  }

  return null;
}

var tagHandlers = [{
  tag: "svg",
  functor: function functor(element, runProperties, transformer) {
    return runify(handleImage("svg", element, runProperties, transformer));
  },
  inRun: true
}, {
  tag: "img",
  functor: function functor(element, runProperties, transformer) {
    var displayStyle = "inline-block";
    var leftMargin = "";
    var rightMargin = "";
    forEachStyleDeclaration(element, transformer, function (_ref2) {
      var property = _ref2.property,
          value = _ref2.value;

      if (property === "display") {
        displayStyle = value;
      }

      if (property === "margin-left") {
        leftMargin = value;
      }

      if (property === "margin-right") {
        rightMargin = value;
      }
    });

    if (displayStyle === "block" && leftMargin === "auto" && rightMargin === "auto") {
      element.centered = true;
      return paragraphify(handleImage("img", element, runProperties, transformer));
    }

    return runify(handleImage("img", element, runProperties, transformer));
  },
  inRun: true
}, {
  tag: "link",
  functor: function functor(element, runProperties, transformer, props) {
    return runify(handleLink({
      element: element,
      runProperties: runProperties,
      transformer: transformer,
      props: props
    }));
  },
  inRun: true
}, {
  tag: "list-container",
  functor: function functor(element, runProperties, transformer) {
    return handleList(element, runProperties, transformer);
  }
}, {
  tag: "table",
  functor: function functor(element, runProperties, transformer, _, customProperties, paragraphRunProperties) {
    return paragraphify(getTable(element, runProperties, transformer, customProperties, paragraphRunProperties));
  }
}, {
  tag: "preformatted",
  functor: function functor(element, runProperties, transformer, props) {
    var pStyle = get(element, "customProperties.pStyle");
    var text = getTextContent(element);

    if (text[0] === "\n") {
      text = text.substr(1);
    }

    if (text[text.length - 1] === "\n") {
      text = text.substr(0, text.length - 1);
    }

    var childs = text.split("\n").map(function (text) {
      var run = runify(_getRElement(text, props, runProperties));

      run[0].calc = function (text) {
        return _getRElement(text, props, runProperties);
      };

      run[0].text = element.data;
      run[0].whitespace = isWhiteSpace(element.data);
      run[0].startsWhitespace = startsWhiteSpace(element.data);
      run[0].endsWhitespace = endsWhiteSpace(element.data);
      return run.map(function (r) {
        return r.data.replace(/<\/w:r>/, "<w:br/></w:r>");
      }).join("");
    }).join("");
    var parProps = pStyle ? "<w:pStyle w:val=\"".concat(pStyle, "\"/>") : "";
    return paragraphify("<w:p><w:pPr>".concat(parProps, "</w:pPr>").concat(childs, "</w:p>"));
  }
}];

function getRelationElement(element, props, runProperties, transformer) {
  var hasTag = transformer.tagRepository.hasTag;
  var name = element.name,
      type = element.type;

  if (!Array.isArray(runProperties)) {
    throw new Error("runProperties undefined, ".concat(_typeof(runProperties)));
  }

  if (type === "comment") {
    return [];
  }

  function handleChildren(element) {
    var result = element.children.map(function (children) {
      return getRelationElement(children, props, runProperties, transformer);
    });
    return flattenDeep(result);
  }

  function isIgnored(element) {
    if (!element.name) {
      return false;
    }

    if (transformer.tagRepository.isIgnored(element.name) || element.name === "br" && isEndingText(element, transformer.rootEl)) {
      return true;
    }

    return false;
  }

  if (isIgnored(element)) {
    return [];
  }

  if (name) {
    for (var i = 0, len = tagHandlers.length; i < len; i++) {
      var _tagHandlers$i = tagHandlers[i],
          tag = _tagHandlers$i.tag,
          functor = _tagHandlers$i.functor,
          inRun = _tagHandlers$i.inRun;

      if (inRun && hasTag(name, tag)) {
        return functor(element, runProperties, transformer, props);
      }
    }
  }

  if (element.data != null) {
    element.data = clearWhitespace(element.data);
    var run = runify(_getRElement(element.data, props, runProperties));

    run[0].calc = function (text) {
      return _getRElement(text, props, runProperties);
    };

    run[0].text = element.data;
    run[0].whitespace = isWhiteSpace(element.data);
    run[0].startsWhitespace = startsWhiteSpace(element.data);
    run[0].endsWhitespace = endsWhiteSpace(element.data);
    return run;
  }

  props = addRunStyle({
    element: element,
    props: props,
    transformer: transformer
  });

  if (element.children) {
    var result = runHandler({
      element: element,
      transformer: transformer,
      getRElement: _getRElement,
      props: props
    });

    if (result === null) {
      return handleChildren(element);
    }

    var _run = runify(result);

    return _run;
  }

  var error = new Error("Error while fetching getRelationElement");
  error.properties = {
    element: element
  };
  throw error;
}

function stringifyRunProps(props) {
  return props.map(function (prop) {
    if (!prop || prop === "break-page-after" || prop === "break-page-before") {
      return "";
    }

    if (prop.type === "string") {
      return prop;
    }

    return attrs[prop];
  }).filter(function (x) {
    return !!x;
  });
}

function deduplicateRunProps(runProperties) {
  var result = reduceRight(runProperties, function (result, _ref3) {
    var value = _ref3.value,
        tag = _ref3.tag,
        type = _ref3.type;

    if (type === "content") {
      result.runProperties = value + result.runProperties;
      return result;
    }

    if (result.seen.indexOf(tag) !== -1) {
      return result;
    }

    result.seen.push(tag);
    result.runProperties = value + result.runProperties;
    return result;
  }, {
    seen: [],
    runProperties: ""
  });
  return result.runProperties;
}

function _getRElement(text, props, runProperties) {
  if (isWhiteSpace(text)) {
    text = " ";
  }

  if (typeof runProperties === "string") {
    throw new Error("runProperties is not a string");
  }

  var stringified = stringifyRunProps(props);
  var breakAfter = props.indexOf("break-page-after") !== -1;
  var breakBefore = props.indexOf("break-page-before") !== -1;
  runProperties = deduplicateRunProps(runProperties.concat(stringified));
  return "<w:r>\n\t\t<w:rPr>\n\t\t".concat(runProperties, "\n\t\t</w:rPr>\n\t\t").concat(breakBefore ? '<w:br w:type="page"/>' : "", "\n\t\t<w:t xml:space=\"preserve\">").concat(htmlEscape(text), "</w:t>\n\t\t").concat(breakAfter ? '<w:br w:type="page"/>' : "", "\n\t\t</w:r>");
}

function handleLink(_ref4) {
  var element = _ref4.element,
      transformer = _ref4.transformer,
      runProperties = _ref4.runProperties,
      props = _ref4.props;
  var Name = get(element, "attribs.name", "");
  var bookmark = "";

  if (Name) {
    var bmId = transformer.minBookmarkId++;
    bookmark = "<w:bookmarkStart w:id=\"".concat(bmId, "\" w:name=\"").concat(Name, "\"/><w:bookmarkEnd w:id=\"").concat(bmId, "\"/>");
  }

  if (element.children.length === 0) {
    return bookmark;
  }

  var Target = get(element, "attribs.href", "");
  var hyperlinkStart;

  if (Target[0] === "#" && Target.length > 1) {
    hyperlinkStart = "<w:hyperlink w:anchor=\"".concat(Target.substr(1), "\" w:history=\"1\">");
  } else {
    var rId = addRelationship({
      Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
      Target: Target,
      TargetMode: "External"
    }, transformer.xmlDocuments[transformer.relsFilePath]);
    hyperlinkStart = "<w:hyperlink r:id=\"rId".concat(rId, "\">");
  }

  var newProps = [{
    type: "string",
    value: '<w:rStyle w:val="Hyperlink"/>'
  }].concat(props);
  var childs = element.children.map(function (child) {
    return getRelationElement(child, newProps, runProperties, transformer).map(function (r) {
      return r.data;
    }).join("");
  }).join("");
  return "".concat(hyperlinkStart, "\n\t").concat(bookmark, "\n\t").concat(childs, "\n\t</w:hyperlink>\n\t");
}

function addLiStyle(element, transformer) {
  var customProperties = element.customProperties;
  var paragraphTypes = [];
  var before, after;
  forEachStyleDeclaration(element, transformer, function (_ref5) {
    var property = _ref5.property,
        value = _ref5.value;

    if (property === "margin-top") {
      var dxa = toDXA(value, transformer);

      if (dxa != null) {
        before = dxa;
      }
    }

    if (property === "margin-bottom") {
      var _dxa = toDXA(value, transformer);

      if (_dxa != null) {
        after = _dxa;
      }
    }
  });

  if (before != null || after != null) {
    (customProperties || []).forEach(function (_ref6) {
      var tag = _ref6.tag,
          value = _ref6.value;

      if (["w:spacing"].indexOf(tag) !== -1) {
        var beforeAttribute = getSingleAttribute(value, "w:before");
        var afterAttribute = getSingleAttribute(value, "w:after");
        before = before == null ? beforeAttribute : before;
        after = after == null ? afterAttribute : after;
      }
    });
    paragraphTypes.push("<w:spacing ".concat([before != null ? "w:before=\"".concat(before, "\"") : "", after != null ? "w:after=\"".concat(after, "\"") : ""].filter(function (f) {
      return f;
    }).join(" "), "/>"));
  }

  return paragraphTypes;
}

function handleList(element, runProperties, transformer) {
  var tr = transformer.tagRepository;
  var hasTag = transformer.tagRepository.hasTag;
  transformer.listHandler.addListSupport(transformer);

  function commit(data) {
    if (data.currentGroup.length > 0) {
      data.groups.push({
        runs: cloneDeep(data.currentGroup),
        level: data.element.listLevel,
        num: data.num,
        name: data.element.name,
        customProperties: merge({}, data.element.customProperties, data.subElement.customProperties),
        paragraphTypes: data.paragraphTypes
      });
      data.currentGroup = [];
    }
  }

  function recursiveHandleList(element, data, currentLevel) {
    commit(data); // element : ul or ol

    if (element.name && hasTag(element.name, "list-container")) {
      element.listLevel = currentLevel;
      addCustomProperties(element, transformer);
      var num = transformer.listHandler.addList(element, transformer);
      element.children.forEach(function (c) {
        if (c.type === "comment") {
          return;
        }

        if (c.type === "text") {
          if (!isWhiteSpace(c.data)) {
            commit(data);
            var customProperties = addRunStyle({
              element: c,
              props: [],
              transformer: transformer
            });
            data.groups.push({
              childLess: true,
              runs: [getRelationElement(c, customProperties, runProperties, transformer)]
            });
          }

          return null;
        }

        addCustomProperties(c, transformer);
        data.num = num;
        commit(data);
        data.paragraphTypes = [];

        if (c.name && hasTag(c.name, "list-container")) {
          // c is <ul> or <ol>
          commit(data);
          recursiveHandleList(c, data, currentLevel + 1);
          return;
        }

        data.paragraphTypes = addLiStyle(c, transformer);
        data.subElement = c; // c is <li> most of the time (!= ul/ol)

        var lastWasContainerTag = true;

        function ignoredInsideList(cc) {
          if (cc.name === "br" && isEndingText(cc, cc.parent)) {
            // Ignore the last <br> within a paragraph, and also return an empty paragraph when using `<p><br></p>`
            return true;
          } // double child of <ul>/<ol>, usually it is child of <li>


          if (cc.type === "text" && isWhiteSpace(cc.data) && lastWasContainerTag) {
            return true;
          }
        }

        c.children.forEach(function (cc) {
          if (ignoredInsideList(cc)) {
            return;
          }

          if (cc.type === "text") {
            lastWasContainerTag = false;
          }

          if (cc.name && hasTag(cc.name, "list-container")) {
            lastWasContainerTag = true;
            commit(data);
            recursiveHandleList(cc, data, currentLevel + 1);
            return;
          }

          lastWasContainerTag = false;
          data.element = element;
          addCustomProperties(cc, transformer);
          cc.customProperties = cc.customProperties || {};
          cc.customProperties.htmlStyle = cc.customProperties.htmlStyle || "";

          if (c.customProperties && c.customProperties.htmlStyle) {
            cc.customProperties.htmlStyle += c.customProperties.htmlStyle;
          }

          var customProperties = addRunStyle({
            element: c,
            props: [],
            transformer: transformer
          });
          data.currentGroup.push(getRelationElement(cc, customProperties, runProperties, transformer));
        });
        data.num = num;
        commit(data);
      });
    }

    commit(data);
  }

  var data = {
    currentGroup: [],
    groups: [],
    elementName: null,
    numPerLevels: []
  };
  recursiveHandleList(element, data, 0);
  commit(data);
  return paragraphify(data.groups.map(function (_ref7) {
    var childLess = _ref7.childLess,
        runs = _ref7.runs,
        level = _ref7.level,
        name = _ref7.name,
        customProperties = _ref7.customProperties,
        num = _ref7.num,
        paragraphTypes = _ref7.paragraphTypes;

    if (childLess) {
      return "<w:p>\n\t\t\t\t\t".concat(flattenDeep(runs).map(function (_ref8) {
        var data = _ref8.data;
        return data;
      }).join(""), "\n\t\t\t\t\t\t</w:p>");
    }

    var parProps = stringifyParagraphTypes(paragraphTypes);
    var numPr = get(customProperties, "useNumPr", null);

    if (numPr == null) {
      numPr = tr.getNumPr(name);
    }

    var pStyle = get(customProperties, "pStyle");

    if (!pStyle) {
      pStyle = tr.getPStyle(name);

      if (isArray(pStyle)) {
        if (level >= pStyle.length) {
          level = pStyle.length - 1;
        }

        pStyle = pStyle[level];
      }

      pStyle = getSynonym(pStyle, transformer.synonyms);
    }

    if (isArray(pStyle)) {
      if (level >= pStyle.length) {
        level = pStyle.length - 1;
      }

      pStyle = pStyle[level];
    }

    if (pStyle.oneOf) {
      var chosenStyle = null;
      pStyle.oneOf.some(function (style) {
        if (typeof style === "string" && transformer.styleIds.indexOf(style) !== -1) {
          chosenStyle = style;
          return true;
        }

        if (typeof style === "string") {
          style = getSynonym(style, transformer.synonyms);

          if (transformer.styleIds.indexOf(style) !== -1) {
            chosenStyle = style;
            return true;
          }
        }

        if (_typeof(style) === "object" && style["default"]) {
          chosenStyle = transformer.styleDefaults[style["default"]];

          if (chosenStyle) {
            return true;
          }
        }

        return false;
      });
      pStyle = chosenStyle;
    }

    return "<w:p>\n\t\t<w:pPr>\n\t\t<w:pStyle w:val=\"".concat(pStyle, "\"/>\n\t\t").concat(numPr ? "<w:numPr>\n\t\t<w:ilvl w:val=\"".concat(level, "\"/>\n\t\t<w:numId w:val=\"").concat(num, "\"/>\n\t\t</w:numPr>") : "", "\n\t\t").concat(runProperties.length !== 0 ? "<w:rPr>".concat(deduplicateRunProps(runProperties), "</w:rPr>") : "<w:rPr/>", "\n\t\t").concat(parProps, "\n\t\t</w:pPr>\n\t\t").concat(flattenDeep(runs).map(function (_ref9) {
      var data = _ref9.data;
      return data;
    }).join(""), "\n\t\t</w:p>");
  }).join(""));
}

function getChildParagraphs(childs, element) {
  var currentRuns = [];
  var paragraphs = [];

  function addRuns() {
    if (currentRuns.length > 0) {
      if (!every(currentRuns, function (r) {
        return r.whitespace;
      })) {
        paragraphs.push({
          element: element,
          type: "paragraph",
          data: currentRuns
        });
      }

      currentRuns = [];
    }
  }

  childs.forEach(function (child) {
    if (child.type === "run") {
      currentRuns.push(child);
    }

    if (child.type === "paragraph") {
      addRuns();
      paragraphs.push(child);
    }
  });
  addRuns();
  return paragraphs;
}

function getParagraphs(_ref10) {
  var element = _ref10.element,
      level = _ref10.level,
      runProperties = _ref10.runProperties,
      props = _ref10.props,
      transformer = _ref10.transformer,
      customProperties = _ref10.customProperties,
      paragraphRunProperties = _ref10.paragraphRunProperties;
  var name = element.name,
      type = element.type;
  var _transformer$tagRepos = transformer.tagRepository,
      hasTag = _transformer$tagRepos.hasTag,
      isBlock = _transformer$tagRepos.isBlock,
      isIgnored = _transformer$tagRepos.isIgnored;

  if (!Array.isArray(runProperties)) {
    throw new Error("runProperties undefined, ".concat(_typeof(runProperties)));
  }

  if (type === "comment") {
    return [];
  }

  function handleChildren(element, props) {
    var result = element.children.map(function (children) {
      if (children.name === "br") {
        var ie = isEndingText(children, transformer.rootEl);

        if (ie) {
          // Ignore the last <br> within a paragraph, and also return an empty paragraph when using `<p><br></p>`
          return runify("");
        }
      }

      children.paragraphTypes = element.paragraphTypes;
      return getParagraphs({
        level: level + 1,
        customProperties: customProperties,
        element: children,
        props: props,
        runProperties: runProperties,
        transformer: transformer,
        paragraphRunProperties: paragraphRunProperties
      });
    }).filter(function (r) {
      return r;
    });
    return flattenDeep(result);
  }

  if (name) {
    if (isIgnored(name)) {
      return [];
    }

    addCustomProperties(element, transformer);
    props = addRunStyle({
      element: element,
      props: props,
      transformer: transformer
    });

    for (var i = 0, len = tagHandlers.length; i < len; i++) {
      var _tagHandlers$i2 = tagHandlers[i],
          tag = _tagHandlers$i2.tag,
          functor = _tagHandlers$i2.functor;

      if (hasTag(name, tag)) {
        return functor(element, runProperties, transformer, props, customProperties, paragraphRunProperties);
      }
    }

    if (isBlock(name)) {
      transformer.rootEl = element;
      element.paragraphTypes = cloneDeep(element.paragraphTypes || []);
      element.bookmark = get(element, "attribs.id", false);
      addParagraphStyle({
        element: element,
        transformer: transformer,
        customProperties: customProperties
      });
      var childs = handleChildren(element, props);
      return getChildParagraphs(childs, element);
    }
  } else {
    props = addRunStyle({
      element: element,
      props: props,
      transformer: transformer
    });
  }

  if (element.data != null) {
    element.data = clearWhitespace(element.data);

    var innerRun = _getRElement(element.data, props, runProperties);

    var run = runify(innerRun);

    run[0].calc = function (text) {
      return _getRElement(text, props, runProperties);
    };

    run[0].text = element.data;
    run[0].whitespace = isWhiteSpace(element.data);
    run[0].startsWhitespace = startsWhiteSpace(element.data);
    run[0].endsWhitespace = endsWhiteSpace(element.data);
    return run;
  }

  if (!element.children) {
    var error = new Error("Error while fetching getParagraphs, could not find children");
    error.properties = {
      element: element
    };
    throw error;
  }

  var data = runHandler({
    element: element,
    transformer: transformer,
    getRElement: function getRElement() {
      return runify(_getRElement.apply(_getRElement, arguments));
    },
    props: props
  });

  if (data === null) {
    return handleChildren(element, props);
  }

  return runify(data);
}

module.exports = {
  getParagraphs: getParagraphs,
  getRelationElement: getRelationElement
};