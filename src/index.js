/* global VERSION BUILD_TIMESTAMP COMMIT_HASH webFont */
require('../vendor/ga');

var Events = require('./lib/Events');
var Viewport = require('./lib/viewport');
var AssetsLoader = require('./lib/assetsLoader');
var Shortcuts = require('./lib/shortcuts');

import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main';
import { initCameras } from './lib/cameras';
import { injectCSS, injectJS } from './lib/utils';
import { createEntity } from './lib/entity';
import { GLTFExporter } from '../vendor/GLTFExporter'; // eslint-disable-line no-unused-vars

require('./style/index.styl');

function Inspector() {
  this.assetsLoader = new AssetsLoader();
  this.exporters = { gltf: new THREE.GLTFExporter() };
  this.history = require('./lib/history');
  this.isFirstOpen = true;
  this.modules = {};
  this.on = Events.on;
  this.opened = false;

  // Wait for stuff.
  const doInit = () => {
    if (!AFRAME.scenes.length) {
      setTimeout(() => {
        doInit();
      }, 100);
      return;
    }

    this.sceneEl = AFRAME.scenes[0];
    if (this.sceneEl.hasLoaded) {
      this.init();
      return;
    }
    this.sceneEl.addEventListener('loaded', this.init.bind(this), {
      once: true
    });
  };
  doInit();
}

