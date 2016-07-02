var React = require('react');
var AttributeRow = require('./AttributeRow');
var Collapsible = require('../Collapsible');
var Pane = require('../Pane');

function isSingleProperty (schema) {
   if ('type' in schema) {
     return typeof schema.type === 'string';
   }
   return 'default' in schema;
}

var Component = React.createClass({
  deleteComponent: function(event) {
    event.stopPropagation();
    this.props.entity.removeAttribute(this.props.name);
  },
  resetComponent: function(event) {
    event.stopPropagation();
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

    var attributeRows = '';
    if (isSingleProperty(componentData.schema)) {
      var key = componentName.toLowerCase();
      var schema = AFRAME.components[key.toLowerCase()].schema;
      var data = isSingleProperty(schema) ? componentData.data : componentData.data[key];
      attributeRows = <AttributeRow key={key} name={key} schema={schema} data={componentData.data} componentname={key} entity={this.props.entity} />
      //attributeRows = <AttributeRow key={key} name={key} schema={componentData.schema[key]} data={componentData.data[key]} componentname={this.props.name} entity={this.props.entity} />
    } else {
     attributeRows = Object.keys(componentData.schema).map(function(key) {
      //var data = isSingleProperty(schema) ? componentData.data : componentData.data[key];
      var schema = componentData.schema[key];
      return <AttributeRow key={key} name={key} schema={componentData.schema[key]} data={componentData.data[key]} componentname={this.props.name} entity={this.props.entity} />
     }.bind(this))
    }

    return (
      <Collapsible>
        <div className="collapsible-header">
          <span>{componentName} <span className="subcomponent">{subComponentName}</span></span>
          <div className="dropdown menu">
            <div className="dropdown-content">
              <a href="#" onClick={this.deleteComponent}>Delete</a>
              <a href="#" onClick={this.resetComponent}>Reset to default</a>
              <a href="#" className="disabled">Copy to clipboard</a>
            </div>
          </div>
        </div>
        <div className="collapsible-content">{attributeRows}</div>
      </Collapsible>
    );
  }
});

module.exports = Component;
