var React = require('react');
var handleEntityChange = require('./Widget');

import NumberWidget from './NumberWidget';

export default class Vec3Widget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: props.value};
  }

  getValue = () => {
    return {x: this.refs.x.state.value, y: this.refs.y.state.value, z: this.refs.z.state.value};
  }

  onChange = (entity, componentName, name, value) => {
    if (this.props.onChange) {
      value = this.getValue();
      this.props.onChange(entity, componentName, name, value);
    }
  }

  render() {
    return (
        <div className="vec3">
          <NumberWidget ref="x" onChange={this.onChange} name="x" componentname={this.props.componentname} entity={this.props.entity} value={this.props.value.x}/>
          <NumberWidget ref="y" onChange={this.onChange} name="y" componentname={this.props.componentname} entity={this.props.entity} value={this.props.value.y}/>
          <NumberWidget ref="z" onChange={this.onChange} name="z" componentname={this.props.componentname} entity={this.props.entity} value={this.props.value.z}/>
        </div>
    );
  }
}
