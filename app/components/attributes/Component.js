var React = require('react');
var AttributeRow = require('./AttributeRow');

var Component = React.createClass({
  deleteComponent: function(e) {
    this.props.entity.removeAttribute(this.props.name);
  },
  resetComponent: function(e) {
    this.props.entity.setAttribute(this.props.name, {});
  },
  render: function() {
    var componentData = this.props.component;
    var componentName = this.props.name.toUpperCase();
    var subComponentName = '';

    if (componentName.indexOf('_') !== -1) {
      subComponentName = componentName;
      componentName = componentName.substr(0, componentName.indexOf('_'));
    }

    return <div className="component collapsible">
      <div className="static">
        <div className="button"></div>
        <span>{componentName} <span className="subcomponent">{subComponentName}</span></span>
        <div className="dropdown menu">
          <div className="dropdown-content">
            <a href="#" onClick={this.deleteComponent}>Delete</a>
            <a href="#" onClick={this.resetComponent}>Reset to default</a>
            <a href="#" className="disabled">Copy to clipboard</a>
          </div>
        </div>
      </div>
      <div className="content">
      {
        Object.keys(componentData.schema).map(function(key) {
  		    return <AttributeRow key={key} name={key} schema={componentData.schema[key]} data={componentData.data[key]} componentname={this.props.name} entity={this.props.entity} />
  	    }.bind(this))
      }
      </div>
    </div>;
  }
});

module.exports = Component;
