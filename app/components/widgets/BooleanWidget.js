var React = require('react');

var BooleanWidget = React.createClass({
  getInitialState: function() {
    return {value: this.props.value};
  },
  propTypes: {
    value: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      value: false
    };
  },
  componentWillReceiveProps: function(newProps) {
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }
  },
  onChange: function(e) {
    var value = e.target.checked;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  render: function() {
    return (
        <input ref="input" type="checkbox" checked={this.state.value} value={this.state.value} onChange={this.onChange}/>
    );
  }
});

module.exports = BooleanWidget;
