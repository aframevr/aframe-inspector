'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExpandTransitionChild = function (_Component) {
  _inherits(ExpandTransitionChild, _Component);

  function ExpandTransitionChild() {
    _classCallCheck(this, ExpandTransitionChild);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ExpandTransitionChild).apply(this, arguments));
  }

  _createClass(ExpandTransitionChild, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.open();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearTimeout(this.enterTimer);
      clearTimeout(this.leaveTimer);
    }
  }, {
    key: 'componentWillAppear',
    value: function componentWillAppear(callback) {
      this.open();
      callback();
    }
  }, {
    key: 'componentWillEnter',
    value: function componentWillEnter(callback) {
      var enterDelay = this.props.enterDelay;

      var _ReactDOM$findDOMNode = _reactDom2.default.findDOMNode(this);

      var style = _ReactDOM$findDOMNode.style;

      style.height = 0;

      if (enterDelay) {
        this.enterTimer = setTimeout(function () {
          return callback();
        }, 450);
        return;
      }

      callback();
    }
  }, {
    key: 'componentDidEnter',
    value: function componentDidEnter() {
      this.open();
    }
  }, {
    key: 'componentWillLeave',
    value: function componentWillLeave(callback) {
      var style = _reactDom2.default.findDOMNode(this).style;
      style.height = this.refs.wrapper.clientHeight;
      style.height = 0;
      this.leaveTimer = setTimeout(function () {
        return callback();
      }, 450);
    }
  }, {
    key: 'open',
    value: function open() {
      var style = _reactDom2.default.findDOMNode(this).style;
      style.height = this.refs.wrapper.clientHeight + 'px';
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var children = _props.children;
      var style = _props.style;

      var other = _objectWithoutProperties(_props, ['children', 'style']);

      var prepareStyles = this.context.muiTheme.prepareStyles;


      var mergedRootStyles = (0, _simpleAssign2.default)({
        position: 'relative',
        height: 0,
        width: '100%',
        top: 0,
        left: 0,
        overflow: 'hidden',
        transition: _transitions2.default.easeOut(null, ['height', 'opacity'])
      }, style);

      return _react2.default.createElement(
        'div',
        _extends({}, other, { style: prepareStyles(mergedRootStyles) }),
        _react2.default.createElement(
          'div',
          { ref: 'wrapper' },
          children
        )
      );
    }
  }]);

  return ExpandTransitionChild;
}(_react.Component);

ExpandTransitionChild.propTypes = {
  children: _react.PropTypes.node,
  enterDelay: _react.PropTypes.number,
  style: _react.PropTypes.object
};
ExpandTransitionChild.defaultProps = {
  enterDelay: 0
};
ExpandTransitionChild.contextTypes = {
  muiTheme: _react.PropTypes.object.isRequired
};
exports.default = ExpandTransitionChild;