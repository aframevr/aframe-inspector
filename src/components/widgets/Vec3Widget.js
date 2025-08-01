import React from 'react';
import PropTypes from 'prop-types';

import NumberWidget from './NumberWidget';
import { areVectorsEqual } from '../../lib/utils';

export default class Vec3Widget extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      x: props.value.x,
      y: props.value.y,
      z: props.value.z
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
    if (!areVectorsEqual(props.value, this.state)) {
      this.setState({
        x: props.value.x,
        y: props.value.y,
        z: props.value.z
      });
    }
  }

  render() {
    return (
      <div className="vec3">
        <NumberWidget name="x" value={this.state.x} onChange={this.onChange} />
        <NumberWidget name="y" value={this.state.y} onChange={this.onChange} />
        <NumberWidget name="z" value={this.state.z} onChange={this.onChange} />
      </div>
    );
  }
}
