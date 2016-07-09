import React from 'react';
import Clipboard from 'clipboard';
import {getSceneName, generateHtml} from '../../lib/exporter';

export class ExportMenu extends React.Component {
  componentDidMount () {
    var clipboard = new Clipboard('[data-action="copy-to-clipboard"]', {
      text: trigger => {
        return generateHtml();
      }
    });
    clipboard.on('error', e => {
        // @todo Show Error on the UI
    });
  }

  saveToHTML () {
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

  render () {
    return (
      <div className='menu'>
        <div className='title'>Export</div>
        <div className='options'>
          <div className='option' onClick={this.saveToHTML}>Save HTML</div>
          <div className='option' data-action='copy-to-clipboard'>Copy to clipboard</div>
        </div>
      </div>
    );
  }
}
