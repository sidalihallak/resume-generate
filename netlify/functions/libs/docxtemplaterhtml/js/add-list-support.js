"use strict";

var numberingXml = require("./numbering.xml.js");

var str2xml = require("docxtemplater").DocUtils.str2xml;

var _require = require("./relation-utils.js"),

	addRelationship = _require.addRelationship,

	addExtensionRels = _require.addExtensionRels;

module.exports = function addListSupport(xmlDocuments, mainRelsFile) {

	var _wordNumberingXml;

	xmlDocuments[_wordNumberingXml = "word/numbering.xml"] || (xmlDocuments[_wordNumberingXml] = str2xml(numberingXml));

	addExtensionRels("application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml", "/word/numbering.xml", xmlDocuments);

	addRelationship({

		Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering",

		Target: "numbering.xml"

	}, xmlDocuments[mainRelsFile]);

};

