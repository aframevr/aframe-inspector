import Events from './Events';
import { equal } from './utils';

/**
 * Update a component.
 *
 * @param {Element} entity - Entity to modify.
 * @param {string} component - component name
 * @param {string} property - property name, use empty string if component is single property or if value is an object
 * @param {string|number|object} value - New value.
 */
export function updateEntity(entity, component, property, value) {
  if (property) {
    if (value === null || value === undefined) {
      // Remove property.
      entity.removeAttribute(component, property);
    } else {
      // Set property.
      entity.setAttribute(component, property, value);
    }
  } else {
    if (value === null || value === undefined) {
      // Remove component.
      entity.removeAttribute(component);
    } else {
      // Set component.
      entity.setAttribute(component, value);
    }
  }

  Events.emit('entityupdate', { entity, component, property, value });
}

/**
 * Remove an entity.
 *
 * @param {Element} entity Entity to remove.
 * @param {boolean} [force=false] If true it won't ask for confirmation.
 */
export function removeEntity(entity, force = false) {
  if (entity) {
    if (
      force === true ||
      confirm(
        'Do you really want to remove entity `' +
          (entity.id || entity.tagName) +
          '`?'
      )
    ) {
      var closest = findClosestEntity(entity);
      entity.parentNode.removeChild(entity);
      AFRAME.INSPECTOR.selectEntity(closest);
    }
  }
}

