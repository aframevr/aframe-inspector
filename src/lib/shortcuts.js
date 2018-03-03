/* globals AFRAME */
var Events = require('./Events');
import {removeSelectedEntity, cloneSelectedEntity, cloneEntity} from '../actions/entity';
import {os} from '../lib/utils.js';

function shouldCaptureKeyEvent (event) {
  if (event.metaKey) { return false; }
  return event.target.tagName !== 'INPUT' &&
    event.target.tagName !== 'TEXTAREA';
}

var Shortcuts = {
  enabled: false,
  shortcuts: {
    default: {},
    modules: {}
  },
  onKeyUp: function (event) {
    if (!shouldCaptureKeyEvent(event)) { return; }

    var keyCode = event.keyCode;

    // h: help
    if (keyCode === 72) {
      Events.emit('openhelpmodal');
    }

    // esc: close inspector
    if (keyCode === 27) {
      AFRAME.INSPECTOR.close();
      return;
    }

    // w: translate
    if (keyCode === 87) {
      Events.emit('transformmodechanged', 'translate');
    }

    // e: rotate
    if (keyCode === 69) {
      Events.emit('transformmodechanged', 'rotate');
    }

    // r: scale
    if (keyCode === 82) {
      Events.emit('transformmodechanged', 'scale');
    }

    // g: toggle grid
    if (keyCode === 71) {
      Events.emit('togglegrid');
    }

    // m: motion capture
    if (keyCode === 77) {
      Events.emit('togglemotioncapture');
    }

    // n: new entity
    if (keyCode === 78) {
      Events.emit('createnewentity', {element: 'a-entity', components: {}});
    }

    // backspace & supr: remove selected entity
    if (keyCode === 8 || keyCode === 46) {
      removeSelectedEntity();
    }

    // d: clone selected entity
    if (keyCode === 68) {
      cloneSelectedEntity();
    }

    // f: Focus on selected entity.
    if (keyCode === 70) {
      const selectedEntity = AFRAME.INSPECTOR.selectedEntity;
      if (selectedEntity !== undefined && selectedEntity !== null){
        Events.emit('objectfocused', selectedEntity.object3D);
      }
    }

    for (var moduleName in this.shortcuts.modules) {
      var shortcutsModule = this.shortcuts.modules[moduleName];
      if (shortcutsModule[keyCode] &&
          (!shortcutsModule[keyCode].mustBeActive ||
            shortcutsModule[keyCode].mustBeActive && AFRAME.INSPECTOR.modules[moduleName].active)) {
        this.shortcuts.modules[moduleName][keyCode].callback();
      }
    }
  },
  onKeyDown: function (event) {
    if (!shouldCaptureKeyEvent(event)) { return; }

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

    // º: toggle sidebars visibility
    if (event.keyCode === 192) {
      Events.emit('togglesidebar', {which: 'all'});
      event.preventDefault();
      event.stopPropagation();
    }

    // 1: toggle scenegraph visibility only
    if (event.keyCode === 49) {
      Events.emit('togglesidebar', {which: 'scenegraph'});
    }

    // 2: toggle sidebar visibility only
    if (event.keyCode === 50) {
      Events.emit('togglesidebar', {which: 'attributes'});
    }
  },
  enable: function () {
    if (this.enabled) {
      this.disable();
    }

    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
    this.enabled = true;
  },
  disable: function () {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.enabled = false;
  },
  checkModuleShortcutCollision: function (keyCode, moduleName, mustBeActive) {
    if (this.shortcuts.modules[moduleName] && this.shortcuts.modules[moduleName][keyCode]) {
      console.warn('Keycode <%s> already registered as shorcut within the same module', keyCode);
    }
  },
  registerModuleShortcut: function (keyCode, callback, moduleName, mustBeActive) {
    if (this.checkModuleShortcutCollision(keyCode, moduleName, mustBeActive)) {
      return;
    }

    if (!this.shortcuts.modules[moduleName]) {
      this.shortcuts.modules[moduleName] = {};
    }

    if (mustBeActive !== false) { mustBeActive = true; }

    this.shortcuts.modules[moduleName][keyCode] = {
      callback,
      mustBeActive
    };
  },
  init: function () {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }
};

Shortcuts.init();

module.exports = Shortcuts;
