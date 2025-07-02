/* eslint-disable no-prototype-builtins */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

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
import { equal } from '../../lib/utils';

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
    if (
      (props.componentname === 'animation' ||
        props.componentname.startsWith('animation__')) &&
      props.name === 'loop'
    ) {
      // The loop property can be a boolean for an infinite loop or a number to set the number of iterations.
      // It's auto detected as number because the default value is 0, but for most use case we want an infinite loop
      // so we're forcing the type to boolean. In the future we could create a custom widget to allow user to choose
      // between infinite loop and number of iterations.
      type = 'boolean';
    }

    const value =
      props.schema.type === 'selector'
        ? props.entity.getDOMAttribute(props.componentname)?.[props.name]
        : props.data;

    const widgetProps = {
      componentname: props.componentname,
      entity: props.entity,
      isSingle: props.isSingle,
      name: props.name,
      onChange: function (name, value) {
        updateEntity(
          props.entity,
          props.componentname,
          !props.isSingle ? props.name : '',
          value
        );
      },
      value: value
    };
    const numberWidgetProps = {
      min: props.schema.hasOwnProperty('min') ? props.schema.min : -Infinity,
      max: props.schema.hasOwnProperty('max') ? props.schema.max : Infinity
    };

    if (props.schema.oneOf && props.schema.oneOf.length > 0) {
      return (
        <SelectWidget
          {...widgetProps}
          options={props.schema.oneOf}
          isMulti={props.schema.type === 'array'}
        />
      );
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
        if (
          props.schema.type === 'string' &&
          widgetProps.value &&
          typeof widgetProps.value !== 'string'
        ) {
          // Allow editing a custom type like event-set component schema
          widgetProps.value = props.schema.stringify(widgetProps.value);
        }
        return <InputWidget {...widgetProps} />;
      }
    }
  }

  isPropertyDefined() {
    const props = this.props;
    let definedValue;
    let defaultValue;
    // getDOMAttribute returns null if the component doesn't exist, and
    // in the case of a multi-properties component it returns undefined
    // if it exists but has the default values.
    if (props.isSingle) {
      definedValue = props.entity.getDOMAttribute(props.componentname);
      if (definedValue === null) return false;
      defaultValue =
        props.entity.components[props.componentname].schema.default;
      return !equal(definedValue, defaultValue);
    } else {
      definedValue = (props.entity.getDOMAttribute(props.componentname) || {})[
        props.name
      ];
      if (definedValue === undefined) return false;
      defaultValue =
        props.entity.components[props.componentname].schema[props.name].default;
      return !equal(definedValue, defaultValue);
    }
  }

  render() {
    const props = this.props;
    const value =
      props.schema.type === 'selector'
        ? props.entity.getDOMAttribute(props.componentname)?.[props.name]
        : JSON.stringify(props.data);
    const title =
      props.name + '\n - type: ' + props.schema.type + '\n - value: ' + value;

    const className = clsx({
      propertyRow: true,
      propertyRowDefined: this.isPropertyDefined()
    });

    return (
      <div className={className}>
        <label htmlFor={this.id} className="text" title={title}>
          {props.name}
        </label>
        {this.getWidget()}
      </div>
    );
  }
}
