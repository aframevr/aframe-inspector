var Shortcuts = require('../shortcuts');

module.exports.registerModule = function registerModule (name, definition) {
  name = name.toLowerCase();
  console.log('Registering module: <%s>', name);

  var common = {
    status: {
      active: false
    },
    registerShortcut: function (keyCode, callback, mustBeActive) {
      Shortcuts.registerModuleShortcut(keyCode, callback, this.moduleName, mustBeActive);
    },
    toggleActive: function () {
      if (this.active) {
        this.deactivate();
      } else {
        this.activate();
      }
    },
    activate: function () {
      this.active = true;
      definition.activate.call(this);
    },
    deactivate: function () {
      this.active = false;
      definition.deactivate.call(this);
    }
  };

  var newModule = Object.assign({}, definition, common);

  AFRAME.INSPECTOR.modules[name] = newModule;
};
