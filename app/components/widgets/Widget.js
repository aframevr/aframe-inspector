var Events = require('../../lib/Events.js');

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
  var isSingle = isSingleProperty(AFRAME.components[componentName].schema);

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
