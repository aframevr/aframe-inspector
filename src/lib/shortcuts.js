/* globals AFRAME */
var Events = require('./Events');
import {removeSelectedEntity, cloneSelectedEntity, cloneEntity} from '../actions/entity';
import {os} from '../lib/utils.js';

function shouldCaptureKeyEvent (event) {
  if (event.metaKey) { return false; }
  return event.target.tagName !== 'INPUT' &&
    event.target.tagName !== 'TEXTAREA';
}

module.exports = {
  onKeyDown: function (event) {
    if (!shouldCaptureKeyEvent(event)) { return; }

    // tab: toggle sidebars visibility
    if (event.keyCode === 9) {
      Events.emit('togglesidebar', {which:'all'});
      event.preventDefault();
      event.stopPropagation();
    }

    // 1: toggle scenegraph visibility only
    if (event.keyCode === 49) {
      Events.emit('togglesidebar', {which:'scenegraph'});
    }

    // 2: toggle sidebar visibility only
    if (event.keyCode === 50) {
      Events.emit('togglesidebar', {which:'sidebar'});
    }
  },

  onKeyUp: function (event) {
    if (!shouldCaptureKeyEvent(event)) { return; }

    // h: help
    if (event.keyCode === 72) {
      Events.emit('openhelpmodal');
    }

    // esc: close inspector
    if (event.keyCode === 27) {
      AFRAME.INSPECTOR.close();
      return;
    }

    // w: translate
    if (event.keyCode === 87) {
      Events.emit('transformmodechanged', 'translate');
    }

    // e: rotate
    if (event.keyCode === 69) {
      Events.emit('transformmodechanged', 'rotate');
    }

    // r: scale
    if (event.keyCode === 82) {
      Events.emit('transformmodechanged', 'scale');
    }

    // g: toggle grid
    if (event.keyCode === 71) {
      Events.emit('togglegrid');
    }

    // n: new entity
    if (event.keyCode === 78) {
      Events.emit('createnewentity', {element: 'a-entity', components: {}});
    }

    // backspace & supr: remove selected entity
    if (event.keyCode === 8 || event.keyCode === 46) {
      removeSelectedEntity();
    }

    // d: clone selected entity
    if (event.keyCode === 68) {
      cloneSelectedEntity();
    }
  },
  onKeyDown: function (event) {

    if (event.ctrlKey && os === 'windows' || event.metaKey && os === 'macos') {
      if (AFRAME.INSPECTOR.selectedEntity && document.activeElement.tagName !== 'INPUT') {
        // x: cut selected entity
        if (event.keyCode === 88) {
          AFRAME.INSPECTOR.entityToCopy = AFRAME.INSPECTOR.selectedEntity;
          removeSelectedEntity(true);
        }

        // c: copy selected entity
        if (event.keyCode === 67) {
          AFRAME.INSPECTOR.entityToCopy = AFRAME.INSPECTOR.selectedEntity;
        }

        // v: paste copied entity
        if (event.keyCode === 86) {
          cloneEntity(AFRAME.INSPECTOR.entityToCopy);
        }
      }

      // f: focus filter input
      if (event.keyCode === 70) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('filter').focus();
      }
    }
  },
  enable: function () {
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
    window.addEventListener('keydown', this.onKeyDown, false);
  },
  disable: function () {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('keydown', this.onKeyDown);
  }
};
