var INSPECTOR = require('../../lib/inspector.js');

import React from 'react';
import Clipboard from 'clipboard';
import {getSceneName, generateHtml} from '../../lib/exporter';
import Events from '../../lib/Events.js';

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

  saveSceneToHTML () {
    var link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    function save (blob, filename) {
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'ascene.html';
      link.click();
      // URL.revokeObjectURL(url); breaks Firefox...
    }
    function saveString (text, filename) {
      save(new Blob([ text ], { type: 'text/html' }), filename);
    }
    var sceneName = getSceneName(document.querySelector('a-scene'));
    saveString(generateHtml(), sceneName);
  }

  addEntity () {
    Events.emit('createNewEntity', {element: 'a-entity', components: {}});
  }

  playScene () {
    INSPECTOR.close();
  }

  render () {
    return (
      <div className='scenegraph-actions'>
        <a className='button fa fa-clipboard' title='Copy scene to clipboard' data-action='copy-scene-to-clipboard'></a>
        <a className='button fa fa-download' title='Export to HTML' onClick={this.saveSceneToHTML}></a>
        <a className='button fa fa-plus' title='Add a new entity' onClick={this.addEntity}></a>
      </div>
    );
  }
}
