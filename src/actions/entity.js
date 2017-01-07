var Events = require('../lib/Events.js');
var components = AFRAME.components;
var isSingleProperty = AFRAME.schema.isSingleProperty;

import {equal} from '../lib/utils.js';

/**
 * Update a component.
 *
 * @param {Element} entity - Entity to modify.
 * @param {string} component - Name of the component.
 * @param {string} property - Property name.
 * @param {string|number} value - New value.
 */
export function updateEntity (entity, propertyName, value) {
  if (propertyName.indexOf('.') !== -1) {
    // Multi-prop
    var splitName = propertyName.split('.');
    if (value === null || value === undefined) {
      // Remove property.
      var parameters = entity.getAttribute(splitName[0]);
      delete parameters[splitName[1]];
      entity.setAttribute(splitName[0], parameters);
    } else {
      // Set property.
      entity.setAttribute(splitName[0], splitName[1], value);
    }
  } else {
    if (value === null || value === undefined) {
      // Remove property.
      entity.removeAttribute(propertyName);
    } else {
      // Set property.
      entity.setAttribute(propertyName, value);
    }
  }
  Events.emit('objectchanged', entity.object3D);
}

/**
 * Remove an entity
 * @param  {Element} entity Entity to remove.
 * @param  {boolean} force (Optional) If true it won't ask for confirmation
 */
export function removeEntity (entity, force) {
  if (entity) {
    if (force === true || confirm('Do you really want to remove entity `' + (entity.id || entity.tagName) + '`?')) {
      var closest = findClosestEntity(entity);
      AFRAME.INSPECTOR.removeObject(entity.object3D);
      entity.parentNode.removeChild(entity);
      AFRAME.INSPECTOR.selectEntity(closest);
    }
  }
}

function findClosestEntity (entity) {
  // First we try to find the after the entity
  var nextEntity = entity.nextElementSibling;
  while (nextEntity && (!nextEntity.isEntity || nextEntity.isInspector)) {
    nextEntity = nextEntity.nextElementSibling;
  }

  // Return if we found it
  if (nextEntity && nextEntity.isEntity && !nextEntity.isInspector) {
    return nextEntity;
  }
  // Otherwise try to find before the entity
  var prevEntity = entity.previousElementSibling;
  while (prevEntity && (!prevEntity.isEntity || prevEntity.isInspector)) {
    prevEntity = prevEntity.previousElementSibling;
  }

  // Return if we found it
  if (prevEntity && prevEntity.isEntity && !prevEntity.isInspector) {
    return prevEntity;
  }

  return null;
}

/**
 * Remove the selected entity
 * @param  {boolean} force (Optional) If true it won't ask for confirmation
 */
export function removeSelectedEntity (force) {
  if (AFRAME.INSPECTOR.selectedEntity) {
    removeEntity(AFRAME.INSPECTOR.selectedEntity);
  }
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
 * Clone an entity, inserting it after the cloned one.
 * @param  {Element} entity Entity to clone
 */
export function cloneEntity (entity) {
  entity.flushToDOM();
  var copy = entity.cloneNode(true);
  copy.addEventListener('loaded', function (e) {
    AFRAME.INSPECTOR.selectEntity(copy);
  });

  // Get a valid unique ID for the entity
  if (entity.id) {
    copy.id = getUniqueId(entity.id);
  }
  copy.addEventListener('loaded', function () {
    Events.emit('dommodified');
    AFRAME.INSPECTOR.selectEntity(copy);
  });
  insertAfter(copy, entity);
}

/**
 * Clone the selected entity
 */
export function cloneSelectedEntity () {
  if (AFRAME.INSPECTOR.selectedEntity) {
    cloneEntity(AFRAME.INSPECTOR.selectedEntity);
  }
}

/**
 * Returns the clipboard representation to be used to copy to the clipboard
 * @param  {Element} entity Entity to copy to clipboard
 * @return {string}        Entity clipboard representation
 */
export function getClipboardRepresentation (entity) {
  //entity.flushToDOM();
  var clone = entity.cloneNode(true);
  var defaultComponents = Object.keys(clone.defaultComponents);

  removeDefaultAttributes(clone);
  removeNotModifiedMixedinAttributes(entity, clone);
  removeDefaultProperties(entity, clone);
  clone.flushToDOM();
  return clone.outerHTML;

  function removeDefaultAttributes (el) {
    for (let i = 0; i < el.childNodes.length; i++) {
      var child = el.childNodes[i];
      if (child.isEntity) {
        removeDefaultAttributes(child);
      }
    }

    for (let i = 0; i < defaultComponents.length; i++) {
      if (el.getAttribute(defaultComponents[i])) {
        el.removeAttribute(defaultComponents[i]);
      }
    }
  }

  function removeNotModifiedMixedinAttributes (entity, clonedEntity) {
    var mixinEls = entity.mixinEls;
    mixinEls.forEach(function removeIfNoModified (mixinEl) {
      var attributes = mixinEl.attributes;
      var attrName;
      var components = entity.components;
      var componentAttrValue;
      for (var i = 0; i < attributes.length; i++) {
        attrName = attributes[i].name;
        componentAttrValue = HTMLElement.prototype.getAttribute.call(entity, attrName);
        // Not a component
        if (!entity.components[attrName]) { continue; }
        // Value of the component has not changed
        if (componentAttrValue && componentAttrValue !== attributes[i].value) { continue; }
        clonedEntity.removeAttribute(attrName);
      }
    });
  }

  function removeDefaultProperties (entity, clonedEntity) {
    var attributes = Array.prototype.slice.call(clonedEntity.attributes);
    var attributesLength = attributes.length;
    for (var i = 0; i < attributesLength; i++) {
      if (!entity.components[attributes[i].name]) { continue; }
      removeDefaultValues(attributes[i].name, entity, clonedEntity);
    }

    function removeDefaultValues(componentName, entity, clonedEntity) {
      var schema = entity.components[componentName].schema;
      var componentValues = entity.getAttribute(componentName);
      var defaultValue;
      if (schema.default) {
        defaultValue = schema.default;
        if (!equal(defaultValue, componentValues)) { return; }
        clonedEntity.removeAttribute(componentName);
      } else {
        for (var property in schema) {
          defaultValue = schema[property].default;
          if (!equal(defaultValue, componentValues[property])) { continue; }
          delete componentValues[property];
        }
        clonedEntity.setAttribute(componentName, componentValues, true);
      }
    }
  }
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
