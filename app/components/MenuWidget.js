var React = require('react');
var handleEntityChange = require('./Widget');

var MenuWidget = React.createClass({
  update: function(e) {
    var value = e.target.value;
    this.setState({value: value});
    if (this.props.onChange)
      this.props.onChange(this.props.entity, this.props.componentname, this.props.name, value);
  },
  componentWillReceiveProps: function(newProps) {
    // This will be triggered typically when the element is changed directly with element.setAttribute
  /*  if (newProps.value != this.state.value) {
      this.setState({value: newProps.value});
    }
*/
  },
  render: function() {
    return <div className="Panel" id="menubar">
      <div className="menu aframe-logo">
        <div className="title">
          <span style={{color: '#ed3160'}}>A-</span>
          <span style={{color: '#fff'}}>Frame</span>
        </div>
      </div>
      <div className="menu">
        <div className="title">Scene</div>
        <div className="options">
          <div className="option">Save HTML</div>
          <div className="option" id="copy-scene">Copy to clipboard</div>
        </div>
      </div>
      <div className="menu">
        <div className="title">Edit</div>
      </div>
      <div className="menu">
        <div className="title">Assets</div>
      </div>
      <div className="menu">
        <div className="title">Create</div>
      </div>
      <div className="menu">
        <div className="title">Components</div>
      </div>
    </div>;
  }
});

module.exports = MenuWidget;
