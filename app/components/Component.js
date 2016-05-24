var React = require('react');
var AttributeRow = require('./AttributeRow');

var Component = React.createClass({
  render: function() {
    var componentData = this.props.component;

    return <div className="collapsible">
      <div className="static"><div className="button"></div><span>{this.props.name.toUpperCase()}</span><div className="menu"></div></div>
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
