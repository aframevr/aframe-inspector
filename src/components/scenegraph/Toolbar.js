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
      save(new Blob([ text ], { type: 'text/plain' }), filename);
    }
    var sceneName = getSceneName(document.querySelector('a-scene'));
    saveString(generateHtml(), sceneName);
  }

  addEntity () {
    Events.emit('createNewEntity', {element: 'a-entity', components: {}});
  }

  playScene () {
    editor.close();
  }

  render () {
    return (
      <div className='scenegraph-actions'>
        <a className='button fa fa-clipboard' data-action='copy-scene-to-clipboard'></a>
        <a className='button fa fa-floppy-o' onClick={this.saveSceneToHTML}></a>
        <a className='button fa fa-plus' onClick={this.addEntity}></a>
      </div>
    );
  }
}
