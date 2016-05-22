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
  handleClick: function(e) {
    var value = e.target.checked;
    this.setState({value: value});
    handleEntityChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  render: function() {
    return (
        <input ref="input" type="checkbox" checked={this.state.value} onClick={this.handleClick}/>
    );
  }
});

module.exports = BooleanWidget;
