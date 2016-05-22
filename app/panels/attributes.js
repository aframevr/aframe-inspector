/* global aframeCore */
var UI = require('../../lib/vendor/ui.js'); // @todo will be replaced with the npm package
var WidgetsFactory = require('./widgetsfactory.js'); // @todo will be replaced with the npm package

function trim (s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, '');
  s = s.replace(/[ ]{2,}/gi, ' ');
  s = s.replace(/\n /, '\n');
  return s;
}

function Attributes (editor) {
  var objectId, objectType, objectCustomRow;
  var componentsList, mixinsContainer;
  var ignoreComponentsChange = false;
  var commonComponents = ['position', 'rotation', 'scale', 'visible'];

  /**
   * Update the entity component value
   * @param  {Element} entity   Entity to modify
   * @param  {string} component     Name of the component
   * @param  {string} property Property name
   * @param  {string|number} value    New value
   */
  function handleEntityChange (entity, componentName, propertyName, value) {
    console.info(entity, componentName, propertyName, value);
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

  function generateMixinsPanel () {
    var container = new UI.CollapsiblePanel();

    container.addStatic(new UI.Text('Mixins').setTextTransform('uppercase'));
    container.add(new UI.Break());

    mixinsContainer = new UI.Row();
    container.add(mixinsContainer);

    var mixins = document.querySelectorAll('a-mixin');
    var mixinsOptions = {};

    for (var i = 0; i < mixins.length; i++) {
      mixinsOptions[ mixins[i].id ] = mixins[i].id;
    }

    var mixinsList = new UI.Select().setId('componentlist').setOptions(mixinsOptions).setWidth('150px');
    container.add(new UI.Text('Add').setWidth('90px'));
    container.add(mixinsList);
    var button = new UI.Button('+').onClick(function () {
      editor.selected.el.setAttribute('mixin', trim(editor.selected.el.getAttribute('mixin') + ' ' + mixinsList.getValue()));
    });
    container.add(button.setWidth('20px'));

    var newMixin = new UI.Button('New');
    newMixin.onClick(function () {
      window.alert('This button should create a mixin based on the current entity components values');
    });
    container.add(newMixin);

    return container;
  }

  /**
   * Generates a container with the common attributes and components for each entity:
   *   - type
   *   - ID
   *   - position
   *   - rotation
   *   - scale
   *   - visible
   * @return {UI.CollapsiblePanel} Panel containing all the widgets
   */
  function generateCommonComponentsPanel () {
    var container = new UI.CollapsiblePanel();

    container.addStatic(new UI.Text('Common attributes').setTextTransform('uppercase'));
    container.add(new UI.Break());

    // type
    var objectTypeRow = new UI.Row();
    objectType = new UI.Text();

    objectTypeRow.add(new UI.Text('Type').setWidth('90px'));
    objectTypeRow.add(objectType);

    container.add(objectTypeRow);

    // ID
    var objectIdRow = new UI.Row();
    objectId = new UI.Input().setWidth('150px').setFontSize('12px').onChange(function () {
      handleEntityChange(editor.selected.el, 'id', null, objectId.getValue());
      editor.signals.sceneGraphChanged.dispatch();
    });

    objectIdRow.add(new UI.Text('ID').setWidth('90px'));
    objectIdRow.add(objectId);
    container.add(objectIdRow);

    // Add the parameter rows for the common components
    for (var i = 0; i < commonComponents.length; i++) {
      container.add(getPropertyRow(commonComponents[i], null, aframeCore.components[commonComponents[i]].schema));
    }

    return container;
  }

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

    // Update mixins list
    mixinsContainer.dom.innerHTML = '';
    entity.mixinEls.forEach(function (mixin) {
      var name = new UI.Text(mixin.id).setWidth('160px').setFontSize('12px');
      mixinsContainer.add(name);

      var edit = new UI.Button('Edit').setDisabled(true);
      edit.setMarginLeft('4px');
      edit.onClick(function () {
        //  signals.editScript.dispatch( object, script );
      });
      mixinsContainer.add(edit);

      var remove = new UI.Button('Remove');
      remove.setMarginLeft('4px');
      remove.onClick(function () {
        entity.setAttribute('mixin', trim(entity.getAttribute('mixin').replace(mixin.id, '')));
      });
      mixinsContainer.add(remove);

      mixinsContainer.add(new UI.Break());
    });
    WidgetsFactory.updateWidgetVisibility(entity);
  }

  /**
   * Reset to default (clear) one entity's component
   * @param {Element} entity        Entity
   * @param {string} componentName Component name to clear
   */
  function setEmptyComponent (entity, componentName) {
    entity.setAttribute(componentName, '');
    generateComponentsPanels(entity);
    updateUI(entity);
    editor.signals.objectChanged.dispatch(entity.object3D);
  }

  /**
   * Generates a row containing the parameter label and its widget
   * @param {string} componentName   Component name
   * @param {string} propertyName   Property name
   * @param {object} propertySchema Property schema
   */
  function getPropertyRow (componentName, propertyName, propertySchema) {
    var propertyRow = new UI.Row();
    var panelName = propertyName || componentName;
    var label = new UI.Text(panelName);
    propertyRow.add(label);

    label.setWidth('120px');
    var newWidget = WidgetsFactory.getWidgetFromProperty(componentName, null, propertyName, updateEntityValue, propertySchema);
    newWidget.propertyRow = propertyRow;
    propertyRow.add(newWidget);

    return propertyRow;
  }

  /**
   * Generate an UI.CollapsiblePanel for each entity's component
   * @param  {Element} entity Current selected entity
   */
  function generateComponentsPanels (entity) {
    objectCustomRow.clear();

    for (var componentName in entity.components) {
      // Ignore the components that we've already included on the common attributes panel
      if (commonComponents.indexOf(componentName) !== -1) {
        continue;
      }

      var component = entity.components[componentName];

      // Add a context menu to delete or reset the component
      var objectActions = new UI.Select()
        .setId(componentName)
        .setPosition('absolute')
        .setRight('8px')
        .setFontSize('11px')
        .setOptions({
          'Actions': 'Actions',
          'Delete': 'Delete',
          'Clear': 'Clear'
        })
        .onClick(function (event) {
          event.stopPropagation(); // Avoid panel collapsing
        })
        .onChange(function (event, component) {
          var action = this.getValue();
          switch (action) {
            case 'Delete':
              entity.removeAttribute(this.getId());
              break;

            case 'Clear':
              setEmptyComponent(entity, this.getId());
              break;

            default:
              return;
          }
          this.setValue('Actions');
          generateComponentsPanels(entity);
          updateUI(entity);
          editor.signals.objectChanged.dispatch(entity.object3D);
        });

      // Collapsible panel with component name as title
      var container = new UI.CollapsiblePanel();
      container.addStatic(new UI.Text(componentName).setTextTransform('uppercase'), objectActions);
      container.add(new UI.Break());

      // Add a widget's row for each parameter on the component
      for (var propertyName in component.schema) {
        container.add(getPropertyRow(componentName, propertyName, component.schema[propertyName]));
      }

      container.add(new UI.Break());
      objectCustomRow.add(container);
    }
  }

  /**
   * Callback when a widget value is updated so we could update the entity attributes
   * @param  {EventTarget} event         Event generated by the onChange listener
   * @param  {string} componentName Component name being modified (eg: 'geometry')
   * @param  {string} attributeName Attribute name being modified (eg: 'primitive')
   * @param  {string} property      Property name, if any, being modified (eg: 'x')
   */
  function updateEntityValue (event, componentName, attributeName, property) {
    ignoreComponentsChange = true;
    var entity = editor.selected.el;
    var id = attributeName ? componentName + '.' + attributeName + '.' + property : property ? (componentName + '.' + property) : componentName;
    var widget = WidgetsFactory.widgets[id];

    handleEntityChange(entity, componentName, property, widget.getValue());

    WidgetsFactory.updateWidgetVisibility(entity);

    editor.signals.objectChanged.dispatch(entity.object3D);
    ignoreComponentsChange = false;
  }

  // Generate main attributes panel
  var container = new UI.Panel();
  container.setBorderTop('0');
  container.setPaddingTop('20px');
  container.setDisplay('none');

  // Add common attributes panel (type, id, position, rotation, scale, visible)
  container.add(generateCommonComponentsPanel());

  // Add common attributes panel (type, id, position, rotation, scale, visible)
  container.add(generateMixinsPanel());

  // Append the components list that the user can add to the selected entity
  container.add(generateAddComponentRow());

  // Empty row used to append the panels from each component
  objectCustomRow = new UI.Row();
  container.add(objectCustomRow);

  // Signal dispatchers
  editor.signals.entitySelected.add(function (entity) {
    if (entity) {
      container.show();
      generateComponentsPanels(entity);
      updateUI(entity);
    } else {
      container.hide();
    }
  });
  editor.signals.componentChanged.add(function (evt) {
    var entity = evt.detail.target;


    /*
    if (evt.detail.newData.shader && evt.detail.newData.shader !== evt.detail.oldData.shader) {
      aframeEditor.editor.shaderLoader.addShaderToScene(evt.detail.newData.shader, function () {
        entity.components.material.update(evt.detail.oldData);
        generateComponentsPanels(editor.selected.el);
        ignoreComponentsChange = false;
        updateUI(entity);
        editor.signals.objectChanged.dispatch(entity.object3D);
      });
      return;
    }
    */

    updateUI(entity);
    editor.signals.objectChanged.dispatch(entity.object3D);
  });

  editor.signals.generateComponentsPanels.add(function () {
    generateComponentsPanels(editor.selected.el);
    ignoreComponentsChange = false;
    updateUI(editor.selected.el);
  });

  return container;
}

module.exports = Attributes;
