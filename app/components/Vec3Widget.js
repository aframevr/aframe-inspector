var React = require('react');
var handleEntityChange = require('./Widget');
var NumberWidget = require('./NumberWidget');

var Vec3Widget = React.createClass({

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
        <div>
          <NumberWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.value.x}/>
          <NumberWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.value.y}/>
          <NumberWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.value.z}/>
        </div>
    );
  }
});

module.exports = Vec3Widget;
