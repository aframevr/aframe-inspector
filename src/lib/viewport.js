/* global THREE CustomEvent */
import debounce from 'lodash.debounce';

/* eslint-disable no-unused-vars */
import TransformControls from './TransformControls.js';
import EditorControls from './EditorControls.js';
/* eslint-disable no-unused-vars */

import { initRaycaster } from './raycaster';

import { getNumber } from './utils';
const Events = require('./Events');

/**
 * Transform controls stuff mostly.
 */
function Viewport(inspector) {
  // Initialize raycaster and picking in differentpmodule.
  const mouseCursor = initRaycaster(inspector);
  const sceneEl = inspector.sceneEl;

  let originalCamera = inspector.cameras.original;
  sceneEl.addEventListener('camera-set-active', event => {
    // If we're in edit mode, save the newly active camera and activate when exiting.
    if (inspector.opened) {
      originalCamera = event.detail.cameraEl;
    }
  });

  // Helpers.
  const sceneHelpers = inspector.sceneHelpers;
  const grid = new THREE.GridHelper(30, 60, 0xaaaaaa, 0x262626);
  sceneHelpers.add(grid);

  const selectionBox = new THREE.BoxHelper();
  selectionBox.material.depthTest = false;
  selectionBox.material.transparent = true;
  selectionBox.material.color.set(0x1faaf2);
  selectionBox.visible = false;
  sceneHelpers.add(selectionBox);

  function updateHelpers(object) {
    object.traverse(node => {
      if (inspector.helpers[node.uuid]) {
        inspector.helpers[node.uuid].update();
      }
    });
  }

  const camera = inspector.camera;
  const transformControls = new THREE.TransformControls(
    camera,
    inspector.container
  );
  transformControls.size = 0.75;
  transformControls.addEventListener('objectChange', evt => {
    const object = transformControls.object;
    if (object === undefined) {
      return;
    }

    selectionBox.setFromObject(object).update();

    updateHelpers(object);

    Events.emit('refreshsidebarobject3d', object);

    // Emit update event for watcher.
    let component;
    let value;
    if (evt.mode === 'translate') {
      component = 'position';
      value = `${object.position.x} ${object.position.y} ${object.position.z}`;
    } else if (evt.mode === 'rotate') {
      component = 'rotation';
      const d = THREE.Math.radToDeg;
      value = `${d(object.rotation.x)} ${d(object.rotation.y)} ${d(
        object.rotation.z
      )}`;
    } else if (evt.mode === 'scale') {
      component = 'scale';
      value = `${object.scale.x} ${object.scale.y} ${object.scale.z}`;
    }
    Events.emit('entityupdate', {
      component: component,
      entity: transformControls.object.el,
      property: '',
      value: value
    });

    Events.emit('entitytransformed', transformControls.object.el);
  });

  transformControls.addEventListener('mouseDown', () => {
    controls.enabled = false;
  });

  transformControls.addEventListener('mouseUp', () => {
    controls.enabled = true;
  });

  sceneHelpers.add(transformControls);

  Events.on('entityupdate', detail => {
    if (inspector.selectedEntity.object3DMap['mesh']) {
      selectionBox.update(inspector.selected);
    }
  });

  // Controls need to be added *after* main logic.
  const controls = new THREE.EditorControls(camera, inspector.container);
  controls.center.set(0, 1.6, 0);
  controls.rotationSpeed = 0.0035;
  controls.zoomSpeed = 0.05;
  controls.setAspectRatio(sceneEl.canvas.width / sceneEl.canvas.height);

  Events.on('cameratoggle', data => {
    controls.setCamera(data.camera);
    transformControls.setCamera(data.camera);
  });

  function disableControls() {
    mouseCursor.disable();
    transformControls.dispose();
    controls.enabled = false;
  }

  function enableControls() {
    mouseCursor.enable();
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

  Events.on('transformspacechanged', space => {
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
    transformControls.update();
  });

  Events.on('geometrychanged', object => {
    if (object !== null) {
      selectionBox.setFromObject(object).update();
    }
  });

  Events.on('entityupdate', detail => {
    const object = detail.entity.object3D;
    if (inspector.selected === object) {
      // Hack because object3D always has geometry :(
      if (
        object.geometry &&
        ((object.geometry.vertices && object.geometry.vertices.length > 0) ||
          (object.geometry.attributes &&
            object.geometry.attributes.position &&
            object.geometry.attributes.position.array.length))
      ) {
        selectionBox.setFromObject(object).update();
      }
    }

    transformControls.update();
    if (object instanceof THREE.PerspectiveCamera) {
      object.updateProjectionMatrix();
    }

    updateHelpers(object);
  });

  Events.on('windowresize', () => {
    camera.aspect =
      inspector.container.offsetWidth / inspector.container.offsetHeight;
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
      Array.prototype.slice
        .call(document.querySelectorAll('.a-enter-vr,.rs-base'))
        .forEach(element => {
          element.style.display = 'none';
        });
    } else {
      disableControls();
      inspector.cameras.original.setAttribute('camera', 'active', 'true');
      AFRAME.scenes[0].camera = inspector.cameras.original.getObject3D('camera');
      Array.prototype.slice
        .call(document.querySelectorAll('.a-enter-vr,.rs-base'))
        .forEach(element => {
          element.style.display = 'block';
        });
    }
    ga('send', 'event', 'Viewport', 'toggleEditor', active);
  });
}

module.exports = Viewport;
