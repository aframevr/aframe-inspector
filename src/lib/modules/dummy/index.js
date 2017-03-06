var registerModule = require('../modules').registerModule;

registerModule('dummy', {
  init: function () {
    this.registerShortcut(80, () => {
      this.toggleActive();
    }, false);
  },
  activate: function () {
    console.log('Module activated');
  },
  deactivate: function () {
    console.log('Module deactivated');
  }
});
