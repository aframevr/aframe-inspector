/* global aframeCore aframeEditor */
var UI = require('../../lib/vendor/ui.js'); // @todo will be replaced with the npm package

module.exports = {
  widgets: {},
  knownWidgetsType: ['select', 'boolean', 'number', 'int', 'string', 'map', 'color', 'vec3'],

  /**
   * [updateWidgetValue description]
   * @param  {[type]} id    [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  updateWidgetValue: function (id, value) {
    if (this.widgets[id]) {
      this.widgets[id].setValue(value);
      return true;
    }
    return false;
  },

  /**
   * Given an propertySchema it will returns the infered by the default value in case
   * that 'type' attribute is not defined
   * @param  {object} propertySchema JSON schema for the attribute
   * @return {string}                 Property type
   */
  getPropertyType: function (propertySchema) {
    var defaultValue = propertySchema.default;
    if (propertySchema.oneOf) {
      return 'select';
    } else if (propertySchema.type && this.knownWidgetsType.indexOf(propertySchema.type) !== -1) {
      return propertySchema.type;
    } else {
      switch (typeof defaultValue) {
        case 'boolean':
          return 'boolean';
        case 'number':
          return 'number';
        case 'object':
          return 'vec3';
        case 'string':
          return (defaultValue.indexOf('#') === -1) ? 'string' : 'color';
        default:
          console.warn('Unknown attribute', propertySchema);
          return null;
      }
    }
  },

  /**
   * Creates and returns a widget based on the type of the attribute
   * If a schema is provided it's used to set min/max values or populate the combobox values.
   * @param {string} componentName   Name of the component that has this attribute (e.g: 'geometry')
   * @param {string} propertyName   Property name in the component (e.g: 'primitive')
   * @param {string} property        Property name in case of multivalues attributes (e.g: 'x')
   * @param {string} type            Type of the widget to generate (e.g: 'checkbox')
   * @param {JSON} propertySchema [Optional] JSON with the schema definition of the attribute.
   * @return {UI.Widget} Returns an UI.js widget based on the type and schema of the attribute.
   */
  getWidgetFromProperty: function (componentName, propertyName, property, onUpdateEntityValue, propertySchema) {
    var widget = null;
    if (typeof propertySchema === 'undefined') {
      propertySchema = {};
    } else if (typeof propertySchema !== 'object') {
      console.error(componentName, propertyName, property, propertySchema);
    }

    var type = this.getPropertyType(propertySchema);
    var onChange = null;

    switch (type) {
      case 'select':
        var options = {};
        // Convert array to object
        for (var key in propertySchema.oneOf) {
          options[propertySchema.oneOf[key]] = propertySchema.oneOf[key];
        }

        if (componentName === 'material' && property === 'shader') {
          // @fixme Better access to shaders
          for (var shader in aframeEditor.editor.shaderLoader.shaders) {
            options[shader] = shader;
          }

          onChange = function (event) {
            aframeEditor.editor.shaderLoader.addShaderToScene(event.target.options[event.target.selectedIndex].value, function () {
              onUpdateEntityValue(event, componentName, propertyName, property);
              aframeEditor.editor.signals.generateComponentsPanels.dispatch();
            });
          };
        }

        widget = new UI.Select().setOptions(options);
        break;
      case 'boolean':
        widget = new UI.Checkbox().setWidth('50px');
        break;
      case 'number':
        widget = new UI.Number().setWidth('50px');
        break;
      case 'int':
        widget = new UI.Number().setWidth('50px').setPrecision(0);
        break;
      case 'string':
      widget = new UI.Texture();
//        widget = new UI.Input('').setWidth('50px');
        break;
      case 'color':
        widget = new UI.Color().setWidth('50px');
        break;
      case 'map':
        widget = new UI.Texture();
        break;
      case 'vec3':
        widget = new UI.Vector3().setWidth('150px');
        break;
      default:
        console.warn('Unknown component type', componentName, propertyName, property, type);
        widget = new UI.Input('');
    }
    if (propertySchema.hasOwnProperty('min')) {
      widget.min = propertySchema.min;
    }
    if (propertySchema.hasOwnProperty('max')) {
      widget.max = propertySchema.max;
    }
    widget.schema = propertySchema;

    if (onChange) {
      if (widget.onChange)
        widget.onChange(onChange);
      else {
        // For polymer
        widget.addEventListener( 'change', onChange, false );
      }
    } else {
      if (widget.onChange) {
        widget.onChange(function (event) {
          onUpdateEntityValue(event, componentName, propertyName, property);
        });
      } else {
        widget.addEventListener( 'change', function (event) {
          onUpdateEntityValue(event, componentName, propertyName, property);
        }, false );

      }
    }

    // Generate an unique ID for this attribute (e.g: geometry.primitive)
    // and save it on the widgets variable so we could easily access to it in the following functions
    var id = propertyName ? componentName + '.' + propertyName + '.' + property : property ? (componentName + '.' + property) : componentName;
    widget.setId(id);
    widget.setValue(propertySchema.default);

    this.widgets[id] = widget;
    return widget;
  },

  /**
   * Update the widgets visibility based on the 'if' attribute from theirs attribute' schema
   * @param  {Element} entity Entity currently selected
   */
  updateWidgetVisibility: function (entity) {
    for (var componentName in entity.components) {
      var properties = aframeCore.components[componentName].schema;
      for (var property in properties) {
        var id = componentName + '.' + property;
        var widget = this.widgets[id];
        if (widget && widget.propertyRow) {
          var visible = true;
          if (widget.schema.if) {
            for (var condition in widget.schema.if) {
              var ifWidget = this.widgets[componentName + '.' + condition];
              if (widget.schema.if[condition].indexOf(ifWidget.getValue()) === -1) {
                visible = false;
              }
            }
          }
          if (visible) {
            widget.propertyRow.show();
          } else {
            widget.propertyRow.hide();
          }
        }
      }
    }
  }

};
