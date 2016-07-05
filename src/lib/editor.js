var Events = require('./Events');
var Viewport = require('./viewport/index.js');
var ComponentLoader = require('./componentloader.js');
var ShaderLoader = require('./shaderloader.js');

function Editor () {
  this.enabled = false;
  // Detect if the scene is already loaded
  if (document.readyState === 'complete' || document.readyState === 'loaded') {
    this.onDomLoaded();
  } else {
    document.addEventListener('DOMContentLoaded', this.onDomLoaded.bind(this));
  }
}

Editor.prototype = {
  /**
   * Callback once the DOM is completely loaded so we could query the scene
   */
  onDomLoaded: function () {
    this.componentLoader = new ComponentLoader();
    this.shaderLoader = new ShaderLoader();

    this.sceneEl = document.querySelector('a-scene');
    if (this.sceneEl.hasLoaded) {
      this.onSceneLoaded();
    } else {
      this.sceneEl.addEventListener('loaded', this.onSceneLoaded.bind(this));
    }
  },

  onSceneLoaded: function () {
    this.container = document.querySelector('.a-canvas');
    this.currentCameraEl = document.querySelector('[camera]');

    this.editorCameraEl = document.createElement('a-entity');
    this.editorCameraEl.isEditor = true;
    this.editorCameraEl.addEventListener('loaded', function(entity) {
      this.DEFAULT_CAMERA = this.editorCameraEl.getObject3D('camera');
      this.initUI();
    }.bind(this));
    this.editorCameraEl.setAttribute('camera', {far: 10000, fov: 50, near: 1, active: true});
    document.querySelector('a-scene').appendChild(this.editorCameraEl);
  },

  initUI: function () {
    this.DEFAULT_CAMERA.position.set(20,10,20);
    this.DEFAULT_CAMERA.lookAt(new THREE.Vector3());
    this.DEFAULT_CAMERA.updateMatrixWorld();

    this.camera = this.DEFAULT_CAMERA;

    this.initEvents();

    this.selected = null;
    //this.dialogs = new Dialogs(this);
    //!!!this.panels = new Panels(this);

    window.dispatchEvent(new Event('editor-loaded'));

    this.scene = this.sceneEl.object3D;
    this.helpers = {};
    this.sceneHelpers = new THREE.Scene();
    this.sceneHelpers.visible = true; //false;
    this.editorActive = false;

    this.viewport = new Viewport(this);
    Events.emit('windowResize');

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

    document.addEventListener('model-loaded', function(event){
      this.addObject(event.target.object3D);
    }.bind(this));

    this.scene.add(this.sceneHelpers);

    this.enable();
  },
/*
  removeObject: function (object) {
    if (object.parent === null) return; // avoid deleting the camera or scene

    var scope = this;

    object.traverse(function (child) {
      scope.removeHelper(child);
    });

    object.parent.remove(object);

    Events.emit('objectRemoved', object);
    Events.emit('sceneGraphChanged');
  },
*/
  addHelper: (function () {
    var geometry = new THREE.SphereBufferGeometry(2, 4, 2);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

    return function (object) {
      var helper;
      if (object instanceof THREE.Camera) {
        helper = new THREE.CameraHelper(object, 1);
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

      var picker = new THREE.Mesh(geometry, material);
      picker.name = 'picker';
      picker.userData.object = object;
      helper.add(picker);

      this.sceneHelpers.add(helper);
      this.helpers[ object.id ] = helper;

      Events.emit('helperAdded', helper);
    };
  })(),

  removeHelper: function (object) {
    if (this.helpers[ object.id ] !== undefined) {
      var helper = this.helpers[ object.id ];
      helper.parent.remove(helper);

      delete this.helpers[ object.id ];

      Events.emit('helperRemoved', helper);
    }
  },

  selectEntity: function (entity, emit) {
    this.selectedEntity = entity;
    if (entity) {
      this.select(entity.object3D);
    } else {
      this.select(null);
    }

    if (emit === undefined)
      Events.emit('entitySelected', entity);
  },
  initEvents: function () {
    Events.on('entitySelected', function(entity){
      this.selectEntity(entity, false);
    }.bind(this));

    Events.on('editorModeChanged', function(active){
      this.editorActive = active;
      this.sceneHelpers.visible = this.editorActive;
    }.bind(this));

    Events.on('createNewEntity', function(definition){
      this.createNewEntity(definition);
    }.bind(this));

/*
    window.addEventListener('resize', Events.emit('windowResize'), false);

    Events.emit('showModal');//.add(function (content) {
      this.panels.modal.show(content);
    }.bind(this));
    Events.emit('hideModal');//.add(function () {
      this.panels.modal.hide();
    }.bind(this));

    var entities = document.querySelectorAll('a-entity');
    for (var i = 0; i < entities.length; ++i) {
      var entity = entities[i];
      entity.addEventListener('componentchanged',
        function (evt) {
          if (this.selected && evt.srcElement === this.selected.el) {
            aframeEditor.editor.emit('componentChanged',evt);
          }
        }.bind(this));
    }
*/
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
    Events.emit('objectSelected', object);
  },

  deselect: function () {
    this.select(null);
  },

  clear: function () {
    this.camera.copy(this.DEFAULT_CAMERA);
    this.deselect();
    document.querySelector('a-scene').innerHTML = '';
    Events.emit('editorCleared');
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
    entity.addEventListener('loaded', function () {
      editor.addEntity(entity);
    });

    editor.sceneEl.appendChild(entity);

    return entity;
  },
  addEntity: function (entity) {
    this.addObject(entity.object3D);
    this.selectEntity(entity);
  },

  enable: function () {
//    this.panels.sidebar.show();
//    this.panels.menubar.show();
    this.enabled = true;
    Events.emit('editorModeChanged', true);
    this.sceneEl.pause();
  },

  disable: function () {
//    this.panels.sidebar.hide();
//    this.panels.menubar.hide();
    this.enabled = false;
    Events.emit('editorModeChanged', false);
    this.sceneEl.play();
  // @todo Removelisteners
  },

  addObject: function (object) {
    var scope = this;
    object.traverse(function (child) {
      if (!child.el || !child.el.isEditor) {
        scope.addHelper(child);
      }
    });

    Events.emit('objectAdded', object);
    Events.emit('sceneGraphChanged');
  }
};

module.exports = Editor;
