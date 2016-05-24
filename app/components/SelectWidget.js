var React = require('react');
var handleEntityChange = require('./Widget');

var SelectWidget = React.createClass({
  getInitialState: function() {
    return {value: this.props.value};
  },
  update: function(e) {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
    if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }
  },
  render: function() {
    return <select value={this.state.value} onChange={this.update}>
          {
            this.props.options.map(function(value) {
              return <option key={value} value={value}>{value}</option>;
          }.bind(this))
        }
        </select>
    ;
  }
});

module.exports = SelectWidget;
