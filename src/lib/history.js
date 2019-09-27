const Events = require('./Events');

const updates = {};

/**
 * Store change to export.
 *
 * payload: entity, component, property, value.
 */
Events.on('entityupdate', payload => {
  let value = payload.value;

  const entity = payload.entity;
  updates[entity.id] = updates[entity.id] || {};

  const component = AFRAME.components[payload.component];
  if (component) {
    if (payload.property) {
      updates[entity.id][payload.component] =
        updates[entity.id][payload.component] || {};
      if (component.schema[payload.property]) {
        value = component.schema[payload.property].stringify(payload.value);
      }
      updates[entity.id][payload.component][payload.property] = value;
    } else {
      value = component.schema.stringify(payload.value);
      updates[entity.id][payload.component] = value;
    }
  }
});

module.exports = {
  updates: updates
};
