/* global THREE CustomEvent */
import debounce from 'lodash.debounce';
import TransformControls from '../vendor/threejs/TransformControls.js';
import EditorControls from '../vendor/threejs/EditorControls.js';
import {getNumber} from '../utils';
var Events = require('../Events');

const gaTrackTransformEntity = debounce(transformMode => {
  ga('send', 'event', 'Viewport', 'transformEntity', transformMode);
}, 3000);

const gaTrackChangeEditorCamera = debounce(() => {
  ga('send', 'event', 'Viewport', 'changeEditorCamera');
}, 3000);

function Viewport (inspector) {
  var container = {
    dom: inspector.container
  };

  var prevActivedCameraEl = inspector.currentCameraEl;
  inspector.sceneEl.addEventListener('camera-set-active', event => {
    if (inspector.enabled) {
      // If we're in edit mode, just save the current active camera for later and activate again the editorCamera
      if (event.detail.cameraEl !== inspector.inspectorCameraEl) {
        prevActivedCameraEl = event.detail.cameraEl;
      }
      inspector.inspectorCameraEl.setAttribute('camera', 'active', 'true');
    }
  });

  // helpers
  var sceneHelpers = inspector.sceneHelpers;
  var objects = [];

  var grid = new THREE.GridHelper(30, 1);
  sceneHelpers.add(grid);

  var camera = inspector.inspectorCameraEl.getObject3D('camera');

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
  function updateHelpers (object) {
    for (var i = 0; i < object.children.length; i++) {
      var child = object.children[i];
      if (inspector.helpers[child.id] !== undefined) {
        inspector.helpers[child.id].update();
      }
    }
  }

  const transformControls = new THREE.TransformControls(camera, inspector.container);
  transformControls.addEventListener('change', () => {
    const object = transformControls.object;
    if (object === undefined) { return; }

    selectionBox.update(object);

    updateHelpers(object);

    const transformMode = transformControls.getMode();
    switch (transformMode) {
      case 'translate':
        object.el.setAttribute('position', {
          x: getNumber(object.position.x),
          y: getNumber(object.position.y),
          z: getNumber(object.position.z)
        });
        break;
      case 'rotate':
        object.el.setAttribute('rotation', {
          x: THREE.Math.radToDeg(getNumber(object.rotation.x)),
          y: THREE.Math.radToDeg(getNumber(object.rotation.y)),
          z: THREE.Math.radToDeg(getNumber(object.rotation.z))
        });
        break;
      case 'scale':
        object.el.setAttribute('scale', {
          x: getNumber(object.scale.x),
          y: getNumber(object.scale.y),
          z: getNumber(object.scale.z)
        });
        break;
    }
    Events.emit('refreshSidebarObject3D', object);
    gaTrackTransformEntity(transformMode);
  });

  transformControls.addEventListener('mouseDown', () => {
    var object = transformControls.object;

    objectPositionOnDown = object.position.clone();
    objectRotationOnDown = object.rotation.clone();
    objectScaleOnDown = object.scale.clone();

    controls.enabled = false;
  });

  transformControls.addEventListener('mouseUp', () => {
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
    if (!inspector.selected) {
      // if (!inspector.selected || inspector.selected.el.helper) {
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

  Events.on('objectChanged', () => {
    if (inspector.selectedEntity.object3DMap['mesh']) {
      selectionBox.update(inspector.selected);
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
          inspector.selectEntity(object.userData.object.el);
        } else {
          inspector.selectEntity(object.el);
        }
      } else {
        inspector.selectEntity(null);
      }
    }
  }

  function onMouseDown (event) {
    if (event instanceof CustomEvent) {
      return;
    }

    event.preventDefault();

    var array = getMousePosition(inspector.container, event.clientX, event.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('mouseup', onMouseUp, false);
  }

  function onMouseUp (event) {
    if (event instanceof CustomEvent) {
      return;
    }

    var array = getMousePosition(inspector.container, event.clientX, event.clientY);
    onUpPosition.fromArray(array);
    handleClick();

    document.removeEventListener('mouseup', onMouseUp, false);
  }

  function onTouchStart (event) {
    var touch = event.changedTouches[ 0 ];
    var array = getMousePosition(inspector.container, touch.clientX, touch.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('touchend', onTouchEnd, false);
  }

  function onTouchEnd (event) {
    var touch = event.changedTouches[ 0 ];
    var array = getMousePosition(inspector.container, touch.clientX, touch.clientY);
    onUpPosition.fromArray(array);
    handleClick();
    document.removeEventListener('touchend', onTouchEnd, false);
  }

  function onDoubleClick (event) {
    var array = getMousePosition(inspector.container, event.clientX, event.clientY);
    onDoubleClickPosition.fromArray(array);

    var intersects = getIntersects(onDoubleClickPosition, objects);

    if (intersects.length > 0) {
      var intersect = intersects[ 0 ];
      Events.emit('objectFocused', intersect.object);
    }
  }

  // controls need to be added *after* main logic,
  // otherwise controls.enabled doesn't work.
  var controls = new THREE.EditorControls(camera, inspector.container);

  function disableControls () {
    inspector.container.removeEventListener('mousedown', onMouseDown);
    inspector.container.removeEventListener('touchstart', onTouchStart);
    inspector.container.removeEventListener('dblclick', onDoubleClick);
    controls.enabled = false;
  }

  function enableControls () {
    inspector.container.addEventListener('mousedown', onMouseDown, false);
    inspector.container.addEventListener('touchstart', onTouchStart, false);
    inspector.container.addEventListener('dblclick', onDoubleClick, false);
    controls.enabled = true;
  }
  enableControls();

  controls.addEventListener('change', () => {
    transformControls.update();
    gaTrackChangeEditorCamera();
    // inspector.signals.cameraChanged.dispatch(camera);
  });

  Events.on('inspectorCleared', () => {
    controls.center.set(0, 0, 0);
  });

  Events.on('transformModeChanged', mode => {
    transformControls.setMode(mode);
  });

  Events.on('snapChanged', dist => {
    transformControls.setTranslationSnap(dist);
  });

  Events.on('spaceChanged', space => {
    transformControls.setSpace(space);
  });

  Events.on('objectSelected', object => {
    selectionBox.visible = false;
    transformControls.detach();
    if (object && object.el) {
      if (object.el.getObject3D('mesh')) {
        selectionBox.update(object);
        selectionBox.visible = true;
      }

      transformControls.attach(object);
    }
  });

  Events.on('objectFocused', object => {
    controls.focus(object);
    ga('send', 'event', 'Viewport', 'selectEntity');
  });

  Events.on('geometryChanged', object => {
    if (object !== null) {
      selectionBox.update(object);
    }
  });

  Events.on('objectAdded', object => {
    object.traverse(child => {
      objects.push(child);
    });
  });

  Events.on('objectChanged', object => {
    if (inspector.selected === object) {
      // Hack because object3D always has geometry :(
      if (object.geometry && object.geometry.vertices && object.geometry.vertices.length > 0) {
        selectionBox.update(object);
      }
      // transformControls.update();
    }

    transformControls.update();
    if (object instanceof THREE.PerspectiveCamera) {
      object.updateProjectionMatrix();
    }

    updateHelpers(object);
  });

  Events.on('selectedEntityComponentChanged', () => {
    Events.emit('objectChanged', inspector.selectedEntity.object3D);
  });

  Events.on('objectRemoved', object => {
    object.traverse(child => {
      objects.splice(objects.indexOf(child), 1);
    });
  });
  Events.on('helperAdded', object => {
    objects.push(object.getObjectByName('picker'));
  });
  Events.on('helperRemoved', object => {
    objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);
  });
  Events.on('windowResize', () => {
    camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
    camera.updateProjectionMatrix();
    // renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
  });
  Events.on('showGridChanged', showGrid => {
    grid.visible = showGrid;
  });

  Events.on('inspectorModeChanged', active => {
    if (active) {
      enableControls();
      inspector.inspectorCameraEl.setAttribute('camera', 'active', 'true');
      Array.prototype.slice.call(document.querySelectorAll('.a-enter-vr,.rs-base')).forEach(element => {
        element.style.display = 'none';
      });
    } else {
      disableControls();
      prevActivedCameraEl.setAttribute('camera', 'active', 'true');
      Array.prototype.slice.call(document.querySelectorAll('.a-enter-vr,.rs-base')).forEach(element => {
        element.style.display = 'block';
      });
    }
    ga('send', 'event', 'Viewport', 'toggleEditor', active);
  });
}

module.exports = Viewport;
