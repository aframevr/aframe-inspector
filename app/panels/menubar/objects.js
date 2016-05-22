var UI = require('../../../lib/vendor/ui.js'); // @todo will be replaced with the npm package

function MenuObjects (editor) {
  var container = new UI.Panel();
  container.setClass('menu');

  var title = new UI.Panel();
  title.setClass('title');
  title.setTextContent('Add');
  container.add(title);

  var options = new UI.Panel();
  options.setClass('options');
  container.add(options);

  // --------------------------------------------
  // New
  // --------------------------------------------

  /**
   * Helper function to add a new entity with a list of components
   * @param  {object} definition Entity definition to add:
   *                             {element: 'a-entity', components: {geometry: 'primitive:box'}}
   * @return {Element}            Entity created
   */
  function createNewEntity (definition) {
    var entity = document.createElement(definition.element);

    // load default attributes
    for (var attr in definition.components) {
      entity.setAttribute(attr, definition.components[attr]);
    }

    // Ensure the components are loaded before update the UI
    entity.addEventListener('loaded', function () {
      editor.addEntity(entity);
    });

    editor.sceneEl.appendChild(entity);

    return entity;
  }

  // List of definitions to add in the menu. A line break is added everytime 'group' attribute changes.
  var primitivesDefinitions = {
    'Entity': {group: 'entities', element: 'a-entity', components: {}},

    'Box': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:box', material: 'color:#f00'}},
    'Sphere': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:sphere', material: 'color:#ff0'}},
    'Cylinder': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:cylinder', material: 'color:#00f'}},
    'Plane': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:plane', material: 'color:#fff'}},
    'Torus': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:torus', material: 'color:#0f0'}},
    'TorusKnot': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:torusKnot', material: 'color:#f0f'}},
    'Circle': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:circle', material: 'color:#f0f'}},
    'Ring': {group: 'primitives', element: 'a-entity', components: {geometry: 'primitive:ring', material: 'color:#0ff'}},

    'Ambient': {group: 'lights', element: 'a-entity', components: {light: 'type:ambient'}},
    'Directional': {group: 'lights', element: 'a-entity', components: {light: 'type:directional'}},
    'Hemisphere': {group: 'lights', element: 'a-entity', components: {light: 'type:hemisphere'}},
    'Point': {group: 'lights', element: 'a-entity', components: {light: 'type:point'}},
    'Spot': {group: 'lights', element: 'a-entity', components: {light: 'type:spot'}},

    'Camera': {group: 'cameras', element: 'a-entity', components: {camera: ''}}
  };

  var prevGroup = null;
  for (var definition in primitivesDefinitions) {
    // Add a line break if the group changes
    if (prevGroup === null) {
      prevGroup = primitivesDefinitions[definition].group;
    } else if (prevGroup !== primitivesDefinitions[definition].group) {
      prevGroup = primitivesDefinitions[definition].group;
      options.add(new UI.HorizontalRule());
    }

    // Generate a new option in the menu
    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent(definition);
    option.dom.onclick = (function (def) {
      return function () {
        createNewEntity(def);
      };
    })(primitivesDefinitions[definition]);
    options.add(option);
  }

  return container;
}

module.exports = MenuObjects;
