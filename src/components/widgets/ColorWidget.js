var React = require('react');

export default class ColorWidget extends React.Component {
  static propTypes = {
    componentname: React.PropTypes.string.isRequired,
    entity: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string
  };

  static defaultProps = {
    value: '#ffffff'
  };

  constructor (props) {
    super(props);
    this.state = {value: correctColorValue(this.props.value) || ''};
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value !== this.state.value) {
      this.setState({value: correctColorValue(newProps.value)});
    }
  }

  onChange = e => {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange) {
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
    }
  }

  render () {
    return (
      <input type='color' className="color" value={this.state.value} onChange={this.onChange}/>
    );
  }
}

function correctColorValue (value) {
  if (value.length === 4) {
    value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
  }
  return value;
}
