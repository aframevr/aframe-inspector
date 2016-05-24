var React = require('react');
var handleEntityChange = require('./Widget');
var NumberWidget = require('./NumberWidget');
var InputWidget = require('./InputWidget');
var BooleanWidget = require('./BooleanWidget');
var SelectWidget = require('./SelectWidget');
var Vec3Widget = require('./Vec3Widget');
var ColorWidget = require('./ColorWidget');
var handleEntityChange = require('./Widget');

var AttributeRow = React.createClass({
  render: function() {
    var componentData = this.props.component;
    var widget;

    if (this.props.schema.oneOf && this.props.schema.oneOf.length>0) {
      widget = <SelectWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data} options={this.props.schema.oneOf}/>;
    }
    else if (this.props.schema.type === "number") {
      var min = this.props.schema.hasOwnProperty('min') ? this.props.schema.min : -Infinity;
      var max = this.props.schema.hasOwnProperty('max') ? this.props.schema.max : Infinity;
        widget = <NumberWidget onChange={handleEntityChange} min={min} max={max} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    else if (this.props.schema.type === "vec3") {
      widget = <Vec3Widget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    else if (this.props.schema.type === "color") {
      widget = <ColorWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    else if (this.props.schema.type === "int") {
      widget = <NumberWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data} precision={0}/>;
    }
    else if (this.props.schema.type === "boolean") {
      widget = <BooleanWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    else {
      widget = <InputWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    var title = "type: " +this.props.schema.type+ " value: " + JSON.stringify(this.props.data);
    return <div className="row">
              <span className="text" title={title}>{this.props.name}</span>
              {widget}
          </div>;
    }
});

module.exports = AttributeRow;
