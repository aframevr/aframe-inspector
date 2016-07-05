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
    return <div id="sidebar">
      <div className="tab collapsible">
        <span>ATTRIBUTES</span>
        <div className="dropdown menu hide">
          <div className="dropdown-content">
            <a href="#" onClick={this.deleteComponent}>Collapse all</a>
          </div>
        </div>
      </div>
      <AttributesPanel/>
    </div>
  }
});

module.exports = AttributesSidebar;
