require('./css/main.css');
require('./css/light.css');
require('./css/custom.css');
require('./css/toolbar.css');

var ToolPanel = require('./tools');
var Sidebar = require('./sidebar.js');
var Menubar = require('./menubar/index.js');
var UI = require('../../lib/vendor/ui.js'); // @todo will be replaced with the npm package

function Panels (editor) {
  this.toolPanel = new ToolPanel(editor);
  document.body.appendChild(this.toolPanel.el);

  this.sidebar = new Sidebar(editor);
  this.sidebar.hide();
  document.body.appendChild(this.sidebar.dom);

  this.menubar = new Menubar(editor);
  this.menubar.hide();
  document.body.appendChild(this.menubar.dom);

  this.modal = new UI.Modal();
  document.body.appendChild(this.modal.dom);
/*
  var attributes = document.createElement('ui-properties');
  attributes.id = "attributes";
  document.body.appendChild(attributes);
  attributes.setEntity(document.getElementById('greenBox'));
  attributes.set('entity',document.getElementById('greenBox'));
  document.getElementById('greenBox').addEventListener('componentchanged', function(evt){
    console.log(evt,document.getElementById('greenBox').components);
    for (var attribute in evt.detail.newData) {
      attributes.set('entity.components.'+evt.detail.name+'.data.'+attribute,document.getElementById('greenBox').components[evt.detail.name].data[attribute]);
    }
  });
  document.getElementById('greenBox').addEventListener('componentremoved',function(evt){
    attributes.set('entity.components', document.getElementById('greenBox').components);
    //attributes.set('entity.components.'+evt.detail.name+'.data.'+attribute,document.getElementById('greenBox').components[evt.detail.name].data[attribute]);
  });
*/

/*
  this.el = document.createElement('paper-button');
  this.el.setAttribute('raised','');
  this.el.classList.add('edit-button');
  this.el.innerHTML = 'Edit';
  this.el.addEventListener('click', this.onToggleClick.bind(this));
*/
  //document.body.appendChild();
}

module.exports = Panels;
