/**
 * Update the entity component value
 * @param  {Element} entity   Entity to modify
 * @param  {string} component     Name of the component
 * @param  {string} property Property name
 * @param  {string|number} value    New value
 */
function handleEntityChange (entity, componentName, propertyName, value) {
  //console.log(entity, componentName, propertyName, value);
  if (propertyName) {
    if (!value) {
      var parameters = entity.getAttribute(componentName);
      delete parameters[propertyName];
      entity.setAttribute(componentName, parameters);
    } else {
      entity.setAttribute(componentName, propertyName, value);
    }
  } else {
    if (!value) {
      entity.removeAttribute(componentName);
    } else {
      entity.setAttribute(componentName, value);
    }
  }
}

module.exports = handleEntityChange;
