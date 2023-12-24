"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("lodash"),
    map = _require.map;

function paragraph(text) {
  return text.content;
}

var defaultLeftMargin = 47; // eslint-disable-next-line complexity

function getBorder(border, borderProps) {
  if (border == null) {
    return "";
  }

  if (border === "none" || border.type === "none") {
    return "<w:tcBorders>\n<w:top w:val=\"nil\"/>\n<w:left w:val=\"nil\"/>\n<w:bottom w:val=\"nil\"/>\n<w:right w:val=\"nil\"/>\n<w:insideH w:val=\"nil\"/>\n<w:insideV w:val=\"nil\"/>\n</w:tcBorders>";
  }

  border.size || (border.size = 4);
  border.color || (border.color = "000000");
  border.val = "single";
  return "<w:tcBorders>\n\t\t<w:top w:val=\"".concat(borderProps.top.style || border.val, "\" w:sz=\"").concat(borderProps.top.sz || border.size, "\" w:space=\"0\" w:color=\"").concat(borderProps.top.color || border.color, "\"/>\n\t\t<w:left w:val=\"").concat(borderProps.left.style || border.val, "\" w:sz=\"").concat(borderProps.left.sz || border.size, "\" w:space=\"0\" w:color=\"").concat(borderProps.left.color || border.color, "\"/>\n\t\t<w:bottom w:val=\"").concat(borderProps.bottom.style || border.val, "\" w:sz=\"").concat(borderProps.bottom.sz || border.size, "\" w:space=\"0\" w:color=\"").concat(borderProps.bottom.color || border.color, "\"/>\n\t\t<w:right w:val=\"").concat(borderProps.right.style || border.val, "\" w:sz=\"").concat(borderProps.right.sz || border.size, "\" w:space=\"0\" w:color=\"").concat(borderProps.right.color || border.color, "\"/>\n\t\t<w:insideH w:val=\"").concat(border.val, "\" w:sz=\"").concat(border.size, "\" w:space=\"0\" w:color=\"").concat(border.color, "\"/>\n\t\t<w:insideV w:val=\"").concat(border.val, "\" w:sz=\"").concat(border.size, "\" w:space=\"0\" w:color=\"").concat(border.color, "\"/>\n\t</w:tcBorders>");
}

