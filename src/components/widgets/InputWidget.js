var React = require('react');
import PropTypes from 'prop-types';

export default class InputWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string,
    entity: PropTypes.object,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.state = { value: this.props.value || '' };
  }

  onChange = e => {
    var value = e.target.value;
    this.setState({ value: value });
    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
  };

  componentWillReceiveProps(newProps) {
    if (newProps.value !== this.state.value) {
      this.setState({ value: newProps.value });
    }
  }

  render() {
    return (
      <input
        type="text"
        className="string"
        value={this.state.value || ''}
        onChange={this.onChange}
      />
    );
  }
}
