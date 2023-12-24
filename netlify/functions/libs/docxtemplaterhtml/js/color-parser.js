"use strict";
var color = require("color-js");
module.exports = function (value) {
	return color(value).toCSSHex().substring(1);
};

