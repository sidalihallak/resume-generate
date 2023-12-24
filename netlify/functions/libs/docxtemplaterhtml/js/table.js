"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var tableCreator = require("./tablecreator.js");

var _require = require("lodash"),
    get = _require.get,
    times = _require.times,
    cloneDeep = _require.cloneDeep;

var _require2 = require("./style.js"),
    forEachStyleDeclaration = _require2.forEachStyleDeclaration,
    addRunStyle = _require2.addRunStyle;

var color = require("./color-parser.js");

var converter = require("./converter.js");

var _require3 = require("./regex.js"),
    percentRegex = _require3.percentRegex,
    numberRegex = _require3.numberRegex;

var _require4 = require("./size-converter.js"),
    toPixel = _require4.toPixel,
    toDXA = _require4.toDXA;

var addCustomProperties = require("./add-custom-properties.js");

var _require5 = require("./tags.js"),
    attrs = _require5.attrs;

var isValidColor = require("color-js").isValid;

function sum(ints) {
  return ints.reduce(function (sum, i) {
    return sum + i;
  }, 0);
}

function translateValign(vAlign) {
  if (vAlign === "middle") {
    return "center";
  }

  return vAlign;
}

function translateAlign(align) {
  if (align === "justify") {
    return "both";
  }

  return align;
}

function compare(a, b) {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  } // a must be equal to b


  return 0;
}