function findClosestEntity(entity) {
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
 * @param {boolean} [force=false] If true it won't ask for confirmation.
 */
export function removeSelectedEntity(force = false) {
  if (AFRAME.INSPECTOR.selectedEntity) {
    removeEntity(AFRAME.INSPECTOR.selectedEntity, force);
  }
}

/**
 * Insert an node after a referenced node.
 * @param  {Element} newNode       Node to insert.
 * @param  {Element} referenceNode Node used as reference to insert after it.
 */
function insertAfter(newNode, referenceNode) {
  if (!referenceNode.parentNode) {
    referenceNode = AFRAME.INSPECTOR.selectedEntity;
  }

  if (!referenceNode) {
    AFRAME.INSPECTOR.sceneEl.appendChild(newNode);
  } else {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
}

function recursivelyRegenerateId(element) {
  if (element.id) {
    element.id = getUniqueId(element.id);
  }

  for (const child of element.childNodes) {
    recursivelyRegenerateId(child);
  }
}

/**
 * Clone an entity, inserting it after the cloned one.
 * @param  {Element} entity Entity to clone
 */
export function cloneEntity(entity) {
  entity.flushToDOM();

  const clone = prepareForSerialization(entity);
  clone.addEventListener(
    'loaded',
    function () {
      clone.pause();
      AFRAME.INSPECTOR.selectEntity(clone);
      Events.emit('entityclone', clone);
    },
    { once: true }
  );

  // Get a valid unique ID for the entity and children
  recursivelyRegenerateId(clone);
  insertAfter(clone, entity);
}

/**
 * Clone the selected entity
 */
export function cloneSelectedEntity() {
  if (AFRAME.INSPECTOR.selectedEntity) {
    cloneEntity(AFRAME.INSPECTOR.selectedEntity);
  }
}

/**
 * Return the clipboard representation to be used to copy to the clipboard
 * @param  {Element} entity Entity to copy to clipboard
 * @return {string}        Entity clipboard representation
 */
export function getEntityClipboardRepresentation(entity) {
  var clone = prepareForSerialization(entity);
  return clone.outerHTML;
}

/**
 * Returns a copy of the DOM hierarchy prepared for serialization.
 * The process optimises component representation to avoid values coming from
 * primitive attributes, mixins and defaults.
 *
 * @param {Element} entity Root of the DOM hierarchy.
 * @return {Element}        Copy of the DOM hierarchy ready for serialization.
 */
function prepareForSerialization(entity) {
  var clone = entity.cloneNode(false);
  var children = entity.childNodes;
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    if (
      child.nodeType !== Node.ELEMENT_NODE ||
      (!child.hasAttribute('aframe-injected') &&
        !child.hasAttribute('data-aframe-inspector') &&
        !child.hasAttribute('data-aframe-canvas'))
    ) {
      clone.appendChild(prepareForSerialization(children[i]));
    }
  }
  optimizeComponents(clone, entity);
  return clone;
}

/**
 * Removes from copy those components or components' properties that comes from
 * primitive attributes, mixins, injected default components or schema defaults.
 *
 * @param {Element} copy   Destinatary element for the optimization.
 * @param {Element} source Element to be optimized.
 */
function optimizeComponents(copy, source) {
  var removeAttribute = HTMLElement.prototype.removeAttribute;
  var setAttribute = HTMLElement.prototype.setAttribute;
  var components = source.components || {};
  Object.keys(components).forEach(function (name) {
    var component = components[name];
    var result = getImplicitValue(component, source);
    var isInherited = result[1];
    var implicitValue = result[0];
    var currentValue = source.getAttribute(name);
    var optimalUpdate = getOptimalUpdate(
      component,
      implicitValue,
      currentValue
    );
    var doesNotNeedUpdate = optimalUpdate === null;
    if (isInherited && doesNotNeedUpdate) {
      removeAttribute.call(copy, name);
      return;
    }

    var schema = component.schema;
    var value = stringifyComponentValue(schema, optimalUpdate);
    // Remove special components if they use the default value
    if (
      value === '' &&
      (name === 'visible' ||
        name === 'position' ||
        name === 'rotation' ||
        name === 'scale')
    ) {
      removeAttribute.call(copy, name);
      return;
    }

    setAttribute.call(copy, name, value);
  });
}

/**
 * @param  {Schema} schema The component schema.
 * @param  {any}    data   The component value.
 * @return {string}        The string representation of data according to the
 *                         passed component's schema.
 */
function stringifyComponentValue(schema, data) {
  data = typeof data === 'undefined' ? {} : data;
  if (data === null) {
    return '';
  }
  return (isSingleProperty(schema) ? _single : _multi)();

  function _single() {
    return schema.stringify(data);
  }

  function _multi() {
    var propertyBag = {};
    Object.keys(data).forEach(function (name) {
      if (schema[name]) {
        propertyBag[name] = schema[name].stringify(data[name]);
      }
    });
    return AFRAME.utils.styleParser.stringify(propertyBag);
  }
}

/**
 * Computes the value for a component coming from primitive attributes,
 * mixins, primitive defaults, a-frame default components and schema defaults.
 * In this specific order.
 *
 * In other words, it is the value of the component if the author would have not
 * overridden it explicitly.
 *
 * @param {Component} component Component to calculate the value of.
 * @param {Element}   source    Element owning the component.
 * @return                      A pair with the computed value for the component of source and a flag indicating if the component is completely inherited from other sources (`true`) or genuinely owned by the source entity (`false`).
 */
function getImplicitValue(component, source) {
  var isInherited = false;
  var value = (isSingleProperty(component.schema) ? _single : _multi)();
  return [value, isInherited];

  function _single() {
    var value = getMixedValue(component, null, source);
    if (value === undefined) {
      value = getInjectedValue(component, null, source);
    }
    if (value !== undefined) {
      isInherited = true;
    } else {
      value = getDefaultValue(component, null);
    }
    if (value !== undefined) {
      // XXX: This assumes parse is idempotent
      return component.schema.parse(value);
    }
    return value;
  }

  function _multi() {
    var value;

    // Set isInherited to true if the component is inherited from primitive defaultComponents and is empty object
    var defaults = source.defaultComponentsFromPrimitive;
    isInherited =
      defaults &&
      /* eslint-disable-next-line no-prototype-builtins */
      defaults.hasOwnProperty(component.attrName) &&
      Object.keys(defaults[component.attrName]).length === 0;
    Object.keys(component.schema).forEach(function (propertyName) {
      var propertyValue = getFromAttribute(component, propertyName, source);
      if (propertyValue === undefined) {
        propertyValue = getMixedValue(component, propertyName, source);
      }
      if (propertyValue === undefined) {
        propertyValue = getInjectedValue(component, propertyName, source);
      }
      if (propertyValue !== undefined) {
        isInherited = isInherited || true;
      } else {
        propertyValue = getDefaultValue(component, propertyName);
      }
      if (propertyValue !== undefined) {
        var parse = component.schema[propertyName].parse;
        value = value || {};
        // XXX: This assumes parse is idempotent
        value[propertyName] = parse(propertyValue);
      }
    });

    return value;
  }
}

/**
 * Gets the value for the component's property coming from a primitive
 * attribute.
 *
 * Primitives have mappings from attributes to component's properties.
 * The function looks for a present attribute in the source element which
 * maps to the specified component's property.
 *
 * @param  {Component} component    Component to be found.
 * @param  {string}    propertyName Component's property to be found.
 * @param  {Element}   source       Element owning the component.
 * @return {any}                    The value of the component's property coming
 *                                  from the primitive's attribute if any or
 *                                  `undefined`, otherwise.
 */
function getFromAttribute(component, propertyName, source) {
  var value;
  var mappings = source.mappings || {};
  var route = component.name + '.' + propertyName;
  var primitiveAttribute = findAttribute(mappings, route);
  if (primitiveAttribute && source.hasAttribute(primitiveAttribute)) {
    value = source.getAttribute(primitiveAttribute);
  }
  return value;

  function findAttribute(mappings, route) {
    var attributes = Object.keys(mappings);
    for (var i = 0, l = attributes.length; i < l; i++) {
      var attribute = attributes[i];
      if (mappings[attribute] === route) {
        return attribute;
      }
    }
    return undefined;
  }
}

/**
 * Gets the value for a component or component's property coming from mixins of
 * an element.
 *
 * If the component or component's property is not provided by mixins, the
 * functions will return `undefined`.
 *
 * @param {Component} component      Component to be found.
 * @param {string}    [propertyName] If provided, component's property to be
 *                                   found.
 * @param {Element}   source         Element owning the component.
 * @return                           The value of the component or components'
 *                                   property coming from mixins of the source.
 */
function getMixedValue(component, propertyName, source) {
  var value;
  var reversedMixins = source.mixinEls.toReversed();
  for (var i = 0; value === undefined && i < reversedMixins.length; i++) {
    var mixin = reversedMixins[i];
    /* eslint-disable-next-line no-prototype-builtins */
    if (mixin.attributes.hasOwnProperty(component.attrName)) {
      if (!propertyName) {
        value = mixin.getAttribute(component.attrName);
      } else {
        value = mixin.getAttribute(component.attrName)[propertyName];
      }
    }
  }
  return value;
}

/**
 * Gets the value for a component or component's property coming from primitive
 * defaults.
 *
 * @param {Component} component      Component to be found.
 * @param {string}    [propertyName] If provided, component's property to be
 *                                   found.
 * @param {Element}   source         Element owning the component.
 * @return                           The component value coming from the
 *                                   injected default components of source.
 */
function getInjectedValue(component, propertyName, source) {
  var value;
  var primitiveDefaults = source.defaultComponentsFromPrimitive;
  if (
    primitiveDefaults &&
    /* eslint-disable-next-line no-prototype-builtins */
    primitiveDefaults.hasOwnProperty(component.attrName)
  ) {
    if (!propertyName) {
      value = primitiveDefaults[component.attrName];
    } else {
      value = primitiveDefaults[component.attrName][propertyName];
    }
  }
  return value;
}

/**
 * Gets the value for a component or component's property coming from schema
 * defaults.
 *
 * @param {Component} component      Component to be found.
 * @param {string}    [propertyName] If provided, component's property to be
 *                                   found.
 * @return                           The component value coming from the schema
 *                                   default.
 */
function getDefaultValue(component, propertyName) {
  if (!propertyName) {
    return component.schema.default;
  }
  return component.schema[propertyName].default;
}

/**
 * Returns the minimum value for a component with an implicit value to equal a
 * reference value. A `null` optimal value means that there is no need for an
 * update since the implicit value and the reference are equal.
 *
 * @param {Component} component Component of the computed value.
 * @param {any}       implicit  The implicit value of the component.
 * @param {any}       reference The reference value for the component.
 * @return                      the minimum value making the component to equal
 *                              the reference value.
 */
function getOptimalUpdate(component, implicit, reference) {
  if (equal(implicit, reference)) {
    return null;
  }
  if (isSingleProperty(component.schema)) {
    return reference;
  }
  var optimal = {};
  Object.keys(reference).forEach(function (key) {
    var needsUpdate = !equal(reference[key], implicit[key]);
    if (needsUpdate) {
      optimal[key] = reference[key];
    }
  });
  return optimal;
}

/**
 * @param {Schema} schema Component's schema to test if it is single property.
 * @return                `true` if component is single property.
 */
function isSingleProperty(schema) {
  return AFRAME.schema.isSingleProperty(schema);
}

/**
 * Detect element's Id collision and returns a valid one
 * @param  {string} baseId Proposed Id
 * @return {string}        Valid Id based on the proposed Id
 */
function getUniqueId(baseId) {
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

  while (document.getElementById(baseId + '-' + i)) {
    i++;
  }

  return baseId + '-' + i;
}

export function getComponentClipboardRepresentation(entity, componentName) {
  entity.flushToDOM();
  const data = entity.getDOMAttribute(componentName);
  if (!data) {
    return componentName;
  }

  const schema = entity.components[componentName].schema;
  const attributes = stringifyComponentValue(schema, data);
  return `${componentName}="${attributes}"`;
}

/**
 * Helper function to add a new entity with a list of components
 * @param  {object} definition Entity definition to add, only components is required:
 *   {element: 'a-entity', id: "hbiuSdYL2", class: "box", components: {geometry: 'primitive:box'}}
 * @return {Element} Entity created
 */
export function createEntity(definition, cb) {
  const entity = document.createElement(definition.element || 'a-entity');
  if (definition.id) {
    entity.id = definition.id;
  }

  if (definition.class) {
    entity.setAttribute('class', definition.class);
  }

  // load default attributes
  for (let attr in definition.components) {
    entity.setAttribute(attr, definition.components[attr]);
  }

  // Ensure the components are loaded before update the UI
  entity.addEventListener(
    'loaded',
    () => {
      Events.emit('entitycreated', entity);
      cb(entity);
    },
    { once: true }
  );

  AFRAME.scenes[0].appendChild(entity);

  return entity;
}
