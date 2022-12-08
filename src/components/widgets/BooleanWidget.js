import React from 'react';
import PropTypes from 'prop-types';

export default class BooleanWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string.isRequired,
    entity: PropTypes.object,
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

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.value) {
      return { value: props.value };
    }
    return null;
  }

  onChange = (e) => {
    var value = e.target.checked;
    this.setState({ value: value });
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
  };

  render() {
    var id = this.props.componentname + '.' + this.props.name;

    return (
      <input
        id={id}
        type="checkbox"
        checked={this.state.value}
        value={this.state.value}
        onChange={this.onChange}
      />
    );
  }
}
