var UI = require('../../../lib/vendor/ui.js'); // @todo will be replaced with the npm package
var MenuObjects = require('./objects.js');
var MenuScene = require('./scene.js');
var MenuStatus = require('./status.js');
var MenuAssets = require('./assets.js');

function Menubar (editor) {
  var container = new UI.Panel();
  container.setId('menubar');

  container.add(new MenuScene(editor));
  container.add(new MenuObjects(editor));
  container.add(new MenuAssets(editor));

  container.add(new MenuStatus(editor));

  return container;
}

module.exports = Menubar;
