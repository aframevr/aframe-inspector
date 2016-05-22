var React = require('react');
var handleEntityChange = require('./Widget');
var NumberWidget = require('./NumberWidget');
var InputWidget = require('./InputWidget');
var BooleanWidget = require('./BooleanWidget');
var SelectWidget = require('./SelectWidget');

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
    else if (this.props.schema.type === "boolean") {
      widget = <BooleanWidget name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    //return <div><li>{this.props.name} <i>{this.props.schema.type}</i> <b>{this.props.data}</b></li>{widget}</div>;
    /*<i>{this.props.schema.type}</i> <b>{this.props.data}</b>*/

    return <div className="row">
              <span className="text">{this.props.name}</span>
              {widget}
              <i>{this.props.schema.type}</i> <b>{this.props.data}</b>

           </div>;
/*
          <div class="Row">
            <span class="Text" style="cursor: default; display: inline-block; vertical-align: middle; width: 120px;">depth</span>
            <input class="Number" id="geometry.depth" style="cursor: col-resize; width: 50px; background-color: transparent;">
          </div>
*/
  }
});

module.exports = AttributeRow;
