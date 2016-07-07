import React from 'react';

import BooleanWidget from '../widgets/BooleanWidget';
import ColorWidget from '../widgets/ColorWidget';
import InputWidget from '../widgets/InputWidget';
import NumberWidget from '../widgets/NumberWidget';
import SelectWidget from '../widgets/SelectWidget';
import TextureWidget from '../widgets/TextureWidget';
import Vec3Widget from '../widgets/Vec3Widget';
import {updateEntity} from '../../actions/entity';

export default class AttributeRow extends React.Component {
  static propTypes = {
    componentname: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired
  };

  getWidget () {
    const props = this.props;
    const isMap = props.componentname === 'material' && (props.name === 'envMap' ||
                                                         props.name === 'src');
    const type = props.schema.type;
    const widgetProps = {
      componentname: props.componentname,
      entity: props.entity,
      name: props.name,
      onChange: updateEntity,
      value: props.data
    };
    const numberWidgetProps = {
      min: props.schema.hasOwnProperty('min') ? props.schema.min : -Infinity,
      max: props.schema.hasOwnProperty('max') ? props.schema.max : Infinity
    };

    if (props.schema.oneOf && props.schema.oneOf.length > 0) {
      return <SelectWidget {...widgetProps} options={props.schema.oneOf}/>;
    }
    if (type === 'map' || isMap) {
      return <TextureWidget {...widgetProps}/>;
    }

    switch (type) {
      case 'number': {
        return <NumberWidget {...widgetProps} {...numberWidgetProps}/>;
      }
      case 'int': {
        return <NumberWidget {...widgetProps} {...numberWidgetProps} precision={0}/>;
      }
      case 'vec3': {
        return <Vec3Widget {...widgetProps}/>;
      }
      case 'color': {
        return <ColorWidget {...widgetProps}/>;
      }
      case 'boolean': {
        return <BooleanWidget {...widgetProps}/>;
      }
      default: {
        return <InputWidget {...widgetProps}/>;
      }
    }
  }

  render () {
    const props = this.props;
    const title = 'type: ' + props.schema.type + ' value: ' + JSON.stringify(props.data);
    const id = props.componentname + '.' + props.name;
    return (
      <div className='row'>
        <label htmlFor={id} className='text' title={title}>{props.name}</label>
        {this.getWidget(props.schema.type)}
      </div>
    );
  }
}
