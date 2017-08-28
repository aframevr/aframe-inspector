var INSPECTOR = require('../../lib/inspector.js');

import React from 'react';
import Clipboard from 'clipboard';
import {getSceneName, generateHtml} from '../../lib/exporter';
import Events from '../../lib/Events.js';
import {saveString} from '../../lib/utils';

export default class Toolbar extends React.Component {
  componentDidMount () {
    var clipboard = new Clipboard('[data-action="copy-scene-to-clipboard"]', {
      text: trigger => {
        return generateHtml();
      }
    });
    clipboard.on('error', e => {
        // @todo Show Error on the UI
    });
  }
  exportSceneToGLTF () {
    console.log(AFRAME.scenes[0].object3D);
    
    INSPECTOR.exporters.gltf.parse(AFRAME.scenes[0].object3D, function (result) {
      var output = JSON.stringify(result, null, 2);
      saveString(output, 'scene.gltf', 'application/json');
    });

  }

  exportSceneToHTML () {
    var sceneName = getSceneName(AFRAME.scenes[0]);
    saveString(generateHtml(), sceneName, 'text/html');
  }

  addEntity () {
    Events.emit('createnewentity', {element: 'a-entity', components: {}});
  }

  playScene () {
    INSPECTOR.close();
  }

  render () {
    return (
      <div className='scenegraph-actions'>
        <a className='button fa fa-clipboard' title='Copy scene to clipboard' data-action='copy-scene-to-clipboard'></a>
        <div className="dropdown">
          <a className='dropbtn button fa fa-download' title='Export'></a>
          <div className="dropdown-content">
            <a className='' title='Export to HTML' onClick={this.exportSceneToHTML}>HTML</a>
            <a className='' title='Export to GLTF' onClick={this.exportSceneToGLTF}>GLTF</a>
          </div>
        </div>



        <a className='button fa fa-plus' title='Add a new entity' onClick={this.addEntity}></a>
      </div>
    );
  }
}
