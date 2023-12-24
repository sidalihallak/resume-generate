"use strict";

function ownKeys(object, enumerableOnly) {
	var keys = Object.keys(object);
	if (Object.getOwnPropertySymbols) {
		var symbols = Object.getOwnPropertySymbols(object);
		enumerableOnly && (symbols = symbols.filter(function (sym) {
			return Object.getOwnPropertyDescriptor(object, sym).enumerable;
		})), keys.push.apply(keys, symbols);
	}
	return keys;
}

function _objectSpread(target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = null != arguments[i] ? arguments[i] : {};
		i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
			_defineProperty(target, key, source[key]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
			Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
		});
	}
	return target;
}

function _defineProperty(obj, key, value) {
	if (key in obj) {
		Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
	} else {
		obj[key] = value;
	}
	return obj;
}

var _require = require("./selector.js"), parseSelector = _require.parseSelector, matchesRule = _require.matchesRule;
var _require2 = require("./html-utils.js"), getClassNames = _require2.getClassNames;
module.exports = function addCustomProperties(element, transformer) {
	if (element.implicit) {
		return;
	}
	var htmlStyle = "";
	if (transformer.tagStyleSheet) {
		var rules = transformer.tagStyleSheet.stylesheet.rules || [];
		rules.forEach(function (_ref) {
			var selectors = _ref.selectors, declarations = _ref.declarations, type = _ref.type;
			if (type !== "rule") {
				return;
			}
			selectors.forEach(function (selector) {
				var rules = parseSelector(selector);
				if (rules.some(matchesRule.bind(null, element))) {
					declarations.forEach(function (declaration) {
						htmlStyle += "".concat(declaration.property, ": ").concat(declaration.value, ";");
					});
				}
			});
		});
	}
	if (transformer.styleSheet) {
		var _rules = transformer.styleSheet.stylesheet.rules || [];
		_rules.forEach(function (_ref2) {
			var selectors = _ref2.selectors, declarations = _ref2.declarations, type = _ref2.type;
			if (type !== "rule") {
				return;
			}
			selectors.forEach(function (selector) {
				var rules = parseSelector(selector);
				if (rules.some(matchesRule.bind(null, element))) {
					declarations.forEach(function (declaration) {
						htmlStyle += "".concat(declaration.property, ": ").concat(declaration.value, ";");
					});
				}
			});
		});
	}
	element.customProperties = transformer.elementCustomizer(_objectSpread(_objectSpread({classNames: element.attribs ? getClassNames(element) : []}, element), {}, {
		styleDefaults: transformer.styleDefaults,
		styleIds: transformer.styleIds,
		part: transformer.part,
		matches: function matches(selector) {
			var rules = parseSelector(selector);
			if (rules.some(matchesRule.bind(null, element))) {
				return true;
			}
		}
	}));
	if (htmlStyle.length > 0) {
		element.customProperties || (element.customProperties = {});
		element.customProperties.htmlStyle = htmlStyle + (element.customProperties.htmlStyle || "");
	}
};
