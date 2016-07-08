var React = require('react');
var ReactDOM = require('react-dom');
var Events = require('../lib/Events.js');
var Editor = require('../lib/editor');

import AttributesSidebar from './attributes/AttributesSidebar';
import {MenuWidget} from './menu/Menu';
import ModalTextures from './modals/ModalTextures';
import SceneGraph from './SceneGraph';

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

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorEnabled: true, isModalTexturesOpen: false};
  }

  componentDidMount() {
    // Create an observer to notify the changes in the scene
    var target = document.querySelector('a-scene');
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        Events.emit('sceneModified');
      });
    });
    var config = { attributes: true, childList: true, characterData: true }
    observer.observe(target, config);

    Events.on('openTexturesModal', function(textureOnClose){
      this.setState({isModalTexturesOpen: true, textureOnClose: textureOnClose});
    }.bind(this));
  }

  toggleEditor = () => {
    this.setState({editorEnabled: !this.state.editorEnabled}, function(){
      if (this.state.editorEnabled)
        editor.enable();
      else
        editor.disable();
      //Events.emit('editorModeChanged', this.state.editorEnabled);
    });
  }

  onModalTextureOnClose = value => {
    this.setState({isModalTexturesOpen: false});
    if (this.state.textureOnClose) {
      this.state.textureOnClose(value);
    }
  }

  openModal = () => {
    this.setState({isModalTexturesOpen: true});
  }

  render() {
    var scene = document.querySelector('a-scene');
    var toggleText = this.state.editorEnabled;
    var textureDialogOpened = this.state.isModalTexturesOpen;
    return (
      <div>
        <div id="editor" className={this.state.editorEnabled ? '' : 'hidden'}>
          <ModalTextures ref="modaltextures" isOpen={textureDialogOpened} onClose={this.onModalTextureOnClose}/>
          <MenuWidget/>
          <div id="sidebar-left">
            <div className="tab">SCENEGRAPH</div>
            <SceneGraph scene={scene}/>
          </div>
          <AttributesSidebar/>
        </div>
        <a href="#" className="toggle-edit" onClick={this.toggleEditor}>{this.state.editorEnabled?'Exit':'Edit'}</a>
      </div>
    )
  }
}

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
