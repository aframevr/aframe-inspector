/* global VERSION BUILD_TIMESTAMP COMMIT_HASH webFont */
require('./lib/vendor/ga');

var Events = require('./lib/Events');
var Viewport = require('./lib/viewport');
var AssetsLoader = require('./lib/assetsLoader');
var Shortcuts = require('./lib/shortcuts');

import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main';
import {injectCSS, injectJS} from './lib/utils';
import {GLTFExporter} from './lib/vendor/GLTFExporter';  // eslint-disable-line no-unused-vars

require('./index.styl');

function Inspector () {
  this.assetsLoader = new AssetsLoader();
  this.exporters = {gltf: new THREE.GLTFExporter()};
  this.history = require('./lib/history');
  this.isFirstOpen = true;
  this.modules = {};
  this.on = Events.on;
  this.opened = false;

  // Wait for stuff.
  const doInit = () => {
    this.sceneEl = AFRAME.scenes[0];
    if (this.sceneEl.hasLoaded) {
      this.init();
      return;
    }
    this.sceneEl.addEventListener('loaded', this.init.bind(this), {once: true});
  };
  if (!AFRAME.scenes.length) {
    document.addEventListener('loaded', () => { doInit(); }, {once: true});
    return;
  }
  doInit();
}

Inspector.prototype = {
  init: function () {
    var self = this;
    this.container = document.querySelector('.a-canvas');

    this.currentCameraEl = AFRAME.scenes[0].camera.el;
    this.currentCameraEl.setAttribute('data-aframe-inspector-original-camera', '');

    // If the current camera is the default, we should prevent AFRAME from
    // remove it once when we inject the editor's camera.
    if (this.currentCameraEl.hasAttribute('data-aframe-default-camera')) {
      this.currentCameraEl.removeAttribute('data-aframe-default-camera');
      this.currentCameraEl.setAttribute('data-aframe-inspector', 'default-camera');
    }

    this.currentCameraEl.setAttribute('camera', 'active', false);

    // Create Inspector camera.
    const camera = this.camera = new THREE.PerspectiveCamera();
    camera.far = 10000;
    camera.near = 0.01;
    camera.position.set(0, 1.6, 2);
    camera.lookAt(new THREE.Vector3(0, 1.6, -1));
    camera.updateMatrixWorld();
    this.sceneEl.object3D.add(camera);
    this.sceneEl.camera = camera;

    this.initUI();
    this.initModules();
  },

  initModules: function () {
    for (var moduleName in this.modules) {
      var module = this.modules[moduleName];
      console.log('Initializing module <%s>', moduleName);
      module.init(this.sceneEl);
    }
  },

  initUI: function () {
    this.initEvents();

    this.selected = null;

    // Some Web font thing.
    injectJS('https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js', () => {
      const webFontLoader = document.createElement('script');
      webFontLoader.setAttribute('data-aframe-inspector', 'webfont');
      webFontLoader.innerHTML = 'WebFont.load({google: {families: ["Roboto", "Roboto Mono"]}});';
      document.head.appendChild(webFontLoader);
    }, () => {
      console.warn('Could not load WebFont script:', webFont.src);
    });

    // Init React.
    const div = document.createElement('div');
    div.id = 'aframeInspector';
    div.setAttribute('data-aframe-inspector', 'app');
    document.body.appendChild(div);
    ReactDOM.render(<Main/>, div);

    this.scene = this.sceneEl.object3D;
    this.helpers = {};
    this.sceneHelpers = new THREE.Scene();
    this.sceneHelpers.userData.source = 'INSPECTOR';
    this.sceneHelpers.visible = true; // false;
    this.inspectorActive = false;

    this.viewport = new Viewport(this);
    Events.emit('windowresize');

    const self = this;
    function addHelpers (object) {
      for (let i = 0; i < object.children.length; i++) {
        const obj = object.children[i];
        for (let j = 0; j < obj.children.length; j++) {
          self.addHelperTraverse(obj.children[j]);
        }
      }
    }
    addHelpers(this.sceneEl.object3D);

    document.addEventListener('model-loaded', event => {
      this.addHelperTraverse(event.target.object3D);
    });

    Events.on('entityselect', entity => {
      this.addHelperTraverse(entity.object3D);
    });

    this.scene.add(this.sceneHelpers);
    this.open();
  },

  removeObject: function (object) {
    // Remove just the helper as the object will be deleted by Aframe
    this.removeHelpers(object);
    Events.emit('objectremove', object);
  },

  addHelper: (function () {
    const geometry = new THREE.SphereBufferGeometry(2, 4, 2);
    const material = new THREE.MeshBasicMaterial({color: 0xff0000, visible: false});

    return function (object) {
      var helper;
      if (object instanceof THREE.Camera) {
        this.cameraHelper = helper = new THREE.CameraHelper(object, 0.1);
        this.cameraHelper.visible = false;
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

      var parentId = object.parent.id;

      // Helpers for object already created, remove every helper
      if (this.helpers[parentId]) {
        for (var objectId in this.helpers[parentId]) {
          this.sceneHelpers.remove(this.helpers[parentId][objectId]);
        }
      } else {
        this.helpers[parentId] = {};
      }

      const picker = new THREE.Mesh(geometry, material);
      picker.name = 'picker';
      picker.userData.object = object;
      picker.userData.source = 'INSPECTOR';
      helper.add(picker);
      helper.fromObject = object;
      helper.userData.source = 'INSPECTOR';

      this.sceneHelpers.add(helper);
      this.helpers[parentId][object.id] = helper;

      Events.emit('helperadded', helper);
    };
  })(),

  removeHelpers: function (object) {
    var parentId = object.id;
    if (this.helpers[parentId]) {
      for (var objectId in this.helpers[parentId]) {
        var helper = this.helpers[parentId][objectId];
        Events.emit('helperremove', helper);
        this.sceneHelpers.remove(helper);
      }
      delete this.helpers[parentId];
    }
  },

  selectEntity: function (entity, emit) {
    this.selectedEntity = entity;
    if (entity) {
      this.select(entity.object3D);
    } else {
      this.select(null);
    }

    if (emit === undefined) { Events.emit('entityselect', entity); }

    // Update camera helper visibility.
    if (this.cameraHelper) {
      this.cameraHelper.visible = entity === this.currentCameraEl;
    }
  },

  initEvents: function () {
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

    Events.on('createnewentity', definition => {
      this.createNewEntity(definition);
    });

    document.addEventListener('child-detached', event => {
      var entity = event.detail.el;
      AFRAME.INSPECTOR.removeObject(entity.object3D);
    });

    Events.on('dommodify', mutations => {
      if (!mutations) { return; }
      mutations.forEach(mutation => {
        if (mutation.type !== 'childList') { return; }
        Array.prototype.slice.call(mutation.removedNodes).forEach(removedNode => {
          if (this.selectedEntity === removedNode) {
            this.selectEntity(null);
          }
        });
      });
    });
  },

  selectById: function (id) {
    if (id === this.camera.id) {
      this.select(this.camera);
      return;
    }
    this.select(this.scene.getObjectById(id, true));
  },

  /**
   * Change to select object.
   */
  select: function (object3D) {
    if (this.selected === object3D) { return; }
    this.selected = object3D;
    Events.emit('objectselect', object3D);
  },

  deselect: function () {
    this.select(null);
  },

  /**
   * Helper function to add a new entity with a list of components
   * @param  {object} definition Entity definition to add:
   *                             {element: 'a-entity', components: {geometry: 'primitive:box'}}
   * @return {Element}            Entity created
   */
  createNewEntity: function (definition) {
    var entity = document.createElement(definition.element);

    // load default attributes
    for (var attr in definition.components) {
      entity.setAttribute(attr, definition.components[attr]);
    }

    // Ensure the components are loaded before update the UI
    entity.addEventListener('loaded', () => {
      this.addEntity(entity);
    });

    this.sceneEl.appendChild(entity);

    return entity;
  },

  addEntity: function (entity) {
    this.selectEntity(entity);
  },

  /**
   * Toggle the editor
   */
  toggle: function () {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Open the editor UI
   */
  open: function (focusEl) {
    this.sceneEl = AFRAME.scenes[0];
    this.opened = true;
    Events.emit('inspectortoggle', true);

    if (!this.sceneEl.hasAttribute('aframe-inspector-motion-capture-replaying')) {
      this.sceneEl.pause();
      this.sceneEl.exitVR();
    }

    if (this.sceneEl.hasAttribute('embedded')) {
      // Remove embedded styles, but keep track of it.
      this.sceneEl.removeAttribute('embedded');
      this.sceneEl.setAttribute('aframe-inspector-removed-embedded');
    }

    document.body.classList.add('aframe-inspector-opened');
    this.sceneEl.resize();
    Shortcuts.enable();

    if (!focusEl && this.isFirstOpen && AFRAME.utils.getUrlParameter('inspector')) {
      // Focus entity with URL parameter on first open.
      focusEl = document.getElementById(AFRAME.utils.getUrlParameter('inspector'));
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
  close: function () {
    this.opened = false;
    Events.emit('inspectortoggle', false);
    this.sceneEl.play();
    if (this.sceneEl.hasAttribute('aframe-inspector-removed-embedded')) {
      this.sceneEl.setAttribute('embedded', '');
      this.sceneEl.removeAttribute('aframe-inspector-removed-embedded');
    }
    document.body.classList.remove('aframe-inspector-opened');
    this.sceneEl.resize();
    Shortcuts.disable();
  },

  addHelperTraverse: function (object) {
    const self = this;
    object.traverse(child => {
      if (!child.el || !child.el.isInspector) {
        self.addHelper(child, object);
      }
    });
    Events.emit('helperadd', object);
  }
};

const inspector = AFRAME.INSPECTOR = new Inspector();
const Modules = require('./lib/modules/index.js');  // eslint-disable-line no-unused-vars
