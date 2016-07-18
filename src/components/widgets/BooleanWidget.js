var React = require('react');

export default class BooleanWidget extends React.Component {
  static propTypes = {
    componentname: React.PropTypes.string.isRequired,
    entity: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    value: React.PropTypes.bool
  };

  static defaultProps = {
    value: false
  };

  constructor (props) {
    super(props);
    this.state = {value: this.props.value};
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value !== this.state.value) {
      this.setState({value: newProps.value});
    }
  }

  onChange = e => {
    var value = e.target.checked;
    this.setState({value: value});
    if (this.props.onChange) {
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
    }
  }

  render () {
    var id = this.props.componentname + '.' + this.props.name;

    return (
        <input id={id} ref="input" type="checkbox" checked={this.state.value} value={this.state.value} onChange={this.onChange}/>
    );
  }
}
