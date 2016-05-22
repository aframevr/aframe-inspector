// leight polyfill for Object.assign
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (base) {
  var extend = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  Object.keys(extend).forEach(function (key) {
    return base[key] = extend[key];
  });
  return base;
};

module.exports = exports["default"];