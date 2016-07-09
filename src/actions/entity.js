/* global AFRAME editor */
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

/**
 * Remove an entity
 * @param  {Element} entity Entity to remove.
 * @param  {boolean} force (Optional) If true it won't ask for confirmation
 */
export function removeEntity (entity, force) {
  if (entity) {
    if (force === true || confirm('Do you really want to remove the entity: `' + (entity.id || entity.tagName) + '`')) {
      entity.parentNode.removeChild(entity);
      // @todo Select the next entity in the scenegraph
      editor.selectEntity(null);
    }
  }
}

/**
 * Remove the selected entity
 * @param  {boolean} force (Optional) If true it won't ask for confirmation
 */
export function removeSelectedEntity (force) {
  removeEntity(editor.selectedEntity);
}

/**
 * Clone an entity, inserting it after the cloned one.
 * @param  {Element} entity Entity to clone
 */
export function cloneEntity (entity) {
  var copy = entity.cloneNode(true);
  copy.addEventListener('loaded', function (e) {
    editor.selectEntity(copy);
  });

  // Get a valid unique ID for the entity
  copy.id = getUniqueId(entity.id);
  //insertAfter(copy, entity);
  entity.insertAdjacentHTML('afterend', copy.outerHTML);
}

/**
 * Clone the selected entity
 */
export function cloneSelectedEntity () {
  cloneEntity(editor.selectedEntity);
}

/**
 * Insert an node after a referenced node.
 * @param  {Element} newNode       Node to insert.
 * @param  {Element} referenceNode Node used as reference to insert after it.
 */
function insertAfter (newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * Detect element's Id collision and returns a valid one
 * @param  {string} baseId Proposed Id
 * @return {string}        Valid Id based on the proposed Id
 */
function getUniqueId (baseId) {
  if (!document.getElementById(baseId)) {
    return baseId;
  }

  var i = 2;
  // If the baseId ends with _#, it extracts the baseId removing the suffix
  var groups = baseId.match(/(\w+)-(\d+)/);
  if (groups) {
    baseId = groups[1];
    i = groups[2];
  }

  while (document.getElementById(baseId + '-' + i)) { i++; }

  return baseId + '-' + i;
}
