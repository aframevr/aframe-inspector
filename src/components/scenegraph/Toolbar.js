var INSPECTOR = require('../../lib/inspector.js');
import React from 'react';
import Clipboard from 'clipboard';
import {getSceneName, generateHtml} from '../../lib/exporter';
import Events from '../../lib/Events.js';
import {saveString} from '../../lib/utils';
import MotionCapture from './MotionCapture';

const LOCALSTORAGE_MOCAP_UI = 'aframeinspectormocapuienabled';

/**
 * Tools and actions.
 */
export default class Toolbar extends React.Component {
  constructor (props) {
    super(props);

    const clipboard = new Clipboard('[data-action="copy-scene-to-clipboard"]', {
      text: trigger => {
        ga('send', 'event', 'SceneGraph', 'copySceneToClipboard');
        return generateHtml();
      }
    });
    clipboard.on('error', e => {
      // @todo Show Error on the UI
    });

    Events.on('togglemotioncapture', () => {
      this.toggleMotionCaptureUI();
    });

    this.state = {
      motionCaptureUIEnabled: JSON.parse(localStorage.getItem(LOCALSTORAGE_MOCAP_UI))
    };
  }
  exportSceneToGLTF () {
    ga('send', 'event', 'SceneGraph', 'exportGLTF');
    INSPECTOR.exporters.gltf.parse(AFRAME.scenes[0].object3D, function (result) {
      var output = JSON.stringify(result, null, 2);
      saveString(output, 'scene.gltf', 'application/json');
    });
  }

  exportSceneToHTML () {
    ga('send', 'event', 'SceneGraph', 'exportHTML');
    var sceneName = getSceneName(AFRAME.scenes[0]);
    saveString(generateHtml(), sceneName, 'text/html');
  }

  addEntity () {
    Events.emit('createnewentity', {element: 'a-entity', components: {}});
  }

  toggleMotionCaptureUI = () => {
    ga('send', 'event', 'SceneGraph', 'openMotionCapture');
    localStorage.setItem(LOCALSTORAGE_MOCAP_UI, !this.state.motionCaptureUIEnabled);
    this.setState({motionCaptureUIEnabled: !this.state.motionCaptureUIEnabled});
  }

  render () {
    return (
      <div id="scenegraphToolbar">
        <div className='scenegraph-actions'>
          <a className='button fa fa-video-camera' title='Open motion capture development tools' onClick={this.toggleMotionCaptureUI} style={this.state.motionCaptureUIEnabled ? {color: '#FFF'} : {}}></a>
          <a className='button fa fa-clipboard' title='Copy HTML to clipboard' data-action='copy-scene-to-clipboard'></a>
          <a className='button fa fa-download' title='Export to HTML' onClick={this.saveSceneToHTML}></a>
          <a className='button fa fa-plus' title='Add a new entity' onClick={this.addEntity}></a>

          <div className="dropdown">
            <a className='dropbtn button fa fa-download' title='Export'></a>
            <div className="dropdown-content">
              <a className='' title='Export to HTML' onClick={this.exportSceneToHTML}>HTML</a>
              <a className='' title='Export to GLTF' onClick={this.exportSceneToGLTF}>GLTF</a>
            </div>
          </div>
        </div>

        {this.state.motionCaptureUIEnabled && <MotionCapture/>}
      </div>
    );
  }
}
