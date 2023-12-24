"use strict";

var _require = require("lodash"),
    map = _require.map;

function getRelationRid(relationship) {
  var id = relationship.getAttribute("Id");

  if (/^rId[0-9]+$/.test(id)) {
    return parseInt(id.substr(3), 10);
  }

  return -1;
}

function getRid(relsDoc) {
  var iterable = relsDoc.getElementsByTagName("Relationship");
  return Array.prototype.reduce.call(iterable, function (max, relationship) {
    return Math.max(max, getRelationRid(relationship));
  }, 0);
}

function addRelationship(objMap, relsDoc) {
  var relationships = relsDoc.getElementsByTagName("Relationships")[0];
  var currentRelationships = relsDoc.getElementsByTagName("Relationship");
  var registeredTargets = Array.prototype.filter.call(currentRelationships, function (rel) {
    return rel.getAttribute("Target") === objMap.Target;
  });

  if (registeredTargets.length > 0) {
    return getRelationRid(registeredTargets[0]);
  }

  var newTag = relsDoc.createElement("Relationship");
  var maxRid = getRid(relsDoc) + 1;
  newTag.setAttribute("Id", "rId".concat(maxRid));
  map(objMap, function (value, key) {
    return newTag.setAttribute(key, value);
  });
  relationships.appendChild(newTag);
  return maxRid;
}

function addExtensionRels(contentType, partName, xmlDocuments) {
  var contentTypeDoc = xmlDocuments["[Content_Types].xml"];
  var overrideTags = contentTypeDoc.getElementsByTagName("Override");
  var overrideRegistered = Array.prototype.some.call(overrideTags, function (tag) {
    return tag.getAttribute("PartName") === partName;
  });

  if (overrideRegistered) {
    return;
  }

  var types = contentTypeDoc.getElementsByTagName("Types")[0];
  var newTag = contentTypeDoc.createElement("Override");
  newTag.setAttribute("ContentType", contentType);
  newTag.setAttribute("PartName", partName);
  types.appendChild(newTag);
}

module.exports = {
  addRelationship: addRelationship,
  addExtensionRels: addExtensionRels
};