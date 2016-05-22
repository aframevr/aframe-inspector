var UI = require('../../lib/vendor/ui.js'); // @todo will be replaced with the npm package
var SceneGraph = require('./scenegraph');
var Attributes = require('./attributes');

function Sidebar (editor) {
  var container = new UI.Panel();
  container.setId('sidebar');

  // @todo This must taken out from here and put in another panel
  // -------------------------------------
  var buttons = new UI.Panel();
  container.add(buttons);

  // translate / rotate / scale
  var translate = new UI.Button('translate').onClick(function () {
    editor.signals.transformModeChanged.dispatch('translate');
  });
  buttons.add(translate);

  var rotate = new UI.Button('rotate').onClick(function () {
    editor.signals.transformModeChanged.dispatch('rotate');
  });
  buttons.add(rotate);

  var scale = new UI.Button('scale').onClick(function () {
    editor.signals.transformModeChanged.dispatch('scale');
  });
  buttons.add(scale);
  // -------------------------------------

  var tabs = new UI.Div();
  tabs.setId('tabs');

  var sceneTab = new UI.Text('SCENE').onClick(onClick);
  var assetsTab = new UI.Text('ASSETS').onClick(onClick);

  tabs.add(sceneTab, assetsTab);
  container.add(tabs);

  function onClick (event) {
    select(event.target.textContent);
  }

  this.sceneGraph = new SceneGraph(editor);
  this.attributes = new Attributes(editor);

  var scene = new UI.Span().add(
    this.sceneGraph,
    this.attributes
  );

  container.add(scene);

  function select (section) {
    sceneTab.setClass('');
    assetsTab.setClass('');

    scene.setDisplay('none');
    // assets.setDisplay('none');

    switch (section) {
      case 'SCENE':
        sceneTab.setClass('selected');
        scene.setDisplay('');
        break;
      case 'ASSETS':
        assetsTab.setClass('selected');
        // assets.setDisplay('');
        break;
    }
  }

  select('SCENE');

  return container;
}

module.exports = Sidebar;
