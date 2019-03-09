/* globals AFRAME */
var Events = require('./Events');
import {
  removeSelectedEntity,
  cloneSelectedEntity,
  cloneEntity
} from '../lib/entity';
import { os } from '../lib/utils.js';

function shouldCaptureKeyEvent (event) {
  if (event.metaKey) {
    return false;
  }
  return (
    event.target.closest('#cameraToolbar') ||
    (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA')
  );
}

var Shortcuts = {
  enabled: false,
  shortcuts: {
    default: {},
    modules: {}
  },
  onKeyUp: function (event) {
    if (!shouldCaptureKeyEvent(event) || !AFRAME.INSPECTOR.opened) {
      return;
    }

    var keyCode = event.keyCode;

    // h: help
    if (keyCode === 72) {
      Events.emit('openhelpmodal');
    }

    // esc: close inspector
    if (keyCode === 27) {
      if (this.inspector.selectedEntity) {
        this.inspector.selectEntity(null);
      }
    }

    // w: translate
    if (keyCode === 87) {
      Events.emit('transformmodechange', 'translate');
    }

    // e: rotate
    if (keyCode === 69) {
      Events.emit('transformmodechange', 'rotate');
    }

    // r: scale
    if (keyCode === 82) {
      Events.emit('transformmodechange', 'scale');
    }

    // o: transform space
    if (keyCode === 79) {
      Events.emit('transformspacechange');
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
      Events.emit('entitycreate', { element: 'a-entity', components: {} });
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
      if (selectedEntity !== undefined && selectedEntity !== null) {
        Events.emit('objectfocus', selectedEntity.object3D);
      }
    }

    if (keyCode === 49) {
      Events.emit('cameraperspectivetoggle');
    } else if (keyCode === 50) {
      Events.emit('cameraorthographictoggle', 'left');
    } else if (keyCode === 51) {
      Events.emit('cameraorthographictoggle', 'right');
    } else if (keyCode === 52) {
      Events.emit('cameraorthographictoggle', 'top');
    } else if (keyCode === 53) {
      Events.emit('cameraorthographictoggle', 'bottom');
    } else if (keyCode === 54) {
      Events.emit('cameraorthographictoggle', 'back');
    } else if (keyCode === 55) {
      Events.emit('cameraorthographictoggle', 'front');
    }

    for (var moduleName in this.shortcuts.modules) {
      var shortcutsModule = this.shortcuts.modules[moduleName];
      if (
        shortcutsModule[keyCode] &&
        (!shortcutsModule[keyCode].mustBeActive ||
          (shortcutsModule[keyCode].mustBeActive &&
            AFRAME.INSPECTOR.modules[moduleName].active))
      ) {
        this.shortcuts.modules[moduleName][keyCode].callback();
      }
    }
  },
  onKeyDown: function (event) {
    if (!shouldCaptureKeyEvent(event) || !AFRAME.INSPECTOR.opened) {
      return;
    }

    if (
      (event.ctrlKey && os === 'windows') ||
      (event.metaKey && os === 'macos')
    ) {
      if (
        AFRAME.INSPECTOR.selectedEntity &&
        document.activeElement.tagName !== 'INPUT'
      ) {
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

      // s: focus search input
      if (event.keyCode === 83) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('filter').focus();
      }
    }

    // º: toggle sidebars visibility
    if (event.keyCode === 48) {
      Events.emit('togglesidebar', { which: 'all' });
      event.preventDefault();
      event.stopPropagation();
    }
  },
  enable: function () {
    if (this.enabled) {
      this.disable();
    }

    window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.enabled = true;
  },
  disable: function () {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.enabled = false;
  },
  checkModuleShortcutCollision: function (keyCode, moduleName, mustBeActive) {
    if (
      this.shortcuts.modules[moduleName] &&
      this.shortcuts.modules[moduleName][keyCode]
    ) {
      console.warn(
        'Keycode <%s> already registered as shorcut within the same module',
        keyCode
      );
    }
  },
  registerModuleShortcut: function (
    keyCode,
    callback,
    moduleName,
    mustBeActive
  ) {
    if (this.checkModuleShortcutCollision(keyCode, moduleName, mustBeActive)) {
      return;
    }

    if (!this.shortcuts.modules[moduleName]) {
      this.shortcuts.modules[moduleName] = {};
    }

    if (mustBeActive !== false) {
      mustBeActive = true;
    }

    this.shortcuts.modules[moduleName][keyCode] = {
      callback,
      mustBeActive
    };
  },
  init: function (inspector) {
    this.inspector = inspector;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }
};

module.exports = Shortcuts;
