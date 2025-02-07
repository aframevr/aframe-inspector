/* eslint-disable no-unused-vars */
import TransformControls from './TransformControls.js';
import EditorControls from './EditorControls.js';

import { copyCameraPosition } from './cameras';
import { initRaycaster } from './raycaster';
import Events from './Events';

/**
 * Transform controls stuff mostly.
 */
export function Viewport(inspector) {
  // Initialize raycaster and picking in differentpmodule.
  const mouseCursor = initRaycaster(inspector);
  const sceneEl = inspector.sceneEl;

  sceneEl.addEventListener('camera-set-active', (event) => {
    // If we're in edit mode, save the newly active camera and activate when exiting.
    if (inspector.opened) {
      inspector.cameras.original = event.detail.cameraEl;
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
    object.traverse((node) => {
      if (inspector.helpers[node.uuid] && inspector.helpers[node.uuid].update) {
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
  transformControls.addEventListener('objectChange', (evt) => {
    const object = transformControls.object;
    if (object === undefined) {
      return;
    }

    selectionBox.setFromObject(object);

    updateHelpers(object);

    // Emit update event for watcher.
    let component;
    let value;
    if (evt.mode === 'translate') {
      component = 'position';
      value = `${object.position.x} ${object.position.y} ${object.position.z}`;
    } else if (evt.mode === 'rotate') {
      component = 'rotation';
      const d = THREE.MathUtils.radToDeg;
      value = `${d(object.rotation.x)} ${d(object.rotation.y)} ${d(
        object.rotation.z
      )}`;
    } else if (evt.mode === 'scale') {
      component = 'scale';
      value = `${object.scale.x} ${object.scale.y} ${object.scale.z}`;
    }

    // We need to call setAttribute for component attrValue to be up to date,
    // so that entity.flushToDOM() works correctly when duplicating an entity.
    transformControls.object.el.setAttribute(component, value);

    Events.emit('entityupdate', {
      component: component,
      entity: transformControls.object.el,
      property: '',
      value: value
    });
  });

  transformControls.addEventListener('mouseDown', () => {
    controls.enabled = false;
  });

  transformControls.addEventListener('mouseUp', () => {
    controls.enabled = true;
  });

  sceneHelpers.add(transformControls);

  Events.on('entityupdate', (detail) => {
    const object = detail.entity.object3D;
    if (
      inspector.selected === object &&
      inspector.selectedEntity.object3DMap.mesh
    ) {
      selectionBox.setFromObject(inspector.selected);
    }
  });

  // Controls need to be added *after* main logic.
  const controls = new THREE.EditorControls(camera, inspector.container);
  controls.center.set(0, 1.6, 0);
  controls.rotationSpeed = 0.0035;
  controls.zoomSpeed = 0.05;
  controls.setAspectRatio(sceneEl.canvas.width / sceneEl.canvas.height);
  controls.addEventListener('change', () => {
    transformControls.update(true); // true is updateScale
    Events.emit('camerachanged');
  });

  Events.on('cameratoggle', (data) => {
    controls.setCamera(data.camera);
    transformControls.setCamera(data.camera);
    updateAspectRatio();
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

  Events.on('transformmodechange', (mode) => {
    transformControls.setMode(mode);
  });

  Events.on('translationsnapchanged', (dist) => {
    transformControls.setTranslationSnap(dist);
  });

  Events.on('rotationsnapchanged', (dist) => {
    transformControls.setRotationSnap(dist);
  });

  Events.on('transformspacechanged', (space) => {
    transformControls.setSpace(space);
  });

  Events.on('objectselect', (object) => {
    selectionBox.visible = false;
    transformControls.detach();
    if (object && object.el) {
      if (object.el.getObject3D('mesh')) {
        selectionBox.setFromObject(object);
        selectionBox.visible = true;
      } else if (object.el.hasAttribute('gltf-model')) {
        const listener = (event) => {
          if (event.target !== object.el) return; // we got an event for a child, ignore
          selectionBox.setFromObject(object);
          selectionBox.visible = true;
          object.el.removeEventListener('model-loaded', listener);
        };
        object.el.addEventListener('model-loaded', listener);
      }

      transformControls.attach(object);
    }
  });

  Events.on('objectfocus', (object) => {
    controls.focus(object);
  });

  Events.on('geometrychanged', (object) => {
    if (object !== null) {
      selectionBox.setFromObject(object);
    }
  });

  Events.on('entityupdate', (detail) => {
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
        selectionBox.setFromObject(object);
      }
    }

    transformControls.update();
    if (object instanceof THREE.PerspectiveCamera) {
      object.updateProjectionMatrix();
    }

    updateHelpers(object);
  });

  function updateAspectRatio() {
    if (!inspector.opened) return;
    // Modifying aspect for perspective camera is done by aframe a-scene.resize function
    // when the perspective camera is the active camera, so we actually do it a second time here,
    // but we need to modify it ourself when we switch from ortho camera to perspective camera (updateAspectRatio() is called in cameratoggle handler).
    const camera = inspector.camera;
    const aspect =
      inspector.container.offsetWidth / inspector.container.offsetHeight;
    if (camera.isPerspectiveCamera) {
      camera.aspect = aspect;
    } else if (camera.isOrthographicCamera) {
      const frustumSize = camera.top - camera.bottom;
      camera.left = (-frustumSize * aspect) / 2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
    }

    controls.setAspectRatio(aspect); // for zoom in/out to work correctly for orthographic camera
    camera.updateProjectionMatrix();

    const cameraHelper = inspector.helpers[camera.uuid];
    if (cameraHelper) cameraHelper.update();
  }

  inspector.sceneEl.addEventListener('rendererresize', updateAspectRatio);

  Events.on('gridvisibilitychanged', (showGrid) => {
    grid.visible = showGrid;
  });

  Events.on('togglegrid', () => {
    grid.visible = !grid.visible;
  });

  Events.on('inspectortoggle', (active) => {
    if (active) {
      enableControls();
      AFRAME.scenes[0].camera = inspector.camera;
      Array.prototype.slice
        .call(document.querySelectorAll('.a-enter-vr,.rs-base'))
        .forEach((element) => {
          element.style.display = 'none';
        });
      if (inspector.config.copyCameraPosition) {
        copyCameraPosition(
          inspector.cameras.original.object3D,
          inspector.cameras.perspective,
          controls
        );
      }
    } else {
      disableControls();
      inspector.cameras.original.setAttribute('camera', 'active', 'true');
      AFRAME.scenes[0].camera =
        inspector.cameras.original.getObject3D('camera');
      Array.prototype.slice
        .call(document.querySelectorAll('.a-enter-vr,.rs-base'))
        .forEach((element) => {
          element.style.display = 'block';
        });
    }
  });
}
