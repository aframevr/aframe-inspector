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

var _TextField = require('../TextField');

var _TextField2 = _interopRequireDefault(_TextField);

var _DropDownMenu = require('../DropDownMenu');

var _DropDownMenu2 = _interopRequireDefault(_DropDownMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getStyles(props) {
  return {
    label: {
      paddingLeft: 0,
      top: props.floatingLabelText ? 6 : -4
    },
    icon: {
      right: 0,
      top: props.floatingLabelText ? 22 : 14
    },
    hideDropDownUnderline: {
      borderTop: 'none'
    }
  };
}

var SelectField = function (_Component) {
  _inherits(SelectField, _Component);

  function SelectField() {
    _classCallCheck(this, SelectField);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SelectField).apply(this, arguments));
  }

  _createClass(SelectField, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var autoWidth = _props.autoWidth;
      var children = _props.children;
      var style = _props.style;
      var labelStyle = _props.labelStyle;
      var iconStyle = _props.iconStyle;
      var id = _props.id;
      var underlineDisabledStyle = _props.underlineDisabledStyle;
      var underlineFocusStyle = _props.underlineFocusStyle;
      var underlineStyle = _props.underlineStyle;
      var errorStyle = _props.errorStyle;
      var selectFieldRoot = _props.selectFieldRoot;
      var disabled = _props.disabled;
      var floatingLabelText = _props.floatingLabelText;
      var floatingLabelStyle = _props.floatingLabelStyle;
      var hintStyle = _props.hintStyle;
      var hintText = _props.hintText;
      var fullWidth = _props.fullWidth;
      var errorText = _props.errorText;
      var onFocus = _props.onFocus;
      var onBlur = _props.onBlur;
      var onChange = _props.onChange;
      var value = _props.value;

      var other = _objectWithoutProperties(_props, ['autoWidth', 'children', 'style', 'labelStyle', 'iconStyle', 'id', 'underlineDisabledStyle', 'underlineFocusStyle', 'underlineStyle', 'errorStyle', 'selectFieldRoot', 'disabled', 'floatingLabelText', 'floatingLabelStyle', 'hintStyle', 'hintText', 'fullWidth', 'errorText', 'onFocus', 'onBlur', 'onChange', 'value']);

      var styles = getStyles(this.props, this.context);

      return _react2.default.createElement(
        _TextField2.default,
        {
          style: style,
          floatingLabelText: floatingLabelText,
          floatingLabelStyle: floatingLabelStyle,
          hintStyle: hintStyle,
          hintText: !hintText && !floatingLabelText ? ' ' : hintText,
          fullWidth: fullWidth,
          errorText: errorText,
          underlineStyle: underlineStyle,
          errorStyle: errorStyle,
          onFocus: onFocus,
          onBlur: onBlur,
          id: id,
          underlineDisabledStyle: underlineDisabledStyle,
          underlineFocusStyle: underlineFocusStyle
        },
        _react2.default.createElement(
          _DropDownMenu2.default,
          _extends({
            disabled: disabled,
            style: selectFieldRoot,
            labelStyle: (0, _simpleAssign2.default)(styles.label, labelStyle),
            iconStyle: (0, _simpleAssign2.default)(styles.icon, iconStyle),
            underlineStyle: styles.hideDropDownUnderline,
            autoWidth: autoWidth,
            value: value,
            onChange: onChange
          }, other),
          children
        )
      );
    }
  }]);

  return SelectField;
}(_react.Component);

SelectField.propTypes = {
  /**
   * If true, the width will automatically be set according to the
   * items inside the menu.
   * To control this width in css instead, leave this prop to `false`.
   */
  autoWidth: _react.PropTypes.bool,
  /**
   * The `MenuItem` elements to populate the `Menu` with.
   * If the MenuItems have the prop `label` that value will
   * be used to render the representation of that
   * item within the field.
   */
  children: _react.PropTypes.node,
  /**
   * Disables the select field if set to true.
   */
  disabled: _react.PropTypes.bool,
  /**
   * The style object to use to override error styles.
   */
  errorStyle: _react.PropTypes.object,
  /**
   * The error content to display.
   */
  errorText: _react.PropTypes.node,
  /**
   * The style object to use to override floating label styles.
   */
  floatingLabelStyle: _react.PropTypes.object,
  /**
   * The content to use for the floating label element.
   */
  floatingLabelText: _react.PropTypes.node,
  /**
   * If true, the field receives the property width 100%.
   */
  fullWidth: _react.PropTypes.bool,
  /**
   * The style object to use to override hint styles.
   */
  hintStyle: _react.PropTypes.object,
  /**
   * The hint content to display.
   */
  hintText: _react.PropTypes.node,
  /**
   * Overrides the styles of the icon element.
   */
  iconStyle: _react.PropTypes.object,
  /**
   * The id prop for the text field.
   */
  id: _react.PropTypes.string,
  /**
   * Overrides the styles of label when the `SelectField` is inactive.
   */
  labelStyle: _react.PropTypes.object,
  /**
   * Callback function that is fired when the `SelectField` loses focus.
   */
  onBlur: _react.PropTypes.func,
  /**
   * Callback function that is fired when the value changes.
   */
  onChange: _react.PropTypes.func,
  /**
   * Callback function that is fired when the `SelectField` gains focus.
   */
  onFocus: _react.PropTypes.func,
  /**
   * The style object to use to override the `DropDownMenu`.
   */
  selectFieldRoot: _react.PropTypes.object, // Must be changed!

  /**
   * Override the inline-styles of the root element.
   */
  style: _react.PropTypes.object,
  /**
   * Override the inline-styles of the underline element when disabled.
   */
  underlineDisabledStyle: _react.PropTypes.object,
  /**
   * Override the inline-styles of the underline element when focused.
   */
  underlineFocusStyle: _react.PropTypes.object,
  /**
   * Overrides the styles of the underline element.
   */
  underlineStyle: _react.PropTypes.object,
  /**
   * The value that is currently selected.
   */
  value: _react.PropTypes.any
};
SelectField.defaultProps = {
  autoWidth: false,
  disabled: false,
  fullWidth: false
};
SelectField.contextTypes = {
  muiTheme: _react.PropTypes.object.isRequired
};
exports.default = SelectField;