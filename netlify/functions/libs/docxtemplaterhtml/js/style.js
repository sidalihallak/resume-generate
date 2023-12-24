"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var cssParser = require("css/lib/parse/index.js");

var _require = require("lodash"),
    get = _require.get;

var _require2 = require("docxtemplater"),
    Errors = _require2.Errors;

var _require3 = require("./regex.js"),
    numberRegex = _require3.numberRegex,
    sizeRegex = _require3.sizeRegex;

var _require4 = require("./size-converter.js"),
    toDXA = _require4.toDXA,
    toPoint = _require4.toPoint;

var color = require("./color-parser.js");

var isValidColor = require("color-js").isValid;

var _require5 = require("./attributes.js"),
    getSingleAttribute = _require5.getSingleAttribute;

var borderStyles = ["dotted", "solid", "dashed", "double", "outset", "none", "inset"];
var listStyleToNumFmt = {
  "decimal-leading-zero": "decimalZero",
  decimal: "decimal",
  "lower-alpha": "lowerLetter",
  "lower-latin": "lowerLetter",
  "upper-alpha": "upperLetter",
  "upper-latin": "upperLetter",
  "lower-roman": "lowerRoman",
  "upper-roman": "upperRoman"
};

function directionHandler(values, str, functor) {
  if (values.length === 3) {
    functor({
      property: str.replace("*", "top"),
      value: values[0]
    });
    functor({
      property: str.replace("*", "right"),
      value: values[1]
    });
    functor({
      property: str.replace("*", "left"),
      value: values[1]
    });
    functor({
      property: str.replace("*", "bottom"),
      value: values[2]
    });
    return;
  }

  if (values.length === 4) {
    functor({
      property: str.replace("*", "top"),
      value: values[0]
    });
    functor({
      property: str.replace("*", "right"),
      value: values[1]
    });
    functor({
      property: str.replace("*", "bottom"),
      value: values[2]
    });
    functor({
      property: str.replace("*", "left"),
      value: values[3]
    });
    return;
  }

  if (values.length === 2) {
    functor({
      property: str.replace("*", "top"),
      value: values[0]
    });
    functor({
      property: str.replace("*", "bottom"),
      value: values[0]
    });
    functor({
      property: str.replace("*", "right"),
      value: values[1]
    });
    functor({
      property: str.replace("*", "left"),
      value: values[1]
    });
    return;
  }

  if (values.length === 1) {
    functor({
      property: str.replace("*", "top"),
      value: values[0]
    });
    functor({
      property: str.replace("*", "bottom"),
      value: values[0]
    });
    functor({
      property: str.replace("*", "right"),
      value: values[0]
    });
    functor({
      property: str.replace("*", "left"),
      value: values[0]
    });
    return;
  }
}

