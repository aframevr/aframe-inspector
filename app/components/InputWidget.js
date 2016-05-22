var React = require('react');
var handleEntityChange = require('./Widget');

var InputWidget = React.createClass({
  getInitialState: function() {
    return {value: this.props.value};
  },
  update: function(e) {
    this.setState({value: e.target.value});
    handleEntityChange(this.props.entity, this.props.componentname, this.props.name, e.target.value);
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }
  },
  render: function() {
    return <input type="text" value={this.state.value}
      onChange={this.update}/>;
  }
});

module.exports = InputWidget;
