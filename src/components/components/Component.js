import React from 'react';

import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';

function isSingleProperty (schema) {
  if ('type' in schema) {
    return typeof schema.type === 'string';
  }
  return 'default' in schema;
}

/**
 * Single component.
 */
export default class Component extends React.Component {
  static propTypes = {
    component: React.PropTypes.any,
    entity: React.PropTypes.object,
    name: React.PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {
      entity: this.props.entity,
      name: this.props.name
    };
  }

  componentWillReceiveProps (newProps) {
    if (this.state.entity !== newProps.entity) {
      this.setState({entity: newProps.entity});
    }
    if (this.state.name !== newProps.name) {
      this.setState({name: newProps.name});
    }
  }

  removeComponent = event => {
    event.stopPropagation();
    if (confirm('Do you really want to remove component `' + this.props.name + '`?')) {
      this.props.entity.removeAttribute(this.props.name);
    }
  }

  render () {
    const componentData = this.props.component;
    let componentName = this.props.name.toUpperCase();
    let subComponentName = '';

    if (componentName.indexOf('__') !== -1) {
      subComponentName = componentName;
      componentName = componentName.substr(0, componentName.indexOf('__'));
    }

    let propertyRows;
    if (isSingleProperty(componentData.schema)) {
      var key = componentName.toLowerCase();
      var schema = AFRAME.components[key.toLowerCase()].schema;
      propertyRows = (
        <PropertyRow key={key} name={key} schema={schema}
          data={componentData.data} componentname={key}
          entity={this.props.entity}/>
      );
    } else {
      propertyRows = Object.keys(componentData.schema).map(key => {
        return (
          <PropertyRow key={key} name={key} schema={componentData.schema[key]}
            data={componentData.data[key]} componentname={this.props.name}
            entity={this.props.entity}/>
        );
      });
    }

    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span title={subComponentName || componentName}>{subComponentName || componentName}</span>
          <div>
            <a href='#' title='Remove component' className='flat-button'
              onClick={this.removeComponent}>remove</a>
          </div>
        </div>
        <div className='collapsible-content'>{propertyRows}</div>
      </Collapsible>
    );
  }
}
