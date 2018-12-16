import classnames from 'classnames';
import React from 'react';
import Events from '../../lib/Events.js';
import {saveBlob, saveString} from '../../lib/utils';

const LOCALSTORAGE_MOCAP_UI = 'aframeinspectormocapuienabled';

function filterHelpers (scene, visible) {
  scene.traverse((o) => {
    if (o.userData.source === 'INSPECTOR') { o.visible = visible; }
  });
}

function getSceneName (scene) {
  return scene.id || slugify(window.location.host + window.location.pathname);
}

/**
 * Slugify the string removing non-word chars and spaces
 * @param  {string} text String to slugify
 * @return {string}      Slugified string
 */
function slugify (text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '-')      // Replace all non-word chars with -
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Tools and actions.
 */
export default class Toolbar extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      watcherActive: false
    };

    this.checkWatcherActive();
    setInterval(() => {
      this.checkWatcherActive();
    }, 5000);
  }

  exportSceneToGLTF () {
    ga('send', 'event', 'SceneGraph', 'exportGLTF');
    const sceneName = getSceneName(AFRAME.scenes[0]);
    const scene = AFRAME.scenes[0].object3D;
    filterHelpers(scene, false);
    AFRAME.INSPECTOR.exporters.gltf.parse(scene, function (buffer) {
      filterHelpers(scene, true);
      const blob = new Blob([buffer], {type: 'application/octet-stream'});
      saveBlob(blob, sceneName + '.glb');
    }, {binary: true});
  }

  addEntity () {
    Events.emit('createnewentity', {element: 'a-entity', components: {}});
  }

  /**
   * Try to write changes with aframe-inspector-watcher.
   */
  writeChanges = () => {
    if (!this.state.watcherActive) { return; }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:51234/save');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(
      AFRAME.INSPECTOR.history.updates
    ));
  }

  checkWatcherActive = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:51234/');
    xhr.addEventListener('load', () => {
      this.setState({watcherActive: xhr.status === 200});
    });
    xhr.send();
  }

  render () {
    const watcherClassNames = classnames({
      button: true,
      fa: true,
      'fa-save': true,
      disabled: !this.state.watcherActive
    });
    let watcherTitle;
    if (this.state.watcherActive) {
      watcherTitle = 'Write changes with aframe-watcher.';
    } else {
      watcherTitle = 'aframe-watcher not running. npm install aframe-watcher to save changes back to file. supermedium.com/aframe-watcher';
    }

    return (
      <div id="toolbar">
        <div className='toolbarActions'>
          <a className='button fa fa-plus' title='Add a new entity' onClick={this.addEntity}></a>
          <a className='button fab fa-goodreads-g' title='Export to GLTF' onClick={this.exportSceneToGLTF}></a>
          <a className={watcherClassNames} title={watcherTitle} onClick={this.writeChanges}></a>
        </div>
      </div>
    );
  }
}
