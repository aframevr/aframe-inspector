require('../lib/vendor/ga');
var editor = require('../lib/editor.js');

import React from 'react';
import ReactDOM from 'react-dom';

const Events = require('../lib/Events.js');
const Editor = require('../lib/editor');
import ComponentsSidebar from './components/Sidebar';
import ModalTextures from './modals/ModalTextures';
import SceneGraph from './scenegraph/SceneGraph';
import ToolBar from './ToolBar';

import '../css/main.css';

// Megahack to include font-awesome.
injectCSS('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
injectCSS('https://fonts.googleapis.com/css?family=Roboto:400,300,500');

export default class Main extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      editorEnabled: true,
      isModalTexturesOpen: false
    };
  }

  componentDidMount () {
    // Create an observer to notify the changes in the scene
    var target = document.querySelector('a-scene');
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Events.emit('sceneModified');
      });
    });
    var config = {attributes: true, childList: true, characterData: true};
    observer.observe(target, config);

    Events.on('openTexturesModal', function (textureOnClose) {
      this.setState({isModalTexturesOpen: true, textureOnClose: textureOnClose});
    }.bind(this));

    Events.on('editorModeChanged', enabled => {
      this.setState({editorEnabled: enabled});
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

  toggleEdit = () => {
    if (this.state.editorEnabled) {
      editor.disable();
    } else {
      editor.enable();
    }
  }

  render () {
    var scene = document.querySelector('a-scene');
    var textureDialogOpened = this.state.isModalTexturesOpen;
    let editButton = <a className='toggle-edit' onClick={this.toggleEdit}>{(this.state.editorEnabled ? 'Back to Scene' : 'Inspect Scene')}</a>

    return (
      <div>
        {editButton}
        <div id='editor' className={this.state.editorEnabled ? '' : 'hidden'}>
          <ModalTextures ref='modaltextures' isOpen={textureDialogOpened}
            onClose={this.onModalTextureOnClose}/>
          <ToolBar/>
          <div id='sidebar-left'>
            <SceneGraph scene={scene}/>
          </div>
          <ComponentsSidebar/>
        </div>
      </div>
    );
  }
}

function injectCSS (url) {
  var link = document.createElement('link');
  link.href = url;
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.media = 'screen,print';
  link.setAttribute('data-aframe-editor', 'style');
  document.getElementsByTagName('head')[0].appendChild(link);
}

(function init () {
  var div = document.createElement('div');
  div.id = 'aframe-editor';
  div.setAttribute('data-aframe-editor', 'app');
  document.body.appendChild(div);
  window.addEventListener('editor-loaded', function () {
    ReactDOM.render(<Main/>, div);
  });
  AFRAME.inspector = editor;
})();
