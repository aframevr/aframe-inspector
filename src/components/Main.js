/* global VERSION BUILD_TIMESTAMP COMMIT_HASH webFont */
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
import {injectCSS, injectJS} from '../lib/utils';

import '../css/main.css';

// Megahack to include font-awesome.
injectCSS('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
injectCSS('https://fonts.googleapis.com/css?family=Roboto:400,300,500');

export default class Main extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      entity: null,
      inspectorEnabled: true,
      isMotionCaptureRecording: false,
      isModalTexturesOpen: false,
      motionCaptureCountdown: -1,
      sceneEl: AFRAME.scenes[0],
      visible: {
        scenegraph: true,
        attributes: true
      }
    };

    Events.on('togglesidebar', event => {
      if (event.which === 'all') {
        if (this.state.visible.scenegraph || this.state.visible.attributes) {
          this.setState({
            visible: {
              scenegraph: false,
              attributes: false
            }
          });
        } else {
          this.setState({
            visible: {
              scenegraph: true,
              attributes: true
            }
          });
        }
      } else if (event.which === 'attributes') {
        this.setState((prevState) => ({
          visible: {
            attributes: !prevState.visible.attributes
          }
        }));
      } else if (event.which === 'scenegraph') {
        this.setState((prevState) => ({
          visible: {
            scenegraph: !prevState.visible.scenegraph
          }
        }));
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

    Events.on('motioncapturerecordstart', () => {
      this.setState({isMotionCaptureRecording: true});
    });

    Events.on('motioncapturerecordstop', () => {
      this.setState({isMotionCaptureRecording: false});
    });

    Events.on('motioncapturecountdown', val => {
      this.setState({motionCaptureCountdown: val});
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
    const showScenegraph = this.state.visible.scenegraph ? null : <div className="toggle-sidebar left"><a onClick={() => { this.setState({visible: {scenegraph: true}}); this.forceUpdate(); }} className='fa fa-plus' title='Show scenegraph'></a></div>;
    const showAttributes = !this.state.entity || this.state.visible.attributes ? null : <div className="toggle-sidebar right"><a onClick={() => { this.setState({visible: {attributes: true}}); this.forceUpdate(); }} className='fa fa-plus' title='Show components'></a></div>;

    let toggleButtonText = 'Inspect Scene';
    if (this.state.motionCaptureCountdown !== -1) {
      toggleButtonText = this.state.motionCaptureCountdown;
    } else if (this.state.isMotionCaptureRecording) {
      toggleButtonText = 'Stop Recording';
    } else if (this.state.inspectorEnabled) {
      toggleButtonText = 'Back to Scene';
    }

    return (
      <div>
        <a className='toggle-edit' onClick={this.toggleEdit}>{toggleButtonText}</a>

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
  injectJS('https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js', function () {
    var webFontLoader = document.createElement('script');
    webFontLoader.setAttribute('data-aframe-inspector', 'webfont');
    webFontLoader.innerHTML = 'WebFont.load({google: {families: ["Roboto", "Roboto Mono"]}});';
    document.head.appendChild(webFontLoader);
  }, function () {
    console.warn('Could not load WebFont script:', webFont.src); // webFont or webFontLoader?
  });

  var div = document.createElement('div');
  div.id = 'aframe-inspector';
  div.setAttribute('data-aframe-inspector', 'app');
  document.body.appendChild(div);
  window.addEventListener('inspector-loaded', function () {
    ReactDOM.render(<Main/>, div);
  });
  console.log('A-Frame Inspector Version:', VERSION, '(' + BUILD_TIMESTAMP + ' Commit: ' + COMMIT_HASH.substr(0, 7) + ')');
})();
