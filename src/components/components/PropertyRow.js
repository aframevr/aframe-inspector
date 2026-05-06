/* eslint-disable no-prototype-builtins */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';

import { AwesomeIcon } from '../AwesomeIcon';
import CopyToClipboardButton from '../CopyToClipboardButton';
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
import { getComponentClipboardRepresentation } from '../../lib/entity';

const COPYABLE_COMPONENTS = ['position', 'rotation', 'scale'];

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

  getType() {
    const props = this.props;
    let type = props.schema.type;

    if (props.componentname === 'material' && props.name === 'envMap') {
      // material envMap has the wrong type string, force it to map
      type = 'map';
    }

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

    return type;
  }

  getWidget() {
    const props = this.props;
    const type = this.getType();
    const isSelectorType = type === 'selector' || type === 'selectorAll';

    const value = isSelectorType
      ? props.entity.getDOMAttribute(props.componentname)?.[props.name]
      : props.data;

    const updateProperty = (name, value) => {
      updateEntity(
        props.entity,
        props.componentname,
        !props.isSingle ? props.name : '',
        value
      );
    };

    // For selector and selectorAll types, commit on blur only (not on each
    // keystroke): a partial selector is rarely valid and querying the DOM on
    // every character is wasteful.
    const widgetProps = {
      name: props.name,
      ...(isSelectorType
        ? { onBlur: updateProperty }
        : { onChange: updateProperty }),
      value: value,
      id: this.id
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
    if (type === 'map') {
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
        // For selector and selectorAll types, omit the schema so InputWidget
        // doesn't parse the string into a DOM element / NodeList. We want the
        // raw selector string to reach setAttribute — A-Frame preserves it
        // verbatim in attrValue, even when it doesn't resolve, so the UI
        // shows what the user typed.
        return (
          <InputWidget
            {...widgetProps}
            schema={isSelectorType ? undefined : props.schema}
          />
        );
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

  isPropertyExplicitlySet() {
    const props = this.props;
    if (props.isSingle) {
      return props.entity.getDOMAttribute(props.componentname) !== null;
    } else {
      return (
        (props.entity.getDOMAttribute(props.componentname) || {})[
          props.name
        ] !== undefined
      );
    }
  }

  render() {
    const props = this.props;
    const type = this.getType();
    const isPropertyDefined = this.isPropertyDefined();
    const isPropertyExplicitlySet = this.isPropertyExplicitlySet();

    let title = props.name + '\n - type: ' + type;
    if (type === 'number' || type === 'int') {
      const schema = props.schema;
      if (schema.hasOwnProperty('min') && schema.min !== -Infinity) {
        title += '\n - min: ' + schema.min;
      }
      if (schema.hasOwnProperty('max') && schema.max !== Infinity) {
        title += '\n - max: ' + schema.max;
      }
    }
    if (!isPropertyDefined) {
      if (isPropertyExplicitlySet) {
        title += '\n\nexplicitly set to default value';
      } else {
        title += '\n\ndefault value';
      }
    } else {
      title += '\n\nmodified value';
    }
    const className = clsx({
      propertyRow: true,
      propertyRowDefined: isPropertyDefined,
      propertyRowExplicitlySetToDefault:
        !isPropertyDefined && isPropertyExplicitlySet
    });

    return (
      <div className={className}>
        <label htmlFor={this.id} className="text" title={title}>
          {props.name}
        </label>
        {this.getWidget()}
        <div className="propertyRow-actions">
          {type === 'vec3' &&
            COPYABLE_COMPONENTS.includes(props.componentname) && (
              <CopyToClipboardButton
                title="Copy to clipboard"
                message="Copied to clipboard"
                text={() =>
                  getComponentClipboardRepresentation(
                    props.entity,
                    props.componentname
                  )
                }
              />
            )}
          <button
            className="reset-button"
            title="Reset"
            style={
              !(isPropertyExplicitlySet && type !== 'map')
                ? { visibility: 'hidden' }
                : null
            }
            onClick={() => {
              updateEntity(
                props.entity,
                props.componentname,
                !props.isSingle ? props.name : '',
                null
              );
            }}
          >
            <AwesomeIcon icon={faRotateLeft} />
          </button>
        </div>
      </div>
    );
  }
}
