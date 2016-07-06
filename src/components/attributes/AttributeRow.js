var React = require('react');
import NumberWidget from '../widgets/NumberWidget';
import InputWidget from '../widgets/InputWidget';
import BooleanWidget from '../widgets/BooleanWidget';
import SelectWidget from '../widgets/SelectWidget';
import Vec3Widget from '../widgets/Vec3Widget';
import ColorWidget from '../widgets/ColorWidget';
import TextureWidget from '../widgets/TextureWidget';
import handleEntityChange from '../widgets/Widget';

export default class AttributeRow extends React.Component {
  render() {
    var componentData = this.props.component;
    var widget;

    var map = false;
    if (this.props.componentname === 'material' && (this.props.name === 'envMap' || this.props.name === 'src')) {
      map =  true;
    }

    if (this.props.schema.oneOf && this.props.schema.oneOf.length>0) {
      widget = <SelectWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data} options={this.props.schema.oneOf}/>;
    } else if (this.props.schema.type === "map" || map) {
      widget = <TextureWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    } else if (this.props.schema.type === "number") {
      var min = this.props.schema.hasOwnProperty('min') ? this.props.schema.min : -Infinity;
      var max = this.props.schema.hasOwnProperty('max') ? this.props.schema.max : Infinity;
        widget = <NumberWidget onChange={handleEntityChange} min={min} max={max} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    } else if (this.props.schema.type === "vec3") {
      widget = <Vec3Widget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    } else if (this.props.schema.type === "color") {
      widget = <ColorWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    } else if (this.props.schema.type === "int") {
      var min = this.props.schema.hasOwnProperty('min') ? this.props.schema.min : -Infinity;
      var max = this.props.schema.hasOwnProperty('max') ? this.props.schema.max : Infinity;
      widget = <NumberWidget onChange={handleEntityChange} min={min} max={max} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data} precision={0}/>;
    } else if (this.props.schema.type === "boolean") {
      widget = <BooleanWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    } else {
      widget = <InputWidget onChange={handleEntityChange} name={this.props.name} componentname={this.props.componentname} entity={this.props.entity} value={this.props.data}/>;
    }
    var title = "type: " +this.props.schema.type+ " value: " + JSON.stringify(this.props.data);
    var id = this.props.componentname + '.' + this.props.name;
    return (
      <div className="row">
        <label htmlFor={id} className="text" title={title}>{this.props.name}</label>
        {widget}
      </div>
    );
  }
}
