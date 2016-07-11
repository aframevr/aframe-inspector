import React from 'react';

import AttributeRow from './AttributeRow';
import Collapsible from '../Collapsible';

function isSingleProperty (schema) {
  if ('type' in schema) {
    return typeof schema.type === 'string';
  }
  return 'default' in schema;
}

export default class Component extends React.Component {
  static propTypes = {
    component: React.PropTypes.any,
    entity: React.PropTypes.object,
    name: React.PropTypes.string
  };

  deleteComponent = event => {
    event.stopPropagation();
    this.props.entity.removeAttribute(this.props.name);
  }

  resetComponent = event => {
    event.stopPropagation();
    this.props.entity.setAttribute(this.props.name, {});
  }

  render () {
    const componentData = this.props.component;
    let componentName = this.props.name.toUpperCase();
    let subComponentName = '';

    if (componentName.indexOf('__') !== -1) {
      subComponentName = componentName;
      componentName = componentName.substr(0, componentName.indexOf('__'));
    }

    let attributeRows;
    if (isSingleProperty(componentData.schema)) {
      var key = componentName.toLowerCase();
      var schema = AFRAME.components[key.toLowerCase()].schema;
      attributeRows = (
        <AttributeRow key={key} name={key} schema={schema}
          data={componentData.data} componentname={key}
          entity={this.props.entity}/>
      );
    } else {
      attributeRows = Object.keys(componentData.schema).map(key => {
        return (
          <AttributeRow key={key} name={key} schema={componentData.schema[key]}
            data={componentData.data[key]} componentname={this.props.name}
            entity={this.props.entity}/>
        );
      });
    }

    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span title={subComponentName || componentName}>{subComponentName || componentName}</span>
          <div className='dropdown menu'>
            <div className='dropdown-content'>
              <a href='#' onClick={this.deleteComponent}>Delete</a>
              <a href='#' onClick={this.resetComponent}>Reset to default</a>
              <a href='#' className='disabled'>Copy to clipboard</a>
            </div>
          </div>
        </div>
        <div className='collapsible-content'>{attributeRows}</div>
      </Collapsible>
    );
  }
}
