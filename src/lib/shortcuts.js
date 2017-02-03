/* globals AFRAME */
var Events = require('./Events');
import {removeSelectedEntity, cloneSelectedEntity} from '../actions/entity';

AFRAME.Keyevents = {};
AFRAME.Keyevents.VAL = null;
AFRAME.Keyevents.DIM = 'x';
AFRAME.Keyevents.LASTKEY = null;
AFRAME.Keyevents.NEGATION = false;

document.addEventListener("click", function(){
  AFRAME.Keyevents.LASTKEY = null;
});

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

    if(event.keyCode >=48 && event.keyCode<=57) {
      if(AFRAME.Keyevents.VAL == null) {
        AFRAME.Keyevents.VAL = 0;
      }
      AFRAME.Keyevents.VAL *= 10;
      AFRAME.Keyevents.VAL += (event.keyCode - 48);
    } else if(event.keyCode != 13 && event.keyCode != 189) {
      AFRAME.Keyevents.VAL = null;
      AFRAME.Keyevents.NEGATION = false;
    }

    if(event.keyCode == 13) {
      var key = AFRAME.Keyevents.LASTKEY;
      if(key === 88 || key === 89 || key === 90 || (key>=48 & key<=57)) {
        if(AFRAME.Keyevents.NEGATION) {
          Events.emit('modifyValue', { val: -1 * AFRAME.Keyevents.VAL,  dimension: AFRAME.Keyevents.DIM});
        } else {
          Events.emit('modifyValue', { val: AFRAME.Keyevents.VAL,  dimension: AFRAME.Keyevents.DIM});
        }
      }
      AFRAME.Keyevents.VAL = null;
      AFRAME.Keyevents.NEGATION = false;
    }

    if(event.keyCode == 189) {
      if(AFRAME.Keyevents.VAL == null) {
        AFRAME.Keyevents.NEGATION = true;
      }
    }

    if (event.keyCode === 88) {
    AFRAME.Keyevents.DIM = 'x';
    }

    if (event.keyCode === 89) {
    AFRAME.Keyevents.DIM = 'y';
    }

    if (event.keyCode === 90) {
    AFRAME.Keyevents.DIM = 'z';
    }
    AFRAME.Keyevents.LASTKEY = event.keyCode;
  },
  enable: function () {
    window.addEventListener('keyup', this.onKeyUp, false);
  },
  disable: function () {
    window.removeEventListener('keyup', this.onKeyUp);
  }
};