import React from 'react';
import PropTypes from 'prop-types';

import NumberWidget from './NumberWidget';

export default class Vec4Widget extends React.Component {
  static propTypes = {
    componentname: PropTypes.string,
    entity: PropTypes.object,
    onChange: PropTypes.func,
    value: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      x: props.value.x,
      y: props.value.y,
      z: props.value.z,
      w: props.value.w
    };
  }

  onChange = (name, value) => {
    this.setState({ [name]: parseFloat(value.toFixed(5)) }, () => {
      if (this.props.onChange) {
        this.props.onChange(name, this.state);
      }
    });
  };

  componentDidUpdate() {
    const props = this.props;
    if (
      props.value.x !== this.state.x ||
      props.value.y !== this.state.y ||
      props.value.z !== this.state.z ||
      props.value.w !== this.state.w
    ) {
      this.setState({
        x: props.value.x,
        y: props.value.y,
        z: props.value.z,
        w: props.value.w
      });
    }
  }

  render() {
    const widgetProps = {
      componentname: this.props.componentname,
      entity: this.props.entity,
      onChange: this.onChange
    };

    return (
      <div className="vec4">
        <NumberWidget name="x" value={this.state.x} {...widgetProps} />
        <NumberWidget name="y" value={this.state.y} {...widgetProps} />
        <NumberWidget name="z" value={this.state.z} {...widgetProps} />
        <NumberWidget name="w" value={this.state.w} {...widgetProps} />
      </div>
    );
  }
}