function getDeclarations(element, transformer, style) {
  style = style.replace(/&#58;/g, ":");

  try {
    return cssParser("body { ".concat(style, " }"), {
      silent: transformer.ignoreCssErrors
    }).stylesheet.rules[0].declarations;
  } catch (e) {
    var err = new Errors.RenderingError("Style for element cannot be parsed");
    err.properties = {
      explanation: "The tag ".concat(element.name, " contains invalid style properties"),
      name: element.name,
      style: style,
      id: "style_property_invalid"
    };
    throw err;
  }
}

function forEachStyleDeclaration(element, transformer, functor) {
  if (_typeof(element) !== "object") {
    throw new Error("Element in forEachStyleDeclaration should be an object, given ".concat(_typeof(element)));
  }

  var stdStyle = get(element, "attribs.style");
  var htmlStyle = get(element, "customProperties.htmlStyle");

  if (!stdStyle && !htmlStyle) {
    element.parsedStyle = [];
    return;
  }

  var declarations = [];

  if (element.parsedStyle) {
    declarations = element.parsedStyle;
  } else {
    if (stdStyle) {
      declarations = declarations.concat(getDeclarations(element, transformer, stdStyle));
    }

    if (htmlStyle) {
      declarations = declarations.concat(getDeclarations(element, transformer, htmlStyle));
    }

    declarations = declarations.filter(function (d) {
      return _typeof(d) === "object";
    });
  }

  element.parsedStyle = declarations; // eslint-disable-next-line complexity

  declarations.forEach(function (declaration) {
    var property = declaration.property,
        value = declaration.value;
    var values = value.split(/ +/);

    if (property === "padding") {
      directionHandler(values, "padding-*", functor);
    }

    if (property === "list-style") {
      if (listStyleToNumFmt[values[0]]) {
        functor({
          property: "list-style-type",
          value: values[0]
        });
      }

      if (listStyleToNumFmt[values[1]]) {
        functor({
          property: "list-style-type",
          value: values[1]
        });
      }

      if (listStyleToNumFmt[values[2]]) {
        functor({
          property: "list-style-type",
          value: values[2]
        });
      }
    }

    if (property === "margin") {
      directionHandler(values, "margin-*", functor);
    }

    if (property === "border-style") {
      functor({
        property: "border-style",
        value: value
      });
      directionHandler(values, "border-*-style", functor);
    }

    if (property === "border") {
      values.forEach(function (value) {
        if (borderStyles.indexOf(value) !== -1) {
          functor({
            property: "border-style",
            value: value
          });
          functor({
            property: "border-left-style",
            value: value
          });
          functor({
            property: "border-right-style",
            value: value
          });
          functor({
            property: "border-top-style",
            value: value
          });
          functor({
            property: "border-bottom-style",
            value: value
          });
          return;
        }

        if (sizeRegex.test(value)) {
          functor({
            property: "border-left-width",
            value: value
          });
          functor({
            property: "border-right-width",
            value: value
          });
          functor({
            property: "border-top-width",
            value: value
          });
          functor({
            property: "border-bottom-width",
            value: value
          });
          return;
        }

        if (isValidColor(value)) {
          functor({
            property: "border-color",
            value: value
          });
          functor({
            property: "border-left-color",
            value: value
          });
          functor({
            property: "border-right-color",
            value: value
          });
          functor({
            property: "border-top-color",
            value: value
          });
          functor({
            property: "border-bottom-color",
            value: value
          });
          return;
        }
      });
      return;
    }

    if (property === "border-width") {
      directionHandler(values, "border-*-width", functor);
    }

    if (property === "border-color") {
      if (isValidColor(value)) {
        functor({
          property: "border-color",
          value: value
        });
        functor({
          property: "border-left-color",
          value: value
        });
        functor({
          property: "border-right-color",
          value: value
        });
        functor({
          property: "border-top-color",
          value: value
        });
        functor({
          property: "border-bottom-color",
          value: value
        });
        return;
      }
    }

    if (property === "border-bottom") {
      values.forEach(function (value) {
        if (borderStyles.indexOf(value) !== -1) {
          functor({
            property: "border-bottom-style",
            value: value
          });
          return;
        }

        if (sizeRegex.test(value)) {
          functor({
            property: "border-bottom-width",
            value: value
          });
          return;
        }

        if (isValidColor(value)) {
          functor({
            property: "border-bottom-color",
            value: value
          });
          return;
        }
      });
      return;
    }

    if (property === "border-right") {
      values.forEach(function (value) {
        if (borderStyles.indexOf(value) !== -1) {
          functor({
            property: "border-right-style",
            value: value
          });
          return;
        }

        if (sizeRegex.test(value)) {
          functor({
            property: "border-right-width",
            value: value
          });
          return;
        }

        if (isValidColor(value)) {
          functor({
            property: "border-right-color",
            value: value
          });
          return;
        }
      });
      return;
    }

    if (property === "border-left") {
      values.forEach(function (value) {
        if (borderStyles.indexOf(value) !== -1) {
          functor({
            property: "border-left-style",
            value: value
          });
          return;
        }

        if (sizeRegex.test(value)) {
          functor({
            property: "border-left-width",
            value: value
          });
          return;
        }

        if (isValidColor(value)) {
          functor({
            property: "border-left-color",
            value: value
          });
          return;
        }
      });
      return;
    }

    if (property === "border-top") {
      values.forEach(function (value) {
        if (borderStyles.indexOf(value) !== -1) {
          functor({
            property: "border-top-style",
            value: value
          });
          return;
        }

        if (sizeRegex.test(value)) {
          functor({
            property: "border-top-width",
            value: value
          });
          return;
        }

        if (isValidColor(value)) {
          functor({
            property: "border-top-color",
            value: value
          });
          return;
        }
      });
      return;
    }

    functor(declaration);
  });
}

function addRunStyle(_ref) {
  var element = _ref.element,
      props = _ref.props,
      transformer = _ref.transformer;
  var name = element.name;

  if (!name) {
    return props;
  }

  var getXmlProperties = transformer.tagRepository.getXmlProperties;
  var xmlProperties = getXmlProperties(name);

  if (xmlProperties != null) {
    props = props.concat([xmlProperties]);
  } // eslint-disable-next-line complexity


  forEachStyleDeclaration(element, transformer, function (_ref2) {
    var property = _ref2.property,
        value = _ref2.value;

    if (property === "color") {
      props = props.concat([{
        type: "string",
        tag: "w:color",
        value: "<w:color w:val=\"".concat(color(value), "\"/>")
      }]);
    }

    if (property === "break-after" && value === "page") {
      props.push("break-page-after");
    }

    if (property === "break-before" && value === "page") {
      props.push("break-page-before");
    }

    if (property === "font-weight") {
      if (value === "bold" || value === "bolder") {
        props.push("bold");
      } else if (numberRegex.test(value)) {
        var number = parseInt(value, 10);

        if (number >= 700) {
          props.push("bold");
        }
      }
    }

    if (property === "font-size") {
      var point = toPoint(value, transformer);

      if (point != null) {
        var fontsize = Math.round(2 * point);
        props = props.concat([{
          type: "string",
          tag: "w:sz",
          value: "<w:sz w:val=\"".concat(fontsize, "\"/>")
        }, {
          type: "string",
          tag: "w:szCs",
          value: "<w:szCs w:val=\"".concat(fontsize, "\"/>")
        }]);
      }
    }

    if (property === "font-family") {
      value = value.split(",")[0].trim().replace(/^['"]/, "").replace(/['"]$/, "");

      if (value === "initial" || value === "inherit") {
        return;
      }

      if (value === "monospace") {
        value = "DejaVu Sans Mono";
      }

      if (value === "cursive") {
        value = "Brush Script";
      }

      if (value === "monospace") {
        value = "DejaVu Sans Mono";
      }

      if (value === "fantasy") {
        value = "DejaVu Sans Mono";
      }

      if (value === "serif") {
        value = "DejaVu Serif";
      }

      if (value === "sans-serif") {
        value = "DejaVu Sans";
      }

      props = props.concat([{
        type: "string",
        tag: "w:rFonts",
        value: "<w:rFonts w:ascii=\"".concat(value, "\" w:hAnsi=\"").concat(value, "\"/>")
      }]);
    }

    if (property === "background-color") {
      props = props.concat([{
        type: "string",
        value: "<w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"".concat(color(value), "\"/>")
      }]);
    }

    if (property === "text-decoration" && value === "underline") {
      props = props.concat("underline");
    }
  });
  return props;
} // eslint-disable-next-line complexity


function addParagraphStyle(_ref3) {
  var element = _ref3.element,
      transformer = _ref3.transformer,
      customProperties = _ref3.customProperties;
  var paragraphTypes = element.paragraphTypes;

  if (element.name === "p" && transformer.styleDefaults.paragraph) {
    var containsStyle = paragraphTypes.some(function (paragraphType) {
      return paragraphType.indexOf("<w:pStyle ") === 0;
    });

    if (!containsStyle) {
      paragraphTypes.push("<w:pStyle w:val=\"".concat(transformer.styleDefaults.paragraph, "\"/>"));
    }
  }

  var leftIndent = 0;
  var textIndent = 0;

  if (element.name === "blockquote") {
    paragraphTypes.push('<w:ind w:left="721"/>');
  }

  var align, before, after, lineHeight;
  /* eslint-disable-next-line complexity */

  forEachStyleDeclaration(element, transformer, function (_ref4) {
    var property = _ref4.property,
        value = _ref4.value;

    if (property === "background-color") {
      paragraphTypes.push("<w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"".concat(color(value), "\"/>"));
    }

    if (property === "text-align") {
      if (["center", "left", "right"].indexOf(value) !== -1) {
        align = value;
      }

      if (value === "justify") {
        align = "both";
      }
    }

    if (property === "padding-left") {
      var dxa = toDXA(value, transformer);

      if (dxa != null) {
        leftIndent += dxa;
      }
    }

    if (property === "margin-left") {
      var _dxa = toDXA(value, transformer);

      if (_dxa != null) {
        leftIndent += _dxa;
      }
    }

    if (property === "text-indent") {
      var _dxa2 = toDXA(value, transformer);

      if (_dxa2 != null) {
        textIndent += _dxa2;
      }
    }

    if (property === "margin-top") {
      var _dxa3 = toDXA(value, transformer);

      if (_dxa3 != null) {
        before = _dxa3;
      }
    }

    if (property === "margin-bottom") {
      var _dxa4 = toDXA(value, transformer);

      if (_dxa4 != null) {
        after = _dxa4;
      }
    }

    if (property === "line-height") {
      var _dxa5 = toDXA(value, transformer);

      if (_dxa5 != null) {
        lineHeight = _dxa5;
      }
    }
  });

  if (before != null || after != null) {
    (customProperties || []).forEach(function (_ref5) {
      var tag = _ref5.tag,
          value = _ref5.value;

      if (["w:spacing"].indexOf(tag) !== -1) {
        var beforeAttribute = getSingleAttribute(value, "w:before");
        var afterAttribute = getSingleAttribute(value, "w:after");
        before = before == null ? beforeAttribute : before;
        after = after == null ? afterAttribute : after;
      }
    });
    element.paragraphTypes.push("<w:spacing ".concat([before != null ? "w:before=\"".concat(before, "\"") : "", after != null ? "w:after=\"".concat(after, "\"") : "", lineHeight != null ? "w:line=\"".concat(lineHeight, "\"") : "", lineHeight != null ? 'w:lineRule="exact"' : ""].filter(function (f) {
      return f;
    }).join(" "), "/>"));
  }

  align || (align = get(element, "attribs.align"));

  if (align === "justify") {
    align = "both";
  }

  if (["center", "left", "right", "both"].indexOf(align) !== -1) {
    paragraphTypes.push("<w:jc w:val=\"".concat(align, "\"/>"));
  }

  if (leftIndent || textIndent) {
    paragraphTypes.push("<w:ind w:left=\"".concat(leftIndent, "\" w:right=\"0\" w:hanging=\"").concat(-textIndent, "\"/>"));
  }

  return paragraphTypes;
}

module.exports = {
  forEachStyleDeclaration: forEachStyleDeclaration,
  addRunStyle: addRunStyle,
  addParagraphStyle: addParagraphStyle,
  listStyleToNumFmt: listStyleToNumFmt
};