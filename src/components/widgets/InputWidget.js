import React from 'react';
import PropTypes from 'prop-types';

export default class InputWidget extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.state = { value: this.props.value || '' };
    this.input = React.createRef();
  }

  onChange = (event) => {
    const value = event.target.value;
    this.setState({ value: value });
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
  };

  onBlur = (event) => {
    if (this.props.onBlur) {
      const value = event.target.value;
      this.props.onBlur(this.props.name, value);
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
      this.setState({ value: this.props.value || '' });
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
