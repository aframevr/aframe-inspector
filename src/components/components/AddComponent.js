import React from 'react';
import Collapsible from '../Collapsible';

export default class AddComponent extends React.Component {
  static propTypes = {
    entity: React.PropTypes.object
  };

  /**
   * Add blank component.
   * If component is instanced, generate an ID.
   */
  addComponent = () => {
    var entity = this.props.entity;
    var newComponentName = this.refs.select.value;

    if (AFRAME.components[newComponentName].multiple &&
        isComponentInstanced(entity, newComponentName)) {
      newComponentName = newComponentName + '__' +
                         generateComponentInstanceId(entity, newComponentName);
    }

    entity.setAttribute(newComponentName, '');
  }

  /**
   * Component dropdown options.
   */
  renderComponentOptions () {
    const usedComponents = Object.keys(this.props.entity.components);
    return Object.keys(AFRAME.components)
      .filter(function (componentName) {
        return AFRAME.components[componentName].multiple ||
               usedComponents.indexOf(componentName) === -1;
      })
      .sort()
      .map(function (value) {
        return <option key={value} value={value}>{value}</option>;
      });
  }

  render () {
    const entity = this.props.entity;
    if (!entity) { return <div></div>; }

    return (
      <Collapsible>
        <div className='collapsible-header'>
          <span>COMPONENTS</span>
        </div>
        <div className='collapsible-content'>
          <div className='row'>
            <span className='text'>Add</span>
            <span className='value'>
              <select ref='select'>
                {this.renderComponentOptions()}
              </select>
              <a href='#' className='button fa fa-plus-circle' onClick={this.addComponent}/>
            </span>
          </div>
        </div>
      </Collapsible>
    );
  }
}

/**
 * Check if component has multiplicity.
 */
function isComponentInstanced (entity, componentName) {
  for (var component in entity.components) {
    if (component.substr(0, component.indexOf('__')) === componentName) {
      return true;
    }
  }
}

/**
 * Generate ID for instanced component.
 */
function generateComponentInstanceId (entity, componentName) {
  var i = 2;
  while (entity.components[componentName + '__' + i]) { i++; }
  return i;
}
