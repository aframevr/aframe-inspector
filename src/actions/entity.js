/* global AFRAME */
var Events = require('../lib/Events.js');

var components = AFRAME.components;
var isSingleProperty = AFRAME.schema.isSingleProperty;

/**
 * Update a component.
 *
 * @param {Element} entity - Entity to modify.
 * @param {string} component - Name of the component.
 * @param {string} property - Property name.
 * @param {string|number} value - New value.
 */
export function updateEntity (entity, componentName, propertyName, value) {
  var isSingle = isSingleProperty(components[entity.components[componentName].name].schema);

  if (propertyName && !isSingle) {
    // Multi-prop.
    if (value === null || value === undefined) {
      // Remove property.
      var parameters = entity.getAttribute(componentName);
      delete parameters[propertyName];
      entity.setAttribute(componentName, parameters);
    } else {
      // Set property.
      entity.setAttribute(componentName, propertyName, value);
    }
  } else {
    // Single-prop.
    if (value === null || value === undefined) {
      // Remove property.
      entity.removeAttribute(componentName);
    } else {
      // Set property.
      entity.setAttribute(componentName, value);
    }
  }
  Events.emit('objectChanged', entity.object3D);
}
