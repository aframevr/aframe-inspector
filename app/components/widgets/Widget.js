var Events = require('../../lib/Events.js');

function getBaseComponentName(componentName) {
  return componentName.substr(0,componentName.indexOf('__'));
}

/**
 * Update the entity component value
 * @param  {Element} entity   Entity to modify
 * @param  {string} component     Name of the component
 * @param  {string} property Property name
 * @param  {string|number} value    New value
 */
function handleEntityChange (entity, componentName, propertyName, value) {

  function isSingleProperty (schema) {
    if ('type' in schema) {
      return typeof schema.type === 'string';
    }
    return 'default' in schema;
  }

  var isSingle = isSingleProperty(AFRAME.components[getBaseComponentName(componentName)].schema);

  console.log(entity, componentName, propertyName, value);

  if (propertyName && !isSingle) {
    if (value === null || value === undefined) {
      var parameters = entity.getAttribute(componentName);
      delete parameters[propertyName];
      entity.setAttribute(componentName, parameters);
    } else {
      entity.setAttribute(componentName, propertyName, value);
    }
  } else {
    if (value === null || value === undefined) {
      entity.removeAttribute(componentName);
    } else {
      entity.setAttribute(componentName, value);
    }
  }
  Events.emit('objectChanged', entity);
}

module.exports = handleEntityChange;