Inspector.prototype = {
  init: function() {
    // Wait for camera.
    if (!this.sceneEl.camera) {
      this.sceneEl.addEventListener(
        'camera-set-active',
        () => {
          this.init();
        },
        { once: true }
      );
      return;
    }

    this.container = document.querySelector('.a-canvas');
    initCameras(this);
    this.initUI();
  },

  initUI: function() {
    Shortcuts.init(this);
    this.initEvents();

    this.selected = null;

    // Init React.
    const div = document.createElement('div');
    div.id = 'aframeInspector';
    div.setAttribute('data-aframe-inspector', 'app');
    document.body.appendChild(div);
    ReactDOM.render(<Main />, div);

    this.scene = this.sceneEl.object3D;
    this.helpers = {};
    this.sceneHelpers = new THREE.Scene();
    this.sceneHelpers.userData.source = 'INSPECTOR';
    this.sceneHelpers.visible = true;
    this.inspectorActive = false;

    this.viewport = new Viewport(this);
    Events.emit('windowresize');

    this.sceneEl.object3D.traverse(node => {
      this.addHelper(node);
    });

    this.scene.add(this.sceneHelpers);
    this.open();
  },

  removeObject: function(object) {
    // Remove just the helper as the object will be deleted by A-Frame
    this.removeHelpers(object);
    Events.emit('objectremove', object);
  },

  addHelper: (function() {
    const geometry = new THREE.SphereBufferGeometry(2, 4, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      visible: false
    });

    return function(object) {
      let helper;

      if (object instanceof THREE.Camera) {
        this.cameraHelper = helper = new THREE.CameraHelper(object, 0.1);
      } else if (object instanceof THREE.PointLight) {
        helper = new THREE.PointLightHelper(object, 1);
      } else if (object instanceof THREE.DirectionalLight) {
        helper = new THREE.DirectionalLightHelper(object, 1);
      } else if (object instanceof THREE.SpotLight) {
        helper = new THREE.SpotLightHelper(object, 1);
      } else if (object instanceof THREE.HemisphereLight) {
        helper = new THREE.HemisphereLightHelper(object, 1);
      } else if (object instanceof THREE.SkinnedMesh) {
        helper = new THREE.SkeletonHelper(object);
      } else {
        // no helper for this object type
        return;
      }

      helper.visible = false;
      this.sceneHelpers.add(helper);
      this.helpers[object.uuid] = helper;
      helper.update();
    };
  })(),

  removeHelpers: function(object) {
    object.traverse(node => {
      const helper = this.helpers[node.uuid];
      if (helper) {
        this.sceneHelpers.remove(helper);
        delete this.helpers[node.uuid];
        Events.emit('helperremove', this.helpers[node.uuid]);
      }
    });
  },

  selectEntity: function(entity, emit) {
    this.selectedEntity = entity;
    if (entity) {
      this.select(entity.object3D);
    } else {
      this.select(null);
    }

    if (entity && emit === undefined) {
      Events.emit('entityselect', entity);
    }

    // Update helper visibilities.
    for (let id in this.helpers) {
      this.helpers[id].visible = false;
    }

    if (entity === this.sceneEl) {
      return;
    }
    entity.object3D.traverse(node => {
      if (this.helpers[node.uuid]) {
        this.helpers[node.uuid].visible = true;
      }
    });
  },

  initEvents: function() {
    window.addEventListener('keydown', evt => {
      // Alt + Ctrl + i: Shorcut to toggle the inspector
      var shortcutPressed = evt.keyCode === 73 && evt.ctrlKey && evt.altKey;
      if (shortcutPressed) {
        this.toggle();
      }
    });

    Events.on('entityselect', entity => {
      this.selectEntity(entity, false);
    });

    Events.on('inspectortoggle', active => {
      this.inspectorActive = active;
      this.sceneHelpers.visible = this.inspectorActive;
    });

    Events.on('entitycreate', definition => {
      createEntity(definition, entity => {
        this.selectEntity(entity);
      });
    });

    document.addEventListener('child-detached', event => {
      var entity = event.detail.el;
      AFRAME.INSPECTOR.removeObject(entity.object3D);
    });
  },

  selectById: function(id) {
    if (id === this.camera.id) {
      this.select(this.camera);
      return;
    }
    this.select(this.scene.getObjectById(id, true));
  },

  /**
   * Change to select object.
   */
  select: function(object3D) {
    if (this.selected === object3D) {
      return;
    }
    this.selected = object3D;
    Events.emit('objectselect', object3D);
  },

  deselect: function() {
    this.select(null);
  },

  /**
   * Toggle the editor
   */
  toggle: function() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Open the editor UI
   */
  open: function(focusEl) {
    this.opened = true;
    Events.emit('inspectortoggle', true);

    if (this.sceneEl.hasAttribute('embedded')) {
      // Remove embedded styles, but keep track of it.
      this.sceneEl.removeAttribute('embedded');
      this.sceneEl.setAttribute('aframe-inspector-removed-embedded');
    }

    document.body.classList.add('aframe-inspector-opened');
    this.sceneEl.resize();
    this.sceneEl.pause();
    this.sceneEl.exitVR();

    Shortcuts.enable();

    // Trick scene to run the cursor tick.
    this.sceneEl.isPlaying = true;
    this.cursor.play();

    if (
      !focusEl &&
      this.isFirstOpen &&
      AFRAME.utils.getUrlParameter('inspector')
    ) {
      // Focus entity with URL parameter on first open.
      focusEl = document.getElementById(
        AFRAME.utils.getUrlParameter('inspector')
      );
    }
    if (focusEl) {
      this.selectEntity(focusEl);
      Events.emit('objectfocus', focusEl.object3D);
    }
    this.isFirstOpen = false;
  },

  /**
   * Closes the editor and gives the control back to the scene
   * @return {[type]} [description]
   */
  close: function() {
    this.opened = false;
    Events.emit('inspectortoggle', false);

    // Untrick scene when we enabled this to run the cursor tick.
    this.sceneEl.isPlaying = false;

    this.sceneEl.play();
    this.cursor.pause();

    if (this.sceneEl.hasAttribute('aframe-inspector-removed-embedded')) {
      this.sceneEl.setAttribute('embedded', '');
      this.sceneEl.removeAttribute('aframe-inspector-removed-embedded');
    }
    document.body.classList.remove('aframe-inspector-opened');
    this.sceneEl.resize();
    Shortcuts.disable();
  }
};

const inspector = (AFRAME.INSPECTOR = new Inspector());
