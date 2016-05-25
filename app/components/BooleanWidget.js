var React = require('react');
var handleEntityChange = require('./Widget');

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
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }
  },
  change: function(e) {
    var value = e.target.checked;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  render: function() {
    return (
        <input ref="input" type="checkbox" checked={this.state.value} value={this.state.value} onChange={this.change}/>
    );
  }
});

module.exports = BooleanWidget;
