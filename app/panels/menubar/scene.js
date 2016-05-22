/* global URL Blob */
var UI = require('../../../lib/vendor/ui.js'); // @todo will be replaced with the npm package
var Clipboard = require('clipboard');
var Exporter = require('../../exporter.js');

function MenuScene (editor) {
  var container = new UI.Panel();
  container.setClass('menu');

  var title = new UI.Panel();
  title.setClass('title');
  title.setTextContent('Scene');
  container.add(title);

  var options = new UI.Panel();
  options.setClass('options');
  container.add(options);

  // --------------------------------------------
  // New
  // --------------------------------------------
/*  var option = new UI.Row();
  option.setClass('option');
  option.setTextContent('New');
  option.onClick(function () {
    if (window.confirm('Any unsaved data will be lost. Are you sure?')) {
      editor.clear();
    }
  });
  options.add(option);
*/

  // --------------------------------------------
  // Save HTML
  // --------------------------------------------
  var option = new UI.Row();
  option.setClass('option');
  option.setTextContent('Save HTML');
  option.onClick(function () {
    saveString(Exporter.generateHtml(), 'ascene.html');
  });
  options.add(option);

  // --------------------------------------------
  // Save HTML
  // --------------------------------------------
  option = new UI.Row();
  option.setClass('option');
  option.setTextContent('Copy to clipboard');
  option.setId('copy-scene');
  options.add(option);

  var clipboard = new Clipboard('#copy-scene', {
    text: function (trigger) {
      return Exporter.generateHtml();
    }
  });

  //
  var link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link); // Firefox workaround, see #6594
  function save (blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'data.json';
    link.click();
    // URL.revokeObjectURL(url); breaks Firefox...
  }

  function saveString (text, filename) {
    save(new Blob([ text ], { type: 'text/plain' }), filename);
  }

  return container;
}

module.exports = MenuScene;