module.exports = function getTable(element, runProperties, transformer, customProperties, paragraphRunProperties) {
  var tableWidth,
      trIndex = 0,
      tdIndex = 0;
  var rowSpans = [];
  var defaultPadding = {
    left: 45
  };

  function getColsCount(tableParts) {
    return tableParts.reduce(function (max, row) {
      var sum = row.parts.reduce(function (sum, row) {
        return sum + (row.colspan || 1);
      }, 0);
      return Math.max(max, sum);
    }, 0);
  }

  function convert(input) {
    return converter.pixelToDXA(input, transformer.dpi);
  }

  function scaleWidths(widths, tableWidth) {
    var widthSum = sum(widths);

    if (widthSum !== tableWidth) {
      var ratio = tableWidth / widthSum;
      widths = widths.map(function (width) {
        return Math.floor(width * ratio);
      });
    }

    widthSum = sum(widths);

    if (widthSum !== tableWidth) {
      var points = tableWidth - widthSum;

      for (var i = 0; i < points; i++) {
        widths[i % widths.length]++;
      }
    }

    return widths;
  }

  function getTableWidth() {
    forEachStyleDeclaration(element, transformer, function (_ref) {
      var property = _ref.property,
          value = _ref.value;

      if (property === "width") {
        tableWidth = value;
      }
    });

    if (!tableWidth && element.attribs.width !== "0") {
      tableWidth = element.attribs.width;
    }

    if (numberRegex.test(tableWidth)) {
      tableWidth += "px";
    }

    if (percentRegex.test(tableWidth)) {
      var percent = parseFloat(tableWidth.substr(0, tableWidth.length - 1));
      tableWidth = convert(parseFloat(percent / 100 * transformer.containerWidth, 10));
    } else {
      var dxa = toDXA(tableWidth, transformer);

      if (dxa != null) {
        tableWidth = dxa;
      } else {
        return null;
      }
    }

    return tableWidth;
  } // eslint-disable-next-line complexity


  function getWidths(tableParts) {
    var rows = tableParts.length;
    var colCount = getColsCount(tableParts);
    var rowsFinished = 0,
        col = 0;
    var colOffset = times(rows, function () {
      return 0;
    });
    var widths = [];
    var defaultWidths = {};
    var absoluteWidths = {};
    tableWidth = getTableWidth();
    var defaultTableWidth = false;

    if (tableWidth == null) {
      defaultTableWidth = true;
      tableWidth = toDXA("450px", transformer);
    }

    while (rowsFinished < rows) {
      for (var i = 0; i < rows; i++) {
        var row = tableParts[i].parts;

        if (col === row.length) {
          rowsFinished++;
        }

        var cell = row[col];

        if (cell) {
          if (cell.colspan > 1) {
            colOffset[i] += cell.colspan - 1;
          }

          if (cell.width && cell.colspan === 1) {
            if (typeof cell.width === "string") {
              defaultWidths[col] = true;
              widths[col + colOffset[i]] = parseInt(tableWidth * parseInt(cell.width, 10) / 100, 10);
            } else {
              widths[col + colOffset[i]] = convert(cell.width);
              absoluteWidths[col + colOffset[i]] = true;
            }
          }
        }
      }

      if (rowsFinished === rows) {
        break;
      }

      if (!widths[col]) {
        defaultWidths[col] = true;
        widths[col] = Math.round(tableWidth / colCount);
      }

      col++;
    }

    if (Object.keys(absoluteWidths).length === 0) {
      return scaleWidths(widths, tableWidth);
    }

    if (defaultTableWidth) {
      var sumWidths = sum(widths);

      if (Object.keys(defaultWidths).length === 0) {
        tableWidth = sumWidths;
      } else {
        tableWidth = sumWidths * Object.keys(defaultWidths).length / widths.length;
        return widths;
      }
    }

    return scaleWidths(widths, tableWidth);
  }

  function calculateWidth(tableParts) {
    var widths = getWidths(tableParts);
    var rows = tableParts.length;
    var rowsFinished = 0,
        col = 0;
    var colOffset = times(rows, function () {
      return 0;
    });

    while (rowsFinished < rows) {
      for (var i = 0; i < rows; i++) {
        var row = tableParts[i].parts;

        if (col === row.length) {
          rowsFinished++;
        }

        var cell = row[col];

        if (cell) {
          if (cell.empty) {
            continue;
          }

          var colspan = cell.colspan;
          var totalWidth = 0;

          for (var j = 0; j < colspan; j++) {
            if (widths[col + j + colOffset[i]]) {
              totalWidth += widths[col + j + colOffset[i]];
            }
          }

          cell.width = totalWidth;
          cell.element.calculatedWidth = cell.width;
          colOffset[i] += colspan - 1;
        }
      }

      col++;
    }
  }

  function getTd(element, customProperties) {
    var colspan = parseInt(get(element, "attribs.colspan", 1), 10);
    var rowspan = parseInt(get(element, "attribs.rowspan", 1), 10);
    var bgColor;
    var align;
    var tdWidth;
    var vAlign;
    var borderColor;
    var border = {
      top: {},
      right: {},
      bottom: {},
      left: {}
    };
    var padding = cloneDeep(defaultPadding);
    customProperties = cloneDeep(customProperties);
    var newRunProperties = cloneDeep(runProperties);
    addCustomProperties(element, transformer);
    forEachStyleDeclaration(element, transformer,
    /* eslint-disable-next-line complexity */
    function (_ref2) {
      var property = _ref2.property,
          value = _ref2.value;

      if (property === "background-color") {
        bgColor = color(value);
      }

      if (property === "background") {
        bgColor = color(value.split(" ")[0]);
      }

      if (property === "width") {
        if (percentRegex.test(value)) {
          tdWidth = value;
        } else {
          var px = toPixel(value, transformer);

          if (px != null) {
            tdWidth = px;
          }
        }
      }

      if (property === "vertical-align" && ["top", "center", "bottom", "middle"].indexOf(value)) {
        vAlign = value;
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
        padding.left = toDXA(value, transformer);
      }

      if (property === "padding-right") {
        padding.right = toDXA(value, transformer);
      }

      if (property === "padding-top") {
        padding.top = toDXA(value, transformer);
      }

      if (property === "padding-bottom") {
        padding.bottom = toDXA(value, transformer);
      }

      function translateBorderStyle(val) {
        if (val === "solid") {
          return "single";
        }

        return val;
      }

      if (property === "border-top-style") {
        border.top.style = translateBorderStyle(value);
      }

      if (property === "border-bottom-style") {
        border.bottom.style = translateBorderStyle(value);
      }

      if (property === "border-right-style") {
        border.right.style = translateBorderStyle(value);
      }

      if (property === "border-left-style") {
        border.left.style = translateBorderStyle(value);
      }

      if (property === "border-top-width") {
        var _px = toPixel(value, transformer);

        if (_px != null) {
          border.top.sz = _px * 2;
        }
      }

      if (property === "border-bottom-width") {
        var _px2 = toPixel(value, transformer);

        if (_px2 != null) {
          border.bottom.sz = _px2 * 2;
        }
      }

      if (property === "border-right-width") {
        var _px3 = toPixel(value, transformer);

        if (_px3 != null) {
          border.right.sz = _px3 * 2;
        }
      }

      if (property === "border-left-width") {
        var _px4 = toPixel(value, transformer);

        if (_px4 != null) {
          border.left.sz = _px4 * 2;
        }
      }

      if (property === "border-top-color" && isValidColor(value)) {
        border.top.color = color(value);
      }

      if (property === "border-bottom-color" && isValidColor(value)) {
        border.bottom.color = color(value);
      }

      if (property === "border-right-color" && isValidColor(value)) {
        border.right.color = color(value);
      }

      if (property === "border-left-color" && isValidColor(value)) {
        border.left.color = color(value);
      }

      if (property === "border-color") {
        borderColor = color(value);
      }
    });

    if (!tdWidth) {
      tdWidth = get(element, "attribs.width", null);

      if (tdWidth) {
        tdWidth = parseInt(tdWidth, 10);
      }
    }

    var pStyle = get(element, "customProperties.pStyle");

    if (pStyle) {
      customProperties.push({
        type: "tag",
        position: "selfclosing",
        text: false,
        value: "<w:pStyle w:val=\"".concat(pStyle, "\"/>"),
        tag: "w:pStyle"
      });
    }

    vAlign || (vAlign = get(element, "attribs.valign"));
    vAlign = translateValign(vAlign);
    var bgAttribute = get(element, "attribs.bgcolor");

    if (bgAttribute && !bgColor) {
      bgColor = color(bgAttribute);
    }

    align || (align = get(element, "attribs.align"));
    align = translateAlign(align);

    if (align && ["center", "left", "right", "both"].indexOf(align) !== -1) {
      customProperties.unshift({
        type: "tag",
        tag: "w:jc",
        value: "<w:jc w:val=\"".concat(align, "\"/>")
      });
    }

    customProperties = addRunStyle({
      element: element,
      props: customProperties,
      transformer: transformer
    });
    customProperties.forEach(function (input) {
      var tag, value;

      if (typeof input === "string") {
        tag = attrs[input].tag;
        value = attrs[input].value;
      } else {
        tag = input.tag;
        value = input.value;
      }

      if (["w:sz", "w:szCs", "w:color", "w:b", "w:jc"].indexOf(tag) !== -1) {
        newRunProperties.push({
          tag: tag,
          value: value
        });
      }
    });
    var value = {
      width: tdWidth,
      newRunProperties: newRunProperties,
      customProperties: customProperties,
      colspan: colspan,
      rowspan: rowspan,
      vAlign: vAlign,
      align: align,
      padding: padding,
      element: element,
      bgColor: bgColor,
      borderColor: borderColor,
      border: border
    };

    if (rowspan > 1) {
      rowSpans.push({
        trIndex: trIndex,
        tdIndex: tdIndex,
        height: rowspan - 1,
        value: value
      });
    }

    tdIndex += colspan;
    return value;
  }

  function getVMergeTd(value) {
    tdIndex += value.colspan;
    return _objectSpread(_objectSpread({}, value), {}, {
      content: "",
      vMerge: "continue"
    });
  }

  function getEmptyTd() {
    tdIndex += 1;
    return {
      content: "",
      empty: true
    };
  }

  function getBody(element, customProperties) {
    customProperties = cloneDeep(customProperties);
    customProperties = addRunStyle({
      element: element,
      props: customProperties,
      transformer: transformer
    });
    return element.children.filter(function (children) {
      var hasTd = children.children ? children.children.some(function (c) {
        return c.type === "tag";
      }) : false;
      return children.type === "tag" && children.name === "tr" && hasTd;
    }).map(function (children) {
      return getTr(children, customProperties);
    });
  }

  function getTr(element, customProperties) {
    tdIndex = 0;
    var bgColor;
    addCustomProperties(element, transformer);
    forEachStyleDeclaration(element, transformer, function (_ref3) {
      var property = _ref3.property,
          value = _ref3.value;

      if (property === "background-color") {
        bgColor = color(value);
      }

      if (property === "background") {
        bgColor = color(value.split(" ")[0]);
      }
    });
    var bgAttribute = get(element, "attribs.bgcolor");

    if (bgAttribute && !bgColor) {
      bgColor = color(bgAttribute);
    }

    customProperties = cloneDeep(customProperties);
    customProperties = addRunStyle({
      element: element,
      props: customProperties,
      transformer: transformer
    });
    var fakeCells = [];
    rowSpans.forEach(function (rowSpan) {
      if (rowSpan.trIndex < trIndex && trIndex <= rowSpan.trIndex + rowSpan.height) {
        fakeCells.push({
          index: rowSpan.tdIndex,
          value: rowSpan.value
        });
      }
    });
    fakeCells.sort(function (c1, c2) {
      if (c1.index === c2.index) {
        return 0;
      }

      return c1.index > c2.index ? 1 : -1;
    });
    var interestingChilds = element.children.filter(function (children) {
      return children.type !== "text" && ["td", "th"].indexOf(children.name) !== -1;
    });
    var parts = interestingChilds.reduce(function (parts, children, i, all) {
      fakeCells.forEach(function (fakeCell) {
        if (fakeCell.index === tdIndex) {
          parts.push(getVMergeTd(fakeCell.value));
        }
      });
      var value = getTd(children, customProperties);

      if (bgColor && !value.bgColor) {
        value.bgColor = bgColor;
      }

      parts.push(value);

      if (all.length - 1 === i) {
        fakeCells.forEach(function (fakeCell) {
          if (fakeCell.index === tdIndex) {
            parts.push(getVMergeTd(fakeCell.value));
          }
        });
      }

      return parts;
    }, []);

    if (interestingChilds.length === 0) {
      parts.push(getEmptyTd());
    }

    trIndex++;
    return {
      parts: parts,
      repeatHeaderRow: get(element, "customProperties.repeatHeaderRow"),
      cantSplit: get(element, "customProperties.cantSplit")
    };
  }

  var border = null;
  var defaultBorder = get(element, "customProperties.defaultBorder", {
    size: 2,
    color: "000001",
    type: "all"
  });
  var bgColor;
  forEachStyleDeclaration(element, transformer, function (_ref4) {
    var property = _ref4.property,
        value = _ref4.value;

    if (property === "border-style" && value === "none") {
      border || (border = defaultBorder);
      border.type = "none";
    }

    if (property === "background-color") {
      bgColor = color(value);
    }

    if (property === "background") {
      bgColor = color(value.split(" ")[0]);
    }
  });
  border || (border = defaultBorder);

  if (element.attribs.bordercolor) {
    border.color = color(element.attribs.bordercolor);
  }

  if (element.attribs.cellpadding) {
    var val = toDXA(element.attribs.cellpadding + "px", transformer);
    defaultPadding.top = val;
    defaultPadding.left = val;
    defaultPadding.right = val;
    defaultPadding.bottom = val;
  }

  var colGridSum = [];
  var bgAttribute = get(element, "attribs.bgcolor");

  if (bgAttribute && !bgColor) {
    bgColor = color(bgAttribute);
  }

  var tableParts = element.children.reduce(function (tableParts, children) {
    var newCustomProperties = cloneDeep(customProperties);

    if (children.type === "text") {
      return tableParts;
    }

    if (children.name === "tr") {
      tableParts.push(getTr(children, newCustomProperties));
      return tableParts;
    }

    if (["tbody", "thead", "tfoot"].indexOf(children.name) !== -1) {
      newCustomProperties = cloneDeep(newCustomProperties);
      newCustomProperties = addRunStyle({
        element: element,
        props: newCustomProperties,
        transformer: transformer
      });
      return tableParts.concat(getBody(children, newCustomProperties));
    }

    return tableParts;
  }, []);
  tableParts.forEach(function (tr) {
    tr.parts.forEach(function (td) {
      td.bgColor || (td.bgColor = bgColor);
    });
  });
  calculateWidth(tableParts);
  tableParts.forEach(function (rows) {
    var currentSum = 0;
    rows.parts.forEach(function (_ref5) {
      var width = _ref5.width;
      currentSum += width;

      if (colGridSum.indexOf(currentSum) === -1) {
        colGridSum.push(currentSum);
      }
    });
  });
  colGridSum.sort(compare);
  tableParts.forEach(function (rows) {
    var currentSum = 0;
    rows.parts.forEach(function (element) {
      var width = element.width;
      var startIndex;

      if (currentSum === 0) {
        startIndex = -1;
      } else {
        startIndex = colGridSum.indexOf(currentSum);
      }

      currentSum += width;
      var endIndex = colGridSum.indexOf(currentSum);
      element.colspan = endIndex - startIndex;

      if (element.colspan === 1) {
        delete element.colspan;
      }
    });
  });
  tableParts.forEach(function (tdParts) {
    tdParts.parts.forEach(function (tc) {
      if (tc.empty === true) {
        return;
      }

      tc.content = transformer.getBlockContent(tc.element.children, tc.newRunProperties, tc.customProperties, paragraphRunProperties);
    });
  });
  var colGrid = colGridSum.map(function (value, i) {
    var last = i === 0 ? 0 : colGridSum[i - 1];
    return value - last;
  });
  var leftAuto = false,
      rightAuto = false;
  var tableAlign = element.attribs.align;
  var margin = {};
  var layout = "";
  forEachStyleDeclaration(element, transformer, function (_ref6) {
    var property = _ref6.property,
        value = _ref6.value;

    if (property === "margin-left" && value === "auto") {
      leftAuto = true;
    }

    if (property === "margin-left") {
      var dxa = toDXA(value, transformer);

      if (dxa != null) {
        margin.left = dxa;
      }
    }

    if (property === "margin-right" && value === "auto") {
      rightAuto = true;
    }

    if (property === "table-layout" && value === "fixed") {
      layout = "fixed";
    }
  });

  if (!tableAlign) {
    if (leftAuto) {
      if (rightAuto) {
        tableAlign = "center";
      } else {
        tableAlign = "right";
      }
    }
  }

  if (!tableAlign) {
    tableAlign = "left";
  }

  var table = {
    margin: margin,
    data: tableParts,
    alignment: tableAlign,
    layout: layout,
    border: border,
    colGrid: colGrid,
    width: tableWidth
  };
  return tableCreator(table, element, transformer);
};