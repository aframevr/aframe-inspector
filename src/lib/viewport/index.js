/* global aframeEditor THREE CustomEvent */
var TransformControls = require('../vendor/threejs/TransformControls.js');
var EditorControls = require('../vendor/threejs/EditorControls.js');
var Events = require('../Events');
var getNumber = require('../utils').getNumber;

function Viewport (editor) {
  var container = {
    dom: editor.container
  };

  var prevActivedCameraEl = editor.currentCameraEl;
  editor.sceneEl.addEventListener('camera-set-active', function(event){
    if (editor.enabled) {
      // If we're in edit mode, just save the current active camera for later and activate again the editorCamera
      if (event.detail.cameraEl !== editor.editorCameraEl) {
        prevActivedCameraEl = event.detail.cameraEl;
      }
      editor.editorCameraEl.setAttribute('camera', 'active', 'true');
    }
  });

  // helpers
  var sceneHelpers = editor.sceneHelpers;
  var objects = [];

  var grid = new THREE.GridHelper(30, 1);
  sceneHelpers.add(grid);

  var camera = editor.editorCameraEl.getObject3D('camera');

  var selectionBox = new THREE.BoxHelper();
  selectionBox.material.depthTest = false;
  selectionBox.material.transparent = true;
  selectionBox.material.color.set(0x1faaf2);
  selectionBox.visible = false;
  sceneHelpers.add(selectionBox);

  var objectPositionOnDown = null;
  var objectRotationOnDown = null;
  var objectScaleOnDown = null;

  /**
   * Update the helpers of the object and it childrens
   * @param  {object3D} object Object to update
   */
  function updateHelpers(object) {
    for (var i = 0; i < object.children.length; i++) {
      var child = object.children[ i ];
      if (editor.helpers[ child.id ] !== undefined) {
        editor.helpers[ child.id ].update();
      }
    }
  }

  var transformControls = new THREE.TransformControls(camera, editor.container);
  transformControls.addEventListener('change', function () {
    var object = transformControls.object;
    if (object !== undefined) {
      var objectId = object.id;

      selectionBox.update(object);

      updateHelpers(object);

      switch (transformControls.getMode()) {
        case 'translate':
          object.el.setAttribute('position', {x: getNumber(object.position.x), y: getNumber(object.position.y), z: getNumber(object.position.z)});
          break;
        case 'rotate':
          object.el.setAttribute('rotation', {
            x: THREE.Math.radToDeg(getNumber(object.rotation.x)),
            y: THREE.Math.radToDeg(getNumber(object.rotation.y)),
            z: THREE.Math.radToDeg(getNumber(object.rotation.z))});
          break;
        case 'scale':
          object.el.setAttribute('scale', {x: getNumber(object.scale.x), y: getNumber(object.scale.y), z: getNumber(object.scale.z)});
          break;
      }
      Events.emit('refreshSidebarObject3D',object);
    }
  });

  transformControls.addEventListener('mouseDown', function () {
    var object = transformControls.object;

    objectPositionOnDown = object.position.clone();
    objectRotationOnDown = object.rotation.clone();
    objectScaleOnDown = object.scale.clone();

    controls.enabled = false;
  });

  transformControls.addEventListener('mouseUp', function () {
    var object = transformControls.object;
    if (object !== null) {
      switch (transformControls.getMode()) {
        case 'translate':

          if (!objectPositionOnDown.equals(object.position)) {
            // @todo
          }
          break;

        case 'rotate':
          if (!objectRotationOnDown.equals(object.rotation)) {
            // @todo
          }
          break;

        case 'scale':
          if (!objectScaleOnDown.equals(object.scale)) {
            // @todo
          }
          break;
      }
    }
    controls.enabled = true;
  });

  sceneHelpers.add(transformControls);
/*
  signals.objectSelected.add(function (object) {
    selectionBox.visible = false;
    if (!editor.selected) {
      // if (!editor.selected || editor.selected.el.helper) {
      return;
    }

    if (object !== null) {
      if (object.geometry !== undefined &&
        object instanceof THREE.Sprite === false) {
        selectionBox.update(object);
        selectionBox.visible = true;
      }

      transformControls.attach(object);
    }
  });
*/


  Events.on('objectChanged',function () {
    if (editor.selectedEntity.object3DMap['mesh']) {
      selectionBox.update(editor.selected);
    }
  });

  // object picking
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // events
  function getIntersects (point, objects) {
    mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(objects);
  }

  var onDownPosition = new THREE.Vector2();
  var onUpPosition = new THREE.Vector2();
  var onDoubleClickPosition = new THREE.Vector2();

  function getMousePosition (dom, x, y) {
    var rect = dom.getBoundingClientRect();
    return [ (x - rect.left) / rect.width, (y - rect.top) / rect.height ];
  }

  function handleClick () {
    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      var intersects = getIntersects(onUpPosition, objects);
      if (intersects.length > 0) {
        var object = intersects[ 0 ].object;
        if (object.userData.object !== undefined) {
          // helper
          editor.selectEntity(object.userData.object.el);
        } else {
          editor.selectEntity(object.el);
        }
      } else {
        editor.selectEntity(null);
      }
    }
  }

  function onMouseDown (event) {
    if (event instanceof CustomEvent) {
      return;
    }

    event.preventDefault();

    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('mouseup', onMouseUp, false);
  }

  function onMouseUp (event) {
    if (event instanceof CustomEvent) {
      return;
    }

    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onUpPosition.fromArray(array);
    handleClick();

    document.removeEventListener('mouseup', onMouseUp, false);
  }

  function onTouchStart (event) {
    var touch = event.changedTouches[ 0 ];
    var array = getMousePosition(editor.container, touch.clientX, touch.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('touchend', onTouchEnd, false);
  }

  function onTouchEnd (event) {
    var touch = event.changedTouches[ 0 ];
    var array = getMousePosition(editor.container, touch.clientX, touch.clientY);
    onUpPosition.fromArray(array);
    handleClick();
    document.removeEventListener('touchend', onTouchEnd, false);
  }

  function onDoubleClick (event) {
    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onDoubleClickPosition.fromArray(array);

    var intersects = getIntersects(onDoubleClickPosition, objects);

    if (intersects.length > 0) {
      var intersect = intersects[ 0 ];
      Events.emit('objectFocused',intersect.object);
    }
  }

  editor.container.addEventListener('mousedown', onMouseDown, false);
  editor.container.addEventListener('touchstart', onTouchStart, false);
  editor.container.addEventListener('dblclick', onDoubleClick, false);

  // controls need to be added *after* main logic,
  // otherwise controls.enabled doesn't work.

  var controls = new THREE.EditorControls(camera, editor.container);
  controls.addEventListener('change', function () {
    transformControls.update();
    // editor.signals.cameraChanged.dispatch(camera);
  });

  Events.on('editorCleared', function () {
    controls.center.set(0, 0, 0);
  });

  Events.on('transformModeChanged', function (mode) {
    transformControls.setMode(mode);
  });

  Events.on('snapChanged', function (dist) {
    transformControls.setTranslationSnap(dist);
  });

  Events.on('spaceChanged', function (space) {
    transformControls.setSpace(space);
  });

  Events.on('objectSelected', function (object) {
    selectionBox.visible = false;
    transformControls.detach();
    if (object !== null) {
      selectionBox.update(object);
      selectionBox.visible = true;

      transformControls.attach(object);
    }
  });

  Events.on('objectFocused', function (object) {
    controls.focus(object);
  });

  Events.on('geometryChanged', function (object) {
    if (object !== null) {
      selectionBox.update(object);
    }
  });

  Events.on('objectAdded', function (object) {
    object.traverse(function (child) {
      objects.push(child);
    });
  });

  Events.on('objectChanged', function (object) {
    if (editor.selected === object) {
      // Hack because object3D always has geometry :(
      if (object.geometry && object.geometry.vertices && object.geometry.vertices.length > 0) {
        selectionBox.update(object);
      }
      //transformControls.update();
    }

    transformControls.update();
    if (object instanceof THREE.PerspectiveCamera) {
      object.updateProjectionMatrix();
    }

    updateHelpers(object);
  });
  Events.on('componentChanged', function(e){

  });

  Events.on('objectRemoved', function (object) {
    object.traverse(function (child) {
      objects.splice(objects.indexOf(child), 1);
    });
  });
  Events.on('helperAdded', function (object) {
    objects.push(object.getObjectByName('picker'));
  });
  Events.on('helperRemoved', function (object) {
    objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);
  });
  Events.on('windowResize', function () {
    camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
    camera.updateProjectionMatrix();
    // renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
  });
  Events.on('showGridChanged', function (showGrid) {
    grid.visible = showGrid;
  });

  Events.on('editorModeChanged', function (active) {
    if (active) {
      editor.editorCameraEl.setAttribute('camera', 'active', 'true');
      document.querySelectorAll('.a-enter-vr,.rs-base').forEach(function(element){
        element.style.display = 'none';
      });
    } else {
      prevActivedCameraEl.setAttribute('camera', 'active', 'true');
      document.querySelectorAll('.a-enter-vr,.rs-base').forEach(function(element){
        element.style.display = 'block';
      });
    }
  });
}

module.exports = Viewport;
