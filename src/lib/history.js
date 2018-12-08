const Events = require('./Events');

const updates = {}

/**
 * Store change to export.
 *
 * payload: component, entity, value.
 */
Events.on('entityupdate', payload => {
  const entity = payload.entity;
  updates[entity.id] = updates[entity.id] || {};
  updates[entity.id][payload.component] = payload.value;
});

module.exports = {
  updates: updates
};
