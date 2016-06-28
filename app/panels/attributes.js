/**
 * Add component to the entity
 * @param {Element} entity        Entity
 * @param {string} componentName Component name
 */
function addComponentToEntity (entity, componentName) {
  entity.setAttribute(componentName, '');
  generateComponentsPanels(entity);
  updateUI(entity);
}

/**
 * Generate a row including a combobox with the available components to add to
 * the current entity
 */
function generateAddComponentRow () {
  var container = new UI.CollapsiblePanel();

  container.addStatic(new UI.Text('COMPONENTS'));
  container.add(new UI.Break());

  var componentsRow = new UI.Row();
  container.add(componentsRow);

  var componentsOptions = {};
  for (var name in aframeCore.components) {
    if (commonComponents.indexOf(name) === -1) {
      componentsOptions[name] = name;
    }
  }

  for (name in editor.componentLoader.components) {
    componentsOptions[name] = name;
  }

  componentsList = new UI.Select().setId('componentlist').setOptions(componentsOptions).setWidth('150px');

  componentsRow.add(new UI.Text('Add').setWidth('90px'));
  componentsRow.add(componentsList);
  var button = new UI.Button('+').onClick(function () {
    editor.componentLoader.addComponentToScene(componentsList.getValue(), function () {
      // Add the selected component from the combobox to the current active entity
      addComponentToEntity(editor.selected.el, componentsList.getValue());
    });
  });
  componentsRow.add(button.setWidth('20px'));
  return container;
}

/**
 * Update the UI widgets based on the current entity & components values
 * @param  {Element} entity Entity currently selected
 */
function updateUI (entity) {
  if (ignoreComponentsChange) {
    return;
  }

  objectType.setValue(entity.tagName);
  objectId.setValue(entity.id);

  // Disable the components already used form the list of available
  // components to add to this entity
  var availableComponents = componentsList.dom.querySelectorAll('option');
  for (var i = 0; i < availableComponents.length; i++) {
    availableComponents[i].disabled = entity.getAttribute(availableComponents[i].value);
  }

  // Set the common properties & components to default as they're not recreated
  // as the entity changed
  for (i = 0; i < commonComponents.length; i++) {
    var componentName = commonComponents[i];
    var component = aframeCore.components[componentName];
    if (component.schema.hasOwnProperty('default')) {
      WidgetsFactory.updateWidgetValue(componentName, component.schema.default);
    } else {
      for (var propertyName in component.schema) {
        WidgetsFactory.updateWidgetValue(componentName + '.' + propertyName, component.schema[propertyName].default);
      }
    }
  }
  // Set the widget values for each components' attributes
  var entityComponents = Array.prototype.slice.call(entity.attributes);
  entityComponents.forEach(function (component) {
    var properties = entity.getAttribute(component.name);

    // The attributeIf the properties refer to a single value or multivalue like position {x:0, y:0, z:0}
    if (WidgetsFactory.widgets[component.name] || typeof properties !== 'object') {
      WidgetsFactory.updateWidgetValue(component.name, properties);
    } else {
      // Some components has multiple attributes like geometry {primitive: box}
      for (var property in properties) {
        var id = component.name + '.' + property;
        WidgetsFactory.updateWidgetValue(id, properties[property]);
      }
    }
  });
