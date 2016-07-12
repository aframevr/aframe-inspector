/**
 * Get the list of modified properties
 * @param  {Element} entity        Entity where the component belongs
 * @param  {string} componentName Component name
 * @return {object}               List of modified properties with their value
 */
function getModifiedProperties (entity, componentName) {
  var data = entity.components[componentName].data;
  var defaultData = entity.components[componentName].schema;
  var diff = {};
  for (var key in data) {
    var defaultValue = defaultData[key].default;
    var currentValue = data[key];

    // Some parameters could be null and '' like mergeTo
    if (!(isEmpty(currentValue) && isEmpty(defaultValue)) &&
      currentValue !== defaultValue) {
      diff[key] = data[key];
    }
  }
  return diff;
}

/**
 * [getClipboardRepresentation description]
 * @param  {[type]} entity        [description]
 * @param  {[type]} componentName [description]
 * @return {[type]}               [description]
 */
export function getClipboardRepresentation (entity, componentName) {
  var diff = getModifiedProperties(entity, componentName);
  return AFRAME.utils.styleParser.stringify(diff);
}

function isEmpty (string) {
  return string === null || string === '';
}
