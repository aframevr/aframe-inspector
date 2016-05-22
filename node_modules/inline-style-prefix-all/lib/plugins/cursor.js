'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = cursor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsJoinPrefixedRules = require('../utils/joinPrefixedRules');

var _utilsJoinPrefixedRules2 = _interopRequireDefault(_utilsJoinPrefixedRules);

var values = {
  'zoom-in': true,
  'zoom-out': true,
  'grab': true,
  'grabbing': true
};

function cursor(property, value) {
  if (property === 'cursor' && values[value]) {
    return (0, _utilsJoinPrefixedRules2['default'])(property, value);
  }
}

module.exports = exports['default'];