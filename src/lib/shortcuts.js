/* globals AFRAME */
var Events = require('./Events');
import {removeSelectedEntity, cloneSelectedEntity, cloneEntity} from '../actions/entity';

function shouldCaptureKeyEvent (event) {
  if (event.metaKey) { return false; }
  return event.target.tagName !== 'INPUT' &&
    event.target.tagName !== 'TEXTAREA';
}

module.exports = {
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
    if (event.keyCode === 8 || event.keyCode === 46) {
      removeSelectedEntity();
    }

    // d: clone selected entity
    if (event.keyCode === 68) {
      cloneSelectedEntity();
    }

  },
  onKeyDown: function (event) {
    // c: copy selected entity
    if (event.keyCode === 67) {
      if(AFRAME.INSPECTOR.selected && (event.ctrlKey || event.metaKey) && document.activeElement.tagName !== "INPUT") {
        AFRAME.INSPECTOR.copiedEntity = AFRAME.INSPECTOR.selectedEntity;
      }
    }

    // v: paste copied entity
    if (event.keyCode === 86) {
      if(AFRAME.INSPECTOR.copiedEntity && (event.ctrlKey || event.metaKey) && document.activeElement.tagName !== "INPUT") {
        cloneEntity(AFRAME.INSPECTOR.copiedEntity);
      }
    }
  },
  enable: function () {
    window.addEventListener('keyup', this.onKeyUp, false);
    window.addEventListener('keydown', this.onKeyDown, false);
  },
  disable: function () {
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('keydown', this.onKeyDown);
  }
};
