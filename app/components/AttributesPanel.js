var React = require('react');
var Events = require('../lib/Events.js');
var Attributes = require('./Attributes');

var AttributesPanel = React.createClass({
  getInitialState: function() {
    return {entity: this.props.entity};
  },
  refresh: function() {
    this.forceUpdate();
  },
  componentDidMount: function() {
    this.refresh();
    Events.on('entitySelected', function(entity){
      this.setState({entity: entity});
      if (entity !== null) {
        entity.addEventListener('componentchanged', this.refresh);
      }
    }.bind(this));
    document.addEventListener('componentremoved', function(e){
      if (this.state.entity === e.detail.target) {
        this.refresh();
      }
    }.bind(this));
  },
  componentWillReceiveProps: function(newProps) {
  // This will be triggered typically when the element is changed directly with element.setAttribute
/************    console.error("--------->>>>>>>>>",this.props.entity);
    if (newProps.entity != this.state.entity) {
      this.setState({entity: newProps.entity});
    }
*/
  },
  render: function() {
    return (<Attributes entity={this.state.entity}/>)
  }
});

module.exports = AttributesPanel;
