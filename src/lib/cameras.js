import Events from './Events';

/**
 * Initialize various cameras, store original one.
 */
export function initCameras (inspector) {
  const originalCamera = inspector.currentCameraEl = inspector.sceneEl.camera.el;
  inspector.currentCameraEl.setAttribute(
    'data-aframe-inspector-original-camera',
    ''
  );

  // If the current camera is the default, we should prevent AFRAME from
  // remove it once when we inject the editor's camera.
  if (inspector.currentCameraEl.hasAttribute('data-aframe-default-camera')) {
    inspector.currentCameraEl.removeAttribute('data-aframe-default-camera');
    inspector.currentCameraEl.setAttribute(
      'data-aframe-inspector',
      'default-camera'
    );
  }

  inspector.currentCameraEl.setAttribute('camera', 'active', false);

  // Create Inspector camera.
  const perspectiveCamera = inspector.camera = new THREE.PerspectiveCamera();
  perspectiveCamera.far = 10000;
  perspectiveCamera.near = 0.01;
  perspectiveCamera.position.set(0, 1.6, 2);
  perspectiveCamera.lookAt(new THREE.Vector3(0, 1.6, -1));
  perspectiveCamera.updateMatrixWorld();
  inspector.sceneEl.object3D.add(perspectiveCamera);
  inspector.sceneEl.camera = perspectiveCamera;

  const orthoCamera = new THREE.OrthographicCamera(-10, 10, 10, -10);
  inspector.sceneEl.object3D.add(orthoCamera);

  const cameras = inspector.cameras = {
    perspective: perspectiveCamera,
    original: originalCamera,
    ortho: orthoCamera
  };

  Events.on('cameraperspectivetoggle', () => {
    inspector.sceneEl.camera = inspector.camera = cameras.perspective;
    Events.emit('cameratoggle', inspector.camera);
  });

  Events.on('cameraorthographictoggle', dir => {
    inspector.sceneEl.camera = inspector.camera = cameras.ortho;
    if (dir === 'left') {
      cameras.ortho.position.set(-10, 0, 0);
    } else if (dir === 'right') {
      cameras.ortho.position.set(10, 0, 0);
    } else if (dir === 'top') {
      cameras.ortho.position.set(0, 10, 0);
    } else if (dir === 'bottom') {
      cameras.ortho.position.set(0, -10, 0);
    } else if (dir === 'back') {
      cameras.ortho.position.set(0, 0, -10);
    } else if (dir === 'front') {
      cameras.ortho.position.set(0, 0, 10);
    }
    cameras.ortho.lookAt(0, 0, 0);
    Events.emit('cameratoggle', inspector.camera);
  });

  return inspector.cameras;
};
