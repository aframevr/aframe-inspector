/* global VERSION BUILD_TIMESTAMP COMMIT_HASH */
require('../lib/vendor/ga');
const INSPECTOR = require('../lib/inspector.js');

import React from 'react';
import ReactDOM from 'react-dom';

THREE.ImageUtils.crossOrigin = '';

const Events = require('../lib/Events.js');
import ComponentsSidebar from './components/Sidebar';
import ModalTextures from './modals/ModalTextures';
import ModalHelp from './modals/ModalHelp';
import SceneGraph from './scenegraph/SceneGraph';
import ToolBar from './ToolBar';
import {injectCSS} from '../lib/utils';

import '../css/main.css';

// Megahack to include font-awesome.
injectCSS('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
injectCSS('https://fonts.googleapis.com/css?family=Roboto:400,300,500');

export default class Main extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      inspectorEnabled: true,
      sceneEl: document.querySelector('a-scene'),
      entity: null,
      isModalTexturesOpen: false,
      visible: {
        scenegraph: true,
        attributes: true
      }
    };

    Events.on('togglesidebar', event => {
      if (event.which == 'all') {
        if (this.state.visible.scenegraph || this.state.visible.attributes) {
          this.state.visible.scenegraph = this.state.visible.attributes = false;
        } else {
          this.state.visible.scenegraph = this.state.visible.attributes = true;
        }
      } else if (event.which == 'attributes') {
        this.state.visible.attributes = !this.state.visible.attributes;
      } else if (event.which == 'scenegraph') {
        this.state.visible.scenegraph = !this.state.visible.scenegraph;
      }
      this.forceUpdate();

    });
  }

  componentDidMount () {
    // Create an observer to notify the changes in the scene
    var observer = new MutationObserver(function (mutations) {
      Events.emit('dommodified', mutations);
    });
    var config = {attributes: true, childList: true, characterData: true};
    observer.observe(this.state.sceneEl, config);

    Events.on('opentexturesmodal', function (selectedTexture, textureOnClose) {
      this.setState({selectedTexture: selectedTexture, isModalTexturesOpen: true, textureOnClose: textureOnClose});
    }.bind(this));

    Events.on('entityselected', entity => {
      this.setState({entity: entity});
    });

    Events.on('inspectormodechanged', enabled => {
      this.setState({inspectorEnabled: enabled});
    });

    Events.on('openhelpmodal', () => {
      this.setState({isHelpOpen: true});
    });
  }

  onCloseHelpModal = value => {
    this.setState({isHelpOpen: false});
  }

  onModalTextureOnClose = value => {
    this.setState({isModalTexturesOpen: false});
    if (this.state.textureOnClose) {
      this.state.textureOnClose(value);
    }
  }
/*
  openModal = () => {
    this.setState({isModalTexturesOpen: true});
  }
*/
  toggleEdit = () => {
    if (this.state.inspectorEnabled) {
      INSPECTOR.close();
    } else {
      INSPECTOR.open();
    }
  }

  render () {
    var scene = this.state.sceneEl;
    let editButton = <a className='toggle-edit' onClick={this.toggleEdit}>{(this.state.inspectorEnabled ? 'Back to Scene' : 'Inspect Scene')}</a>;
    const showScenegraph = this.state.visible.scenegraph ? null : <div className="toggle-sidebar left"><a onClick={() => {this.state.visible.scenegraph = true; this.forceUpdate()}} className='fa fa-plus' title='Show scenegraph'></a></div>;
    const showAttributes = !this.state.entity || this.state.visible.attributes ? null : <div className="toggle-sidebar right"><a onClick={() => {this.state.visible.attributes = true; this.forceUpdate()}} className='fa fa-plus' title='Show components'></a></div>;

    return (
      <div>
        {editButton}
        <div id='aframe-inspector-panels' className={this.state.inspectorEnabled ? '' : 'hidden'}>
          <ModalTextures ref='modaltextures' isOpen={this.state.isModalTexturesOpen} selectedTexture={this.state.selectedTexture} onClose={this.onModalTextureOnClose}/>
          <SceneGraph id='left-sidebar' scene={scene} selectedEntity={this.state.entity} visible={this.state.visible.scenegraph}/>
          {showScenegraph}
          {showAttributes}
          <div id='right-panels'>
            <ToolBar/>
            <ComponentsSidebar entity={this.state.entity} visible={this.state.visible.attributes}/>
          </div>
        </div>
        <ModalHelp isOpen={this.state.isHelpOpen} onClose={this.onCloseHelpModal}/>
      </div>
    );
  }
}

(function init () {
  var webFontLoader = document.createElement('script');
  webFontLoader.innerHTML = 'WebFont.load({google: {families: ["Roboto", "Roboto Mono"]}});';

  var webFont = document.createElement('script');
  webFont.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';
  webFont.addEventListener('load', function () {
    document.head.appendChild(webFontLoader);
  });
  webFont.addEventListener('error', function () {
    console.warn('Could not load WebFont script:', webFont.src);
  });
  document.head.appendChild(webFont);

  var div = document.createElement('div');
  div.id = 'aframe-inspector';
  div.setAttribute('data-aframe-inspector', 'app');
  document.body.appendChild(div);
  window.addEventListener('inspector-loaded', function () {
    ReactDOM.render(<Main/>, div);
  });
  console.log('A-Frame Inspector Version:', VERSION, '(' + BUILD_TIMESTAMP + ' Commit: ' + COMMIT_HASH.substr(0, 7) + ')');
})();
