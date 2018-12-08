const Events = require('./Events');

const updates = {}

/**
 * Store change to export.
 *
 * payload: component, entity, value.
 */
Events.on('entityupdate', payload => {
  let value = payload.value;

  const entity = payload.entity;
  updates[entity.id] = updates[entity.id] || {};

  const component = AFRAME.components[payload.componentName];
  if (component) {
    if (payload.propertyName) {
      value = component.schema[propertyName].stringify(payload.value);
    } else {
      value = component.schema.stringify(payload.value);
    }
  }

  updates[entity.id][payload.component] = value;
});

module.exports = {
  updates: updates
};
