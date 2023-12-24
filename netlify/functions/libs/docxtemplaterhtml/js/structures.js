"use strict";

function runify(data) {
  if (data == null) {
    return [];
  }

  return [{
    type: "run",
    data: data
  }];
}

function paragraphify(data) {
  if (data == null) {
    return [];
  }

  return [{
    type: "paragraph",
    data: data
  }];
}

module.exports = {
  runify: runify,
  paragraphify: paragraphify
};