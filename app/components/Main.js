var React = require('react');
var ReactDOM = require('react-dom');
var Menu = require('./menu/Menu');
var Scenegraph = require('./Scenegraph');
var Events = require('../lib/Events.js');
var Editor = require('../lib/editor');
var ModalTextures = require('./modals/ModalTextures');
var AttributesSidebar = require('./attributes/AttributesSidebar');

import "../css/main.css";
import "../css/dark.css";

function injectCSS(url) {
  var link = document.createElement('link');
  link.href = url;
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.media = 'screen,print';
  document.getElementsByTagName('head')[0].appendChild(link);
}

// Megahack to include font-awesome
// -------------
injectCSS('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
injectCSS('https://fonts.googleapis.com/css?family=Roboto:400,300,500');

var Main = React.createClass({
  getInitialState: function() {
    return {editorEnabled: true, isModalTexturesOpen: false};
  },
  toggleEditor: function() {
    this.setState({editorEnabled: !this.state.editorEnabled}, function(){
      if (this.state.editorEnabled)
        editor.enable();
      else
        editor.disable();
      //Events.emit('editorModeChanged', this.state.editorEnabled);
    });
  },
  componentDidMount: function() {
    Events.on('openTexturesModal', function(textureOnClose){
      this.setState({isModalTexturesOpen: true, textureOnClose: textureOnClose});
    }.bind(this));
  },
  deleteEntity: function() {
    if (editor.selectedEntity) {
      editor.selectedEntity.parentNode.removeChild(editor.selectedEntity);
      editor.selectEntity(null);
    }
    return false;
  },
  openModal: function() {
    this.setState({isModalTexturesOpen: true});
  },
  render: function() {
    var scene = document.querySelector('a-scene');
    var toggleText = this.state.editorEnabled;
    var textureDialogOpened = this.state.isModalTexturesOpen;
    return (
      <div>
        <div id="editor" className={this.state.editorEnabled ? '' : 'hidden'}>
          <ModalTextures ref="modaltextures" isOpen={textureDialogOpened} onClose={this.state.textureOnClose}/>
          <Menu/>
          <div id="sidebar-left">
            <div className="tab">SCENEGRAPH</div>
            <Scenegraph scene={scene}/>
            <div className="scenegraph-bottom">
              <a href="#" onClick={this.deleteEntity} className="button fa fa-trash-o"></a>
            </div>
          </div>
          <AttributesSidebar/>
        </div>
        <a href="#" className="toggle-edit" onClick={this.toggleEditor}>{this.state.editorEnabled?'Exit':'Edit'}</a>
      </div>
    )
  }
});

function init(){
  var div = document.createElement('div');
  div.id = "app";
  document.body.appendChild(div);
  window.addEventListener('editor-loaded', function(){
    ReactDOM.render(<Main />,document.getElementById('app'));
  });
  window.editor = new Editor();
}

init();
