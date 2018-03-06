var Events = require('./Events');
var Viewport = require('./viewport/index.js');
var ComponentLoader = require('./componentloader.js');
var AssetsLoader = require('./assetsLoader.js');
var ShaderLoader = require('./shaderloader.js');
var Shortcuts = require('./shortcuts.js');
import {GLTFExporter} from './vendor/GLTFExporter'; // eslint-disable-line no-unused-vars

function Inspector () {
  this.exporters = {
    gltf: new THREE.GLTFExporter()
  };
  this.modules = {};
  this.on = Events.on;
  this.opened = false;
  // Detect if the scene is already loaded
  if (document.readyState === 'complete' || document.readyState === 'loaded') {
    this.onDomLoaded();
  } else {
    document.addEventListener('DOMContentLoaded', this.onDomLoaded.bind(this));
  }
}

Inspector.prototype = {
  /**
   * Callback once the DOM is completely loaded so we could query the scene
   */
  onDomLoaded: function () {
    this.componentLoader = new ComponentLoader();
    this.shaderLoader = new ShaderLoader();
    this.assetsLoader = new AssetsLoader();

    this.sceneEl = AFRAME.scenes[0];
    if (this.sceneEl.hasLoaded) {
      this.onSceneLoaded();
    } else {
      this.sceneEl.addEventListener('loaded', this.onSceneLoaded.bind(this));
    }
  },

  /**
   * Callback when the a-scene is loaded
   */
  onSceneLoaded: function () {
    var self = this;
    this.container = document.querySelector('.a-canvas');

    // Wait for camera if necessary.
    if (!AFRAME.scenes[0].camera) {
      AFRAME.scenes[0].addEventListener('camera-set-active', function waitForCamera () {
        AFRAME.scenes[0].removeEventListener('camera-set-active', waitForCamera);
        self.onSceneLoaded();
      });
      return;
    }

    this.currentCameraEl = AFRAME.scenes[0].camera.el;
    this.currentCameraEl.setAttribute('data-aframe-inspector-original-camera', '');

    // If the current camera is the default, we should prevent AFRAME from
    // remove it once when we inject the editor's camera
    if (this.currentCameraEl.hasAttribute('data-aframe-default-camera')) {
      this.currentCameraEl.removeAttribute('data-aframe-default-camera');
      this.currentCameraEl.setAttribute('data-aframe-inspector', 'default-camera');
    }

    this.inspectorCameraEl = document.createElement('a-entity');
    this.inspectorCameraEl.isInspector = true;
    this.inspectorCameraEl.addEventListener('componentinitialized', evt => {
      if (evt.detail.name !== 'camera') { return; }
      this.EDITOR_CAMERA = this.inspectorCameraEl.getObject3D('camera');
      this.initUI();
      this.initModules();
    });
    this.inspectorCameraEl.setAttribute('camera', {far: 10000, fov: 50, near: 0.05, active: true});
    this.inspectorCameraEl.setAttribute('data-aframe-inspector', 'camera');
    AFRAME.scenes[0].appendChild(this.inspectorCameraEl);
  },

  initModules: function () {
    for (var moduleName in this.modules) {
      var module = this.modules[moduleName];
      console.log('Initializing module <%s>', moduleName);
      module.init(this.sceneEl);
    }
  },

  initUI: function () {
    this.EDITOR_CAMERA.position.set(20, 10, 20);
    this.EDITOR_CAMERA.lookAt(new THREE.Vector3());
    this.EDITOR_CAMERA.updateMatrixWorld();
    this.camera = this.EDITOR_CAMERA;

    this.initEvents();

    this.selected = null;

    window.dispatchEvent(new Event('inspector-loaded'));

    this.scene = this.sceneEl.object3D;
    this.helpers = {};
    this.sceneHelpers = new THREE.Scene();
    this.sceneHelpers.visible = true; // false;
    this.inspectorActive = false;

    this.viewport = new Viewport(this);
    Events.emit('windowresize');

    var scope = this;

    function addObjects (object) {
      for (var i = 0; i < object.children.length; i++) {
        var obj = object.children[i];
        for (var j = 0; j < obj.children.length; j++) {
          scope.addObject(obj.children[j]);
        }
      }
    }
    addObjects(this.sceneEl.object3D);

    document.addEventListener('model-loaded', event => {
      this.addObject(event.target.object3D);
    });

    Events.on('selectedentitycomponentchanged', event => {
      this.addObject(event.target.object3D);
    });

    Events.on('selectedentitycomponentcreated', event => {
      this.addObject(event.target.object3D);
    });

    this.scene.add(this.sceneHelpers);

    this.open();
  },

  removeObject: function (object) {
    // Remove just the helper as the object will be deleted by Aframe
    this.removeHelpers(object);
    Events.emit('objectremoved', object);
  },

  addHelper: (function () {
    var geometry = new THREE.SphereBufferGeometry(2, 4, 2);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

    return function (object) {
      var helper;
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

      var parentId = object.parent.id;

      // Helpers for object already created, remove every helper
      if (this.helpers[parentId]) {
        for (var objectId in this.helpers[parentId]) {
          this.sceneHelpers.remove(this.helpers[parentId][objectId]);
        }
      } else {
        this.helpers[parentId] = {};
      }

      var picker = new THREE.Mesh(geometry, material);
      picker.name = 'picker';
      picker.userData.object = object;
      helper.add(picker);
      helper.fromObject = object;

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
        Events.emit('helperremoved', helper);
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

    if (emit === undefined) {
      Events.emit('entityselected', entity);
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

    Events.on('entityselected', entity => {
      this.selectEntity(entity, false);
    });

    Events.on('inspectormodechanged', active => {
      this.inspectorActive = active;
      this.sceneHelpers.visible = this.inspectorActive;
    });

    Events.on('createnewentity', definition => {
      this.createNewEntity(definition);
    });

    Events.on('selectedentitycomponentchanged', event => {
      this.addObject(event.target.object3D);
    });

    document.addEventListener('child-detached', event => {
      var entity = event.detail.el;
      AFRAME.INSPECTOR.removeObject(entity.object3D);
    });

    Events.on('dommodified', mutations => {
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
  // Change to select object
  select: function (object) {
    if (this.selected === object) {
      return;
    }
    this.selected = object;
    Events.emit('objectselected', object);
  },
  deselect: function () {
    this.select(null);
  },
  /**
   * Reset the current scene, removing its content.
   */
  clear: function () {
    this.camera.copy(this.EDITOR_CAMERA);
    this.deselect();
    AFRAME.scenes[0].innerHTML = '';
    Events.emit('inspectorcleared');
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
    this.addObject(entity.object3D);
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
  open: function () {
    this.sceneEl = AFRAME.scenes[0];
    this.opened = true;
    Events.emit('inspectormodechanged', true);

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
  },
  /**
   * Closes the editor and gives the control back to the scene
   * @return {[type]} [description]
   */
  close: function () {
    this.opened = false;
    Events.emit('inspectormodechanged', false);
    this.sceneEl.play();
    if (this.sceneEl.hasAttribute('aframe-inspector-removed-embedded')) {
      this.sceneEl.setAttribute('embedded', '');
      this.sceneEl.removeAttribute('aframe-inspector-removed-embedded');
    }
    document.body.classList.remove('aframe-inspector-opened');
    this.sceneEl.resize();
    Shortcuts.disable();
  },
  addObject: function (object) {
    var scope = this;
    object.traverse(child => {
      if (!child.el || !child.el.isInspector) {
        scope.addHelper(child, object);
      }
    });

    Events.emit('objectadded', object);
    Events.emit('scenegraphchanged');
  }
};

var inspector = new Inspector();
AFRAME.INSPECTOR = inspector;

var Modules = require('./modules/index.js'); // eslint-disable-line no-unused-vars

module.exports = inspector;
