var React = require('react');
import PropTypes from 'prop-types';

export default class ColorWidget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string.isRequired,
    entity: PropTypes.object,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.string
  };

  static defaultProps = {
    value: '#ffffff'
  };

  constructor(props) {
    super(props);

    var value = this.props.value;
    this.color = new THREE.Color();

    this.state = {
      value: value,
      pickerValue: this.getHexString(value)
    };
  }

  setValue(value) {
    var pickerValue = this.getHexString(value);

    this.setState({
      value: value,
      pickerValue: pickerValue
    });

    if (this.props.onChange) {
      this.props.onChange(this.props.name, value);
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.value !== this.state.value) {
      this.setState({
        value: newProps.value,
        pickerValue: this.getHexString(newProps.value)
      });
    }
  }

  getHexString(value) {
    return '#' + this.color.set(value).getHexString();
  }

  onChange = e => {
    this.setValue(e.target.value);
  };

  onKeyUp = e => {
    e.stopPropagation();
    // if (e.keyCode === 13)
    this.setValue(e.target.value);
  };

  onChangeText = e => {
    this.setState({ value: e.target.value });
  };

  render() {
    return (
      <span className="color-widget">
        <input
          type="color"
          className="color"
          value={this.state.pickerValue}
          title={this.state.value}
          onChange={this.onChange}
        />
        <input
          type="text"
          className="color_value"
          value={this.state.value}
          onKeyUp={this.onKeyUp}
          onChange={this.onChangeText}
        />
      </span>
    );
  }
}
