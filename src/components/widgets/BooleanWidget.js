import React from 'react';
import PropTypes from 'prop-types';

export default class BooleanWidget extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.bool
  };

  static defaultProps = {
    value: false
  };

  constructor(props) {
    super(props);
    this.state = { value: this.props.value };
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.props.value });
    }
  }

  onChange = (e) => {
    var value = e.target.checked;
    this.setState({ value: value });
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
  };

  render() {
    return (
      <input
        id={this.props.id}
        type="checkbox"
        checked={this.state.value}
        value={this.state.value}
        onChange={this.onChange}
      />
    );
  }
}
