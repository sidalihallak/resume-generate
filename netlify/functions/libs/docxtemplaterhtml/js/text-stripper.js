"use strict";

module.exports = textStripper;

function textStripper(parsed) {
  return parsed.filter(function (p) {
    return p.type !== "placeholder" && (p.type !== "content" || p.position !== "insidetag");
  });
}