"use strict";

var _require = require("./tag.js"),
	isStartingTag = _require.isStartingTag,
	isEndingTag = _require.isEndingTag;

var _require2 = require("./content-types.js"),
	mainContentType = _require2.mainContentType,
	headerContentType = _require2.headerContentType,
	footerContentType = _require2.footerContentType;

var RelsManager = require("./relationship-manager.js");

var normalizePath = require("./normalize-path.js");

var _require3 = require("./size-converter.js"),
	toPixel = _require3.toPixel;

var _require4 = require("./attributes.js"),
	getAttributes = _require4.getAttributes,
	getAttribute = _require4.getAttribute,
	getSingleAttribute = _require4.getSingleAttribute;

var converter = require("./converter.js");

function collectSectionsWidth(parsed, mainRels, sections) {
	var section = null;

	for (var i = 0; i < parsed.length; i++) {
		var part = parsed[i];

		if (isStartingTag(part, "w:sectPr")) {
			section = [];
		}

		if (section) {
			section.push(part);
		}

		if (isEndingTag(part, "w:sectPr")) {
			(function () {
				var content = section.map(function (_ref) {
					var value = _ref.value;
					return value;
				}).join("");
				var width = parseInt(getAttribute(section, "w:pgSz", "w:w"), 10);
				var height = parseInt(getAttribute(section, "w:pgSz", "w:h"), 10);
				var leftMargin = parseInt(getAttribute(section, "w:pgMar", "w:left"), 10);
				var rightMargin = parseInt(getAttribute(section, "w:pgMar", "w:right"), 10);
				var headerRefs = getAttributes(section, "w:headerReference", "r:id");
				var footerRefs = getAttributes(section, "w:footerReference", "r:id");
				var headerFiles = [],
					footerFiles = [];
				headerRefs.forEach(function (ref) {
					var rel = mainRels.getRelationship(ref);
					headerFiles.push(normalizePath(rel.getAttribute("Target"), mainRels.dirname));
				});
				footerRefs.forEach(function (ref) {
					var rel = mainRels.getRelationship(ref);
					footerFiles.push(normalizePath(rel.getAttribute("Target"), mainRels.dirname));
				});
				var cols = parseInt(getAttribute(section, "w:cols", "w:num"), 10) || 1;
				var colsWidth = getAttributes(section, "w:col", "w:w");

				if (colsWidth.length === 0) {
					var calculatedWidth = (width - leftMargin - rightMargin) / cols;

					for (var _i = 0; _i < cols; _i++) {
						colsWidth.push(calculatedWidth);
					}
				}

				sections.push({
					xmlContent: content,
					lIndex: section[0].lIndex,
					parsed: section,
					cols: cols,
					colsWidth: colsWidth,
					width: width,
					height: height,
					leftMargin: leftMargin,
					rightMargin: rightMargin,
					part: part,
					headerFiles: headerFiles,
					footerFiles: footerFiles
				});
				section = null;
			})();
		}
	}
}

function collectCellsWidth(parsed) {
	var cells = [];
	var inCell = false;
	var width = 0;
	var startLIndex;

	for (var i = 0; i < parsed.length; i++) {
		var part = parsed[i];

		if (isStartingTag(part, "w:tc")) {
			inCell = true;
			width = 0;
			startLIndex = part.lIndex;
		}

		if (inCell && isStartingTag(part, "w:tcW")) {
			width = parseInt(getSingleAttribute(part.value, "w:w"), 10);
		}

		if (isEndingTag(part, "w:tc")) {
			inCell = false;
			cells.push({
				width: width,
				startLIndex: startLIndex,
				endLIndex: part.lIndex
			});
		}
	}

	return cells;
}

function collectPicts(parsed) {
	var picts = [];
	var inPict = false;
	var width = 0,
		height = 0;
	var startLIndex;

	for (var i = 0; i < parsed.length; i++) {
		var part = parsed[i];

		if (isStartingTag(part, "w:pict")) {
			inPict = true;
			width = 0;
			height = 0;
			startLIndex = part.lIndex;
		}

		if (inPict && (isStartingTag(part, "v:shape") || isStartingTag(part, "v:rect"))) {
			var style = getSingleAttribute(part.value, "style");
			var parsedStyle = style.split(";").map(function (rule) {
				var parts = rule.split(":");
				return {
					key: parts[0],
					value: parts[1]
				};
			});

			for (var j = 0, len = parsedStyle.length; j < len; j++) {
				var _parsedStyle$j = parsedStyle[j],
					key = _parsedStyle$j.key,
					value = _parsedStyle$j.value;

				if (key === "width") {
					width = value;
				}

				if (key === "height") {
					height = value;
				}
			}
		}

		if (isEndingTag(part, "w:pict")) {
			inPict = false;
			picts.push({
				width: width,
				height: height,
				startLIndex: startLIndex,
				endLIndex: part.lIndex
			});
		}
	}

	return picts;
}

function collectTextBoxDimensions(parsed) {
	var textBoxes = [];
	var inTextBox = false;
	var width = 0,
		height = 0;
	var startLIndex;

	for (var i = 0; i < parsed.length; i++) {
		var part = parsed[i];

		if (isStartingTag(part, "w:drawing")) {
			inTextBox = true;
			width = 0;
			height = 0;
			startLIndex = part.lIndex;
		}

		if (inTextBox && isStartingTag(part, "wp:extent")) {
			width = parseInt(getSingleAttribute(part.value, "cx"), 10);
			height = parseInt(getSingleAttribute(part.value, "cy"), 10);
		}

		if (isEndingTag(part, "w:drawing")) {
			inTextBox = false;
			textBoxes.push({
				width: width,
				height: height,
				startLIndex: startLIndex,
				endLIndex: part.lIndex
			});
		}
	}

	return textBoxes;
}

