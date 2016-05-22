/* global aframeCore */
var UI = require('../../../lib/vendor/ui.js'); // @todo will be replaced with the npm package

function MenuStatus (editor) {
  var container = new UI.Panel();
  container.setClass('menu right');

  var version = new UI.Text('aframe v' + aframeCore.version);

  version.setClass('title');
  version.setOpacity(0.5);
  container.add(version);

  return container;
}

module.exports = MenuStatus;
