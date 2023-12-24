"use strict";

var synonyms = {
  BodyText: "TextBody"
};

function getSynonym(name, existingSynonyms) {
  return existingSynonyms[name] || name;
}

function reverseSynonyms(synonyms) {
  return Object.keys(synonyms).reduce(function (reversedSynonyms, synKey) {
    var synValue = synonyms[synKey];
    reversedSynonyms[synValue] = reversedSynonyms[synValue] || [];
    reversedSynonyms[synValue].push(synKey);
    return reversedSynonyms;
  }, {});
}

var reversedSynonyms = reverseSynonyms(synonyms);
module.exports = {
  synonyms: synonyms,
  reversedSynonyms: reversedSynonyms,
  reverseSynonyms: reverseSynonyms,
  getSynonym: getSynonym
};