function getSectionWidth(dpi, sections, lIndex, contentType, columnNum) {
	for (var i = 0, len = sections.length; i < len; i++) {
		var currentSection = sections[i];
		var colsWidth = currentSection.colsWidth;
		var calculatedWidth = colsWidth[columnNum];

		if (contentType !== mainContentType) {
			return converter.dxaToPixel(calculatedWidth, dpi);
		}

		var lastSectionIndex = sections[i - 1] ? sections[i - 1].part.lIndex : -1;

		if (lastSectionIndex < lIndex && lIndex < currentSection.part.lIndex) {
			return converter.dxaToPixel(calculatedWidth, dpi);
		}
	}

	throw new Error("No section found");
}

function getCellWidth(dpi, cells, lIndex) {
	for (var i = 0, len = cells.length; i < len; i++) {
		var cell = cells[i];

		if (cell.startLIndex < lIndex && lIndex < cell.endLIndex) {
			return converter.dxaToPixel(cell.width, dpi);
		}
	}

	return false;
}

function getPictDimensions(dpi, picts, lIndex) {
	for (var i = 0, len = picts.length; i < len; i++) {
		var pict = picts[i];

		if (pict.startLIndex < lIndex && lIndex < pict.endLIndex) {
			return [toPixel(pict.width, {
				dpi: dpi
			}), toPixel(pict.height, {
				dpi: dpi
			})];
		}
	}

	return false;
}

function getTextBoxDimensions(dpi, textBoxes, lIndex) {
	for (var i = 0, len = textBoxes.length; i < len; i++) {
		var textBox = textBoxes[i];

		if (textBox.startLIndex < lIndex && lIndex < textBox.endLIndex) {
			return [converter.emuToPixel(textBox.width, dpi), converter.emuToPixel(textBox.height, dpi)];
		}
	}

	return false;
}

var defaultDeviceWidth = 576;

function defaultGetDxaWidth() {
	return 8640;
}

function WidthCollector(module) {
	var data = {
		sections: module.sections
	};
	return {
		data: data,
		collect: function collect(parsed, options) {
			module.deviceWidth = module.options.deviceWidth || defaultDeviceWidth;
			var contentType = options.contentType;

			if (contentType === mainContentType) {
				var mainFiles = module.docxtemplater.invertedContentTypes[mainContentType];

				if (mainFiles && mainFiles.length > 0) {
					var mainFile = module.docxtemplater.invertedContentTypes[mainContentType][0];
					var mainRels = new RelsManager(module.docxtemplater, mainFile);
					collectSectionsWidth(parsed, mainRels, data.sections);
				}
			}

			data.cells = collectCellsWidth(parsed);
			data.textBoxes = collectTextBoxDimensions(parsed);
			data.picts = collectPicts(parsed);
		},
		getHeaderFooterSize: function getHeaderFooterSize(file) {
			for (var i = 0, len = data.sections.length; i < len; i++) {
				var sect = data.sections[i];

				if (sect.headerFiles.indexOf(file) !== -1 || sect.footerFiles.indexOf(file) !== -1) {
					return sect;
				}
			}
		},
		getNextWSect: function getNextWSect(lIndex) {
			if (!data.sections || data.sections.length === 0) {
				// default section
				return {
					width: 11906,
					leftMargin: 1701,
					rightMargin: 850
				};
			}

			var filePath = "/" + module.filePath;

			for (var i = 0, len = data.sections.length; i < len; i++) {
				var section = data.sections[i];

				if (section.lIndex > lIndex || section.headerFiles.indexOf(filePath) !== -1 || section.footerFiles.indexOf(filePath) !== -1) {
					return section;
				}
			}

			throw new Error("Section not found for ".concat(lIndex));
		},
		getDpi: function getDpi(lIndex) {
			var dpi = module.dpi;

			if (!dpi) {
				var dxaWidth = (module.options.getDxaWidth || defaultGetDxaWidth)(data.sections, this.getNextWSect(lIndex));
				dpi = converter.calculateDpi(module.deviceWidth, dxaWidth);
			}

			return dpi;
		},
		getDimensions: function getDimensions(part, options) {
			if (module.docxtemplater.fileType !== "docx") {
				return [null, null];
			}

			var containerWidth, containerHeight;
			var contentType = options.contentType;

			if ([headerContentType, footerContentType, mainContentType].indexOf(contentType) === -1) {
				return [null, null];
			}

			var dpi = this.getDpi(part.lIndex);
			var dimension = getTextBoxDimensions(dpi, data.textBoxes, part.lIndex) || getPictDimensions(dpi, data.picts, part.lIndex, dpi);

			if (dimension) {
				containerWidth = dimension[0];
				containerHeight = dimension[1];
			} else {
				containerWidth = getCellWidth(dpi, data.cells, part.lIndex) || getSectionWidth(dpi, data.sections, part.lIndex, contentType, module.columnNum);
			}

			return [containerWidth, containerHeight];
		}
	};
}

module.exports = WidthCollector;
