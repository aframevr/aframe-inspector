var React = require('react');
var AttributesPanel = require('./AttributesPanel');

var AttributesSidebar = React.createClass({
  getInitialState: function() {
    return {open: false};
  },
  handleToggle: function(){
    this.setState({open: !this.state.open});
  },
  render: function() {
    return <AttributesPanel/>
  }
});

module.exports = AttributesSidebar;
