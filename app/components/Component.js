var React = require('react');
var AttributeRow = require('./AttributeRow');

var Component = React.createClass({
  render: function() {
    var componentData = this.props.component;

    return <div><h3>Component {this.props.name}</h3>
    {
      Object.keys(componentData.schema).map(function(key) {
		    return <AttributeRow key={key} name={key} schema={componentData.schema[key]} data={componentData.data[key]} componentname={this.props.name} entity={this.props.entity} />
	    }.bind(this))
    }
    </div>;
  }
});

module.exports = Component;