module.exports = function table(table, element) {
  function tr(row) {
    var trProps = [];

    if (row.repeatHeaderRow) {
      trProps.push("<w:tblHeader/>");
    }

    if (row.cantSplit) {
      trProps.push("<w:cantSplit/>");
    }

    return "<w:tr>\n\t\t".concat(trProps.length > 0 ? "<w:trPr>".concat(trProps.join(""), "</w:trPr>") : "<w:trPr/>", "\n\t\t").concat(row.parts.map(tc.bind(null)).join("\n"), "\n\t\t</w:tr>");
  }

  if (table.data.length === 0 || table.data.length === 1 && table.data[0].length === 1 && table.data[0][0].empty === true) {
    return "";
  }

  function tc(element) {
    var empty = element.empty,
        colspan = element.colspan,
        rowspan = element.rowspan,
        bgColor = element.bgColor,
        width = element.width,
        vAlign = element.vAlign,
        borderColor = element.borderColor,
        padding = element.padding,
        borderProps = element.border;

    if (empty === true) {
      return "<w:tc>\n\t\t\t<w:tcPr>\n\t\t\t</w:tcPr>\n\t\t\t<w:p>\n\t\t\t<w:r>\n\t\t\t<w:t></w:t>\n\t\t\t</w:r>\n\t\t\t</w:p>\n\t\t\t</w:tc>";
    }

    var border = table.border;

    if (borderColor && typeof table.border !== "string") {
      border = _objectSpread(_objectSpread({}, table.border), {}, {
        color: borderColor
      });
    }

    var gridSpan = colspan ? "<w:gridSpan w:val=\"".concat(colspan, "\"/>") : "";
    var vMerge = element.vMerge;

    if (vMerge === "continue") {
      return "<w:tc>\n\t\t\t<w:tcPr>\n\t\t\t".concat(getBorder(border, borderProps), "\n\t\t\t").concat(gridSpan, "\n\t\t\t<w:vMerge w:val=\"continue\"/>\n\t\t\t</w:tcPr>\n\t\t\t<w:p>\n\t\t\t<w:pPr>\n\t\t\t<w:rPr/>\n\t\t\t</w:pPr>\n\t\t\t<w:r>\n\t\t\t<w:rPr/>\n\t\t\t</w:r>\n\t\t\t</w:p>\n\t\t\t</w:tc>");
    }

    var tcMarContent;

    if (Object.keys(padding).length > 0) {
      tcMarContent = map(padding, function (value, key) {
        return "<w:".concat(key, " w:w=\"").concat(value, "\" w:type=\"dxa\"/>");
      }).join("");
    } else {
      tcMarContent = '<w:left w:w="45" w:type="dxa"/>';
    }

    var wtcMar = "<w:tcMar>".concat(tcMarContent, "</w:tcMar>");
    vMerge = rowspan > 1 ? '<w:vMerge w:val="restart"/>' : "";
    var wvAlign = vAlign ? "<w:vAlign w:val=\"".concat(vAlign, "\"/>") : "";
    var wshd = bgColor ? "<w:shd w:val=\"clear\" w:color=\"".concat(bgColor, "\" w:fill=\"").concat(bgColor, "\"/>") : '<w:shd w:fill="auto" w:val="clear"/>';
    var paragraphContent = paragraph(element);

    if (paragraphContent.indexOf("<w:p") === -1) {
      paragraphContent = "<w:p><w:r><w:t></w:t></w:r></w:p>";
    }

    return "\n\t\t\t<w:tc>\n\t\t\t<w:tcPr>\n\t\t\t<w:tcW w:w=\"".concat(width, "\" w:type=\"dxa\"/>\n\t\t\t").concat(getBorder(border, borderProps), "\n\t\t\t").concat(gridSpan, "\n\t\t\t").concat(vMerge, "\n\t\t\t").concat(wshd, "\n\t\t\t").concat(wvAlign, "\n\t\t\t").concat(wtcMar, "\n\t\t\t</w:tcPr>\n\t\t\t").concat(paragraphContent, "\n\t\t\t</w:tc>\n\t\t\t");
  }

  var _table = table,
      data = _table.data,
      colGrid = _table.colGrid;
  var wtblGrid = colGrid.map(function (width) {
    return "<w:gridCol w:w=\"".concat(width, "\"/>");
  }).join("");
  var props = [];

  if (element.customProperties) {
    props = Object.keys(element.customProperties).reduce(function (props, key) {
      if (key === "tblStyle") {
        props.push("<w:".concat(key, " w:val=\"").concat(element.customProperties[key], "\"/>"));
      }

      return props;
    }, []);
  }

  var leftMargin = table.margin.left == null ? defaultLeftMargin : table.margin.left;
  var fixed = table.layout === "fixed";
  var value = "\n    <w:tbl>\n      <w:tblPr>\n        ".concat(props.join(""), "\n        <w:tblW w:w=\"").concat(table.width, "\" w:type=\"dxa\"/>\n        <w:jc w:val=\"").concat(table.alignment, "\"/>\n        <w:tblInd w:w=\"").concat(leftMargin, "\" w:type=\"dxa\"/>\n        ").concat(fixed ? '<w:tblLayout w:type="fixed"/>' : "", "\n        <w:tblCellMar>\n          <w:top w:w=\"55\" w:type=\"dxa\"/>\n          <w:left w:w=\"45\" w:type=\"dxa\"/>\n          <w:bottom w:w=\"55\" w:type=\"dxa\"/>\n          <w:right w:w=\"55\" w:type=\"dxa\"/>\n        </w:tblCellMar>\n      </w:tblPr>\n      <w:tblGrid>\n      ").concat(wtblGrid, "\n      </w:tblGrid>\n      ").concat(data.map(tr).join("\n"), "\n    </w:tbl>\n\t<w:p>\n\t<w:pPr>\n\t<w:pStyle w:val=\"Normal\"/>\n\t<w:spacing w:before=\"0\" w:after=\"200\"/>\n\t<w:rPr/>\n\t</w:pPr>\n\t<w:r>\n\t<w:rPr/>\n\t</w:r>\n\t</w:p>\n    ");
  return value;
};