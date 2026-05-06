import React from 'react';
import PropTypes from 'prop-types';

export default class InputWidget extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    schema: PropTypes.object,
    value: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.state = { value: this.stringifyValue(props.value) };
    this.input = React.createRef();
  }

  stringifyValue = (value) => {
    // For selector and selectorAll types, getDOMAttribute returns null for
    // single-property schema and undefined for multi-property schema when the
    // property is not set.
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    // Non-string value (array, custom object like event-set): stringify for display
    if (this.props.schema) return this.props.schema.stringify(value);
    return String(value);
  };

  parseInput = (value) => {
    // The type array doesn't bailout-on-string in its stringify
    // (arrayStringify), so we need to parse the input value before calling
    // onChange. That could potentially happen for a custom property that
    // implements its own parse/stringify functions.
    if (this.props.schema) {
      return this.props.schema.parse(value);
    }
    return value;
  };

  onChange = (event) => {
    const value = event.target.value;
    this.setState({ value: value });
    if (this.props.onChange) {
      this.props.onChange(this.props.name, this.parseInput(value));
    }
  };

  onBlur = (event) => {
    if (this.props.onBlur) {
      const value = event.target.value;
      this.props.onBlur(this.props.name, this.parseInput(value));
    }
  };

  onKeyDown = (event) => {
    event.stopPropagation();

    // enter
    if (event.keyCode === 13) {
      this.input.current.blur();
      return;
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.stringifyValue(this.props.value) });
    }
  }

  render() {
    return (
      <input
        id={this.props.id}
        ref={this.input}
        type="text"
        className="string"
        value={this.state.value}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        spellCheck="false"
      />
    );
  }
}
