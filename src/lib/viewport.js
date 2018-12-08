/* global THREE CustomEvent */
import debounce from 'lodash.debounce';

/* eslint-disable no-unused-vars */
import TransformControls from './vendor/TransformControls.js';
import EditorControls from './EditorControls.js';
/* eslint-disable no-unused-vars */

import {getNumber} from './utils';
var Events = require('./Events');

function Viewport (inspector) {
  var container = {dom: inspector.container};

  var prevActiveCameraEl = inspector.currentCameraEl;
  inspector.sceneEl.addEventListener('camera-set-active', event => {
    if (inspector.opened) {
      // If we're in edit mode, save the newly active camera and activate when exiting.
      prevActiveCameraEl = event.detail.cameraEl;
    }
  });

  // helpers
  var sceneHelpers = inspector.sceneHelpers;
  var objects = [];

  var grid = new THREE.GridHelper(30, 60, 0x555555, 0x292929);

  sceneHelpers.add(grid);

  var camera = inspector.camera;

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
    if (inspector.helpers[object.id] !== undefined) {
      for (var objectId in inspector.helpers[object.id]) {
        inspector.helpers[object.id][objectId].update();
      }
    }
  }

  const transformControls = new THREE.TransformControls(camera, inspector.container);
  transformControls.addEventListener('objectChange', () => {
    const object = transformControls.object;
    if (object === undefined) { return; }

    selectionBox.setFromObject(object).update();

    updateHelpers(object);

    Events.emit('refreshsidebarobject3d', object);
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

  Events.on('entitychange', el => {
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
        var selected = false;
        for (var i = 0; i < intersects.length; i++) {
          var object = intersects[i].object;

          if (object.el && !object.el.getAttribute('visible')) {
            continue;
          }

          if (object.type === 'PerspectiveCamera' ||
              (object.el && object.el.getObject3D('camera')) ||
              object.parent.camera) {
            continue;
          }

          selected = true;

          if (object.userData.object !== undefined) {
            // helper
            inspector.selectEntity(object.userData.object.el);
          } else {
            inspector.selectEntity(object.el);
          }

          break;
        }

        if (!selected) {
          inspector.selectEntity(null);
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
      Events.emit('objectfocus', intersect.object);
    }
  }

  // controls need to be added *after* main logic,
  // otherwise controls.enabled doesn't work.
  var controls = new THREE.EditorControls(camera, inspector.container);
  controls.center.set(0, 1.6, 0);
	controls.rotationSpeed = 0.0035;
  controls.zoomSpeed = 0.05;

  function disableControls () {
    inspector.container.removeEventListener('mousedown', onMouseDown);
    inspector.container.removeEventListener('touchstart', onTouchStart);
    inspector.container.removeEventListener('dblclick', onDoubleClick);
    transformControls.dispose();
    controls.enabled = false;
  }

  function enableControls () {
    inspector.container.addEventListener('mousedown', onMouseDown, false);
    inspector.container.addEventListener('touchstart', onTouchStart, false);
    inspector.container.addEventListener('dblclick', onDoubleClick, false);
    transformControls.activate();
    controls.enabled = true;
  }
  enableControls();

  Events.on('inspectorcleared', () => {
    controls.center.set(0, 0, 0);
  });

  Events.on('transformmodechange', mode => {
    transformControls.setMode(mode);
  });

  Events.on('snapchanged', dist => {
    transformControls.setTranslationSnap(dist);
  });

  Events.on('transformspacechange', space => {
    transformControls.setSpace(space);
  });

  Events.on('objectselect', object => {
    selectionBox.visible = false;
    transformControls.detach();
    if (object && object.el) {
      if (object.el.getObject3D('mesh')) {
        selectionBox.setFromObject(object).update();
        selectionBox.visible = true;
      }

      transformControls.attach(object);
    }
  });

  Events.on('objectfocus', object => {
    controls.focus(object);
    ga('send', 'event', 'Viewport', 'selectEntity');
  });

  Events.on('geometrychanged', object => {
    if (object !== null) {
      selectionBox.setFromObject(object).update();
    }
  });

  Events.on('entityadd', object => {
    object.traverse(child => {
      if (objects.indexOf(child) === -1) {
        objects.push(child);
      }
    });
  });

  Events.on('entitychange', el => {
    const object = el.object3D;
    if (inspector.selected === object) {
      // Hack because object3D always has geometry :(
      if (object.geometry &&
          ((object.geometry.vertices && object.geometry.vertices.length > 0) ||
           (object.geometry.attributes && object.geometry.attributes.position && object.geometry.attributes.position.array.length))) {
        selectionBox.setFromObject(object).update();
      }
    }

    transformControls.update();
    if (object instanceof THREE.PerspectiveCamera) {
      object.updateProjectionMatrix();
    }

    updateHelpers(object);
  });

  Events.on('selectedentitycomponentchange', () => {
    Events.emit('entitychange', inspector.selectedEntity);
  });

  Events.on('objectremove', object => {
    object.traverse(child => {
      objects.splice(objects.indexOf(child), 1);
    });
  });
  Events.on('helperadded', helper => {
    objects.push(helper.getObjectByName('picker'));
    updateHelpers(helper.fromObject.parent);
  });
  Events.on('helperremove', object => {
    objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);
  });
  Events.on('windowresize', () => {
    camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
    camera.updateProjectionMatrix();
  });
  Events.on('gridvisibilitychanged', showGrid => {
    grid.visible = showGrid;
  });
  Events.on('togglegrid', () => {
    grid.visible = !grid.visible;
  });

  Events.on('inspectortoggle', active => {
    if (active) {
      enableControls();
      AFRAME.scenes[0].camera = inspector.camera;
      Array.prototype.slice.call(document.querySelectorAll('.a-enter-vr,.rs-base')).forEach(element => {
        element.style.display = 'none';
      });
    } else {
      disableControls();
      prevActiveCameraEl.setAttribute('camera', 'active', 'true');
      AFRAME.scenes[0].camera = prevActiveCameraEl.getObject3D('camera');
      Array.prototype.slice.call(document.querySelectorAll('.a-enter-vr,.rs-base')).forEach(element => {
        element.style.display = 'block';
      });
    }
    ga('send', 'event', 'Viewport', 'toggleEditor', active);
  });
}

module.exports = Viewport;
