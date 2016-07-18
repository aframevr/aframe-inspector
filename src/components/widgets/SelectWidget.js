var React = require('react');

export default class SelectWidget extends React.Component {
  static propTypes = {
    componentname: React.PropTypes.string.isRequired,
    entity: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    options: React.PropTypes.array.isRequired,
    value: React.PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {value: this.props.value || ''};
  }

  onChange = e => {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange) {
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
    }
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value !== this.state.value) {
      this.setState({value: newProps.value});
    }
  }

  renderOptions = () => {
    return this.props.options.map(value => {
      return <option key={value} value={value}>{value}</option>;
    });
  }

  render () {
    return (
      <select value={this.state.value} onChange={this.onChange}>
        { this.renderOptions() }
      </select>
    );
  }
}
