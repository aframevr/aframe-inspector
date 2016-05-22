/*
type
id
position
rotation
scale
visible
<AttributeRow key={key} name={key} schema={componentData.schema[key]} data={componentData.data[key]} componentname={this.props.name} entity={this.props.entity} />
*/
var React = require('react');
var Component = require('./Component');
var AttributeRow = require('./AttributeRow');

function isSingleProperty (schema) {
  if ('type' in schema) {
    return typeof schema.type === 'string';
  }
  return 'default' in schema;
}

var CommonComponent = React.createClass({
  render: function() {
    var entity = this.props.entity;
    var components = entity ? this.props.entity.components : {};

    return <div><h3>Common</h3>
      {
        Object.keys(components).filter(function(key){return ['visible','position','scale','rotation'].indexOf(key)!=-1;}).map(function(key) {
          var componentData = components[key];
          var schema = AFRAME.components[key].schema;
          var data = isSingleProperty(schema) ? componentData.data : componentData.data[key];
          return <AttributeRow key={key} name={key} schema={schema} data={componentData.data} componentname={key} entity={this.props.entity} />
        }.bind(this))
      }
    </div>;
  }
});


var Attributes = React.createClass({
  render: function() {

    var entity = this.props.entity;
    var components = entity ? this.props.entity.components : {};

    return <div className="attributes">
        <CommonComponent entity={entity}/>
    {
    	Object.keys(components).filter(function(key){return ['visible','position','scale','rotation'].indexOf(key)==-1;}).map(function(key) {
        return <Component entity={entity} key={key} name={key} component={components[key]}/>
	    })}
    </div>;
  }
});

module.exports = Attributes;
