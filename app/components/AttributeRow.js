var React = require('react');
var handleEntityChange = require('./Widget');
var NumberWidget = require('./NumberWidget');
var InputWidget = require('./InputWidget');
var BooleanWidget = require('./BooleanWidget');
var SelectWidget = require('./SelectWidget');
var Vec3Widget = require('./Vec3Widget');

//import { ColorWidget } from './ColorWidget'
//var ColorWidget = require('./ColorWidget');


var AttributeRow = React.createClass({
  render: function() {
    var componentData = this.props.component;

    var widget = <InputWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    if (this.props.schema.oneOf && this.props.schema.oneOf.length>0) {
      widget = <SelectWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data} options={this.props.schema.oneOf}/>;
    }
    else if (this.props.schema.type === "number") {
      widget = <NumberWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    else if (this.props.schema.type === "vec3") {
      widget = <Vec3Widget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
/*    else if (this.props.schema.type === "color") {
      widget = <ColorWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
  */  else if (this.props.schema.type === "int") {
      widget = <NumberWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data} precision={0}/>;
    }
    else if (this.props.schema.type === "boolean") {
      widget = <BooleanWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    //return <div><li>{this.props.name} <i>{this.props.schema.type}</i> <b>{this.props.data}</b></li>{widget}</div>;
    /*<i>{this.props.schema.type}</i> <b>{this.props.data}</b>*/

    var title = "type: " +this.props.schema.type+ " value: " + JSON.stringify(this.props.data);
    return <div className="row">
              <span className="text" title={title}>{this.props.name}</span>
              {widget}
          </div>;
    }
});

module.exports = AttributeRow;
