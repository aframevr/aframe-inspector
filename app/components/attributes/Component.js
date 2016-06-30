var React = require('react');
var AttributeRow = require('./AttributeRow');
var Collapsible = require('../Collapsible');
var Pane = require('../Pane');

var Component = React.createClass({
  deleteComponent: function(event) {
    event.preventDefault();
    this.props.entity.removeAttribute(this.props.name);
  },
  resetComponent: function(event) {
    event.preventDefault();
    this.props.entity.setAttribute(this.props.name, {});
  },
  render: function() {
    var componentData = this.props.component;
    var componentName = this.props.name.toUpperCase();
    var subComponentName = '';

    if (componentName.indexOf('__') !== -1) {
      subComponentName = componentName;
      componentName = componentName.substr(0, componentName.indexOf('__'));
    }

    return (
      <Collapsible>
        <div class="collapsible-header">
          <span>{componentName} <span className="subcomponent">{subComponentName}</span></span>
          <div className="dropdown menu">
            <div className="dropdown-content">
              <a href="#" onClick={this.deleteComponent}>Delete</a>
              <a href="#" onClick={this.resetComponent}>Reset to default</a>
              <a href="#" className="disabled">Copy to clipboard</a>
            </div>
          </div>
        </div>
        <div class="collapsible-content">{
          Object.keys(componentData.schema).map(function(key) {
            return <AttributeRow key={key} name={key} schema={componentData.schema[key]} data={componentData.data[key]} componentname={this.props.name} entity={this.props.entity} />
          }.bind(this))
        }
        </div>
      </Collapsible>
    );
  }
});

module.exports = Component;
