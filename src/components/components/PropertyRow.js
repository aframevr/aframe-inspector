/* eslint-disable no-prototype-builtins */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import BooleanWidget from '../widgets/BooleanWidget';
import ColorWidget from '../widgets/ColorWidget';
import InputWidget from '../widgets/InputWidget';
import NumberWidget from '../widgets/NumberWidget';
import SelectWidget from '../widgets/SelectWidget';
import TextureWidget from '../widgets/TextureWidget';
import Vec4Widget from '../widgets/Vec4Widget';
import Vec3Widget from '../widgets/Vec3Widget';
import Vec2Widget from '../widgets/Vec2Widget';
import { updateEntity } from '../../lib/entity';

export default class PropertyRow extends React.Component {
  static propTypes = {
    componentname: PropTypes.string.isRequired,
    data: PropTypes.oneOfType([
      PropTypes.array.isRequired,
      PropTypes.bool.isRequired,
      PropTypes.number.isRequired,
      PropTypes.object.isRequired,
      PropTypes.string.isRequired
    ]),
    entity: PropTypes.object.isRequired,
    id: PropTypes.string,
    isSingle: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.id = props.componentname + ':' + props.name;
  }

  getWidget() {
    const props = this.props;
    const isMap =
      props.componentname === 'material' &&
      (props.name === 'envMap' || props.name === 'src');
    let type = props.schema.type;
    if (props.componentname === 'animation' && props.name === 'loop') {
      // fix wrong number type for animation loop property
      type = 'boolean';
    }

    const value =
      props.schema.type === 'selector'
        ? props.entity.getDOMAttribute(props.componentname)[props.name]
        : props.data;

    const widgetProps = {
      componentname: props.componentname,
      entity: props.entity,
      isSingle: props.isSingle,
      name: props.name,
      // Wrap updateEntity for tracking.
      onChange: function (name, value) {
        var propertyName = props.componentname;
        if (!props.isSingle) {
          propertyName += '.' + props.name;
        }

        updateEntity.apply(this, [props.entity, propertyName, value]);
      },
      value: value
    };
    const numberWidgetProps = {
      min: props.schema.hasOwnProperty('min') ? props.schema.min : -Infinity,
      max: props.schema.hasOwnProperty('max') ? props.schema.max : Infinity
    };

    if (props.schema.oneOf && props.schema.oneOf.length > 0) {
      return <SelectWidget {...widgetProps} options={props.schema.oneOf} />;
    }
    if (type === 'map' || isMap) {
      return <TextureWidget {...widgetProps} />;
    }

    switch (type) {
      case 'number': {
        return <NumberWidget {...widgetProps} {...numberWidgetProps} />;
      }
      case 'int': {
        return (
          <NumberWidget {...widgetProps} {...numberWidgetProps} precision={0} />
        );
      }
      case 'vec2': {
        return <Vec2Widget {...widgetProps} />;
      }
      case 'vec3': {
        return <Vec3Widget {...widgetProps} />;
      }
      case 'vec4': {
        return <Vec4Widget {...widgetProps} />;
      }
      case 'color': {
        return <ColorWidget {...widgetProps} />;
      }
      case 'boolean': {
        return <BooleanWidget {...widgetProps} />;
      }
      default: {
        return <InputWidget {...widgetProps} />;
      }
    }
  }

  render() {
    const props = this.props;
    const value =
      props.schema.type === 'selector'
        ? props.entity.getDOMAttribute(props.componentname)[props.name]
        : JSON.stringify(props.data);
    const title =
      props.name + '\n - type: ' + props.schema.type + '\n - value: ' + value;

    const className = classNames({
      propertyRow: true,
      propertyRowDefined: props.isSingle
        ? !!props.entity.getDOMAttribute(props.componentname)
        : props.name in
          (props.entity.getDOMAttribute(props.componentname) || {})
    });

    return (
      <div className={className}>
        <label htmlFor={this.id} className="text" title={title}>
          {props.name}
        </label>
        {this.getWidget(props.schema.type)}
      </div>
    );
  }
}
