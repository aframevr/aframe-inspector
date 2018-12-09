const Events = require('./Events');

const updates = {}

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
      const componentUpdate = updates[entity.id][payload.component] || {};
      value = component.schema[property].stringify(payload.value);
      componentUpdate[payload.property] = componentUpdate;
    } else {
      value = component.schema.stringify(payload.value);
      updates[entity.id][payload.component] = value;
    }
  }
});

module.exports = {
  updates: updates
};